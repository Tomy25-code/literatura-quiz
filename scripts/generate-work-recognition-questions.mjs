/**
 * generate-work-recognition-questions.mjs
 *
 * Generates src/data/questions.recognition.json from works.json and authors.json only.
 * No invented facts — every clue is sourced directly from work.themes or work.motifs.
 *
 * Three question templates (all produce type: "multiple_choice", category: "work_recognition"):
 *
 *   T1 (theme pair)  — "Кое произведение се свързва с темите „{t1}" и „{t2}"?"
 *   T2 (motif pair)  — "За коя творба са характерни мотивите за {m1} и {m2}?"
 *   T3 (essay theme) — "Коя творба е подходяща за интерпретативно съчинение
 *                        върху темата за „{theme}"?"
 *
 * Clue uniqueness guarantee:
 *   A clue is accepted only if no other work in works.json shares the same clue value(s).
 *   For pairs: no other work must contain BOTH elements in the same field.
 *   For T3 single theme: no other work may contain that exact theme string.
 *   Additionally, pairs where one member is a substring of the other are skipped
 *   (prevents semantically redundant clues like "свободата" + "пътят към свободата").
 *
 * Distractor rules:
 *   - Four options total: correct work title + 3 distractors.
 *   - Distractors prefer works by different authors.
 *   - Distractors that share all clue values in the same field are excluded.
 *   - Selection is deterministic (hash-seeded, sorted by work ID before rotation).
 *
 * ID prefix: qr-  (theme → qr-theme-{workId}, motif → qr-motif-{workId}, essay → qr-essay-{workId})
 * Max per work: 3 (one per template type).
 *
 * Run: node scripts/generate-work-recognition-questions.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const root  = resolve(__dir, '..');

function load(rel) {
  return JSON.parse(readFileSync(resolve(root, rel), 'utf8'));
}

const authors  = load('src/data/authors.json');
const works    = load('src/data/works.json');
const authorMap = new Map(authors.map(a => [a.id, a]));

// ── Deterministic helpers ──────────────────────────────────────────────────────

function hash32(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h * 33) ^ str.charCodeAt(i)) >>> 0;
  }
  return h;
}

// Returns `n` items from `arr` starting at a hash-derived offset (sorted first for stability).
function hashSlice(arr, n, saltKey) {
  if (arr.length === 0) return [];
  const sorted = [...arr].sort((a, b) => a.id.localeCompare(b.id));
  const start  = hash32(saltKey) % sorted.length;
  const result = [];
  for (let i = 0; i < sorted.length && result.length < n; i++) {
    result.push(sorted[(start + i) % sorted.length]);
  }
  return result;
}

// ── Clue-uniqueness helpers ────────────────────────────────────────────────────

// Returns true when no OTHER work in `allWorks` contains ALL values from `clueValues`
// in its `fieldName` array.
function isPairUnique(work, clueValues, fieldName, allWorks) {
  return allWorks.every(w => {
    if (w.id === work.id) return true;
    const field = w[fieldName] || [];
    return !clueValues.every(v => field.includes(v));
  });
}

// Finds the first pair [v1, v2] from work[fieldName] where:
//  - The pair is unique across all works (see isPairUnique)
//  - Neither member is a substring of the other (avoids nested clues)
//  - Combined length ≥ minCombinedLen (ensures specificity)
function findUniquePair(work, fieldName, allWorks, minCombinedLen = 0) {
  const vals = work[fieldName] || [];
  for (let i = 0; i < vals.length - 1; i++) {
    for (let j = i + 1; j < vals.length; j++) {
      const v1 = vals[i], v2 = vals[j];
      if (v1.includes(v2) || v2.includes(v1)) continue; // semantically nested
      if (v1.length + v2.length < minCombinedLen)       continue;
      if (isPairUnique(work, [v1, v2], fieldName, allWorks)) return [v1, v2];
    }
  }
  return null;
}

// For T3: find the first theme that is ≥ MIN_ESSAY_LEN chars, starts with a
// lowercase Bulgarian letter (filters out proper-noun themes), and is unique
// across all works.
const MIN_ESSAY_LEN = 30;

function findEssayTheme(work, allWorks) {
  for (const theme of (work.themes || [])) {
    if (theme.length < MIN_ESSAY_LEN)   continue;
    if (!/^[а-я]/.test(theme))          continue; // starts lowercase Bulgarian
    const isUnique = allWorks.every(w =>
      w.id === work.id || !(w.themes || []).includes(theme)
    );
    if (isUnique) return theme;
  }
  return null;
}

// ── Distractor selection ───────────────────────────────────────────────────────

function pickDistractors(correctWork, clueValues, clueField, saltSuffix) {
  const candidates = works.filter(w => {
    if (w.id === correctWork.id) return false;
    // Exclude works where ALL clue values also appear (would be ambiguous correct answers)
    const field = w[clueField] || [];
    if (clueValues.length >= 2 && clueValues.every(v => field.includes(v))) return false;
    return true;
  });

  const cross   = candidates.filter(w => w.authorId !== correctWork.authorId);
  const same    = candidates.filter(w => w.authorId === correctWork.authorId);
  const saltKey = `${correctWork.id}-${saltSuffix}`;

  let picked = hashSlice(cross, 3, saltKey + '-c');
  if (picked.length < 3) {
    picked.push(...hashSlice(same, 3 - picked.length, saltKey + '-s'));
  }
  return picked.slice(0, 3).map(w => w.title);
}

// Place the correct answer at a deterministic position within the 4 options.
function buildOptions(correctTitle, distractors, posKey) {
  const pos  = hash32(posKey) % 4;
  const opts = [...distractors];
  opts.splice(pos, 0, correctTitle);
  return opts.slice(0, 4);
}

// ── Main generation loop ───────────────────────────────────────────────────────

const generated = [];
const counts    = { theme: 0, motif: 0, essay: 0 };
const skipped   = {}; // workId → [reasons]

function noteSkip(workId, reason) {
  skipped[workId] = skipped[workId] || [];
  skipped[workId].push(reason);
}

for (const work of works) {
  const author = authorMap.get(work.authorId);
  if (!author) { noteSkip(work.id, 'missing-author'); continue; }

  // ── T1: Theme pair ──────────────────────────────────────────────────────────
  const themePair = findUniquePair(work, 'themes', works, 20);
  if (themePair) {
    const [t1, t2]   = themePair;
    const question   = `Кое произведение се свързва с темите „${t1}" и „${t2}"?`;
    const distractors = pickDistractors(work, [t1, t2], 'themes', 'theme');
    const options    = buildOptions(work.title, distractors, `T1-${work.id}`);

    generated.push({
      id: `qr-theme-${work.id}`,
      type: 'multiple_choice',
      category: 'work_recognition',
      question,
      options,
      correctAnswer: work.title,
      explanation: `„${work.title}" от ${author.name} се свързва с темите „${t1}" и „${t2}".`,
      authorId: work.authorId,
      workId: work.id,
      difficulty: 'medium',
      source: 'work-recognition-generator',
      generated: true,
      sourceFields: ['themes'],
    });
    counts.theme++;
  } else {
    noteSkip(work.id, 'T1-no-unique-theme-pair');
  }

  // ── T2: Motif pair ──────────────────────────────────────────────────────────
  const motifPair = findUniquePair(work, 'motifs', works, 0);
  if (motifPair) {
    const [m1, m2]   = motifPair;
    const question   = `За коя творба са характерни мотивите за ${m1} и ${m2}?`;
    const distractors = pickDistractors(work, [m1, m2], 'motifs', 'motif');
    const options    = buildOptions(work.title, distractors, `T2-${work.id}`);

    generated.push({
      id: `qr-motif-${work.id}`,
      type: 'multiple_choice',
      category: 'work_recognition',
      question,
      options,
      correctAnswer: work.title,
      explanation: `„${work.title}" от ${author.name} се характеризира с мотивите за ${m1} и ${m2}.`,
      authorId: work.authorId,
      workId: work.id,
      difficulty: 'hard',
      source: 'work-recognition-generator',
      generated: true,
      sourceFields: ['motifs'],
    });
    counts.motif++;
  } else {
    noteSkip(work.id, 'T2-insufficient-or-non-unique-motifs');
  }

  // ── T3: Essay theme ─────────────────────────────────────────────────────────
  const essayTheme = findEssayTheme(work, works);
  if (essayTheme) {
    const question   = `Коя творба е подходяща за интерпретативно съчинение върху темата за „${essayTheme}"?`;
    const distractors = pickDistractors(work, [essayTheme], 'themes', 'essay');
    const options    = buildOptions(work.title, distractors, `T3-${work.id}`);

    generated.push({
      id: `qr-essay-${work.id}`,
      type: 'multiple_choice',
      category: 'work_recognition',
      question,
      options,
      correctAnswer: work.title,
      explanation: `„${work.title}" от ${author.name} е подходящо за интерпретативно съчинение върху темата за „${essayTheme}".`,
      authorId: work.authorId,
      workId: work.id,
      difficulty: 'medium',
      source: 'work-recognition-generator',
      generated: true,
      sourceFields: ['themes'],
    });
    counts.essay++;
  } else {
    noteSkip(work.id, 'T3-no-unique-long-theme');
  }
}

// ── Write output ───────────────────────────────────────────────────────────────

const outPath = resolve(root, 'src/data/questions.recognition.json');
writeFileSync(outPath, JSON.stringify(generated, null, 2) + '\n', 'utf8');

const total = generated.length;
console.log(`Generated ${total} work recognition questions:`);
console.log(`  theme-pair (T1): ${counts.theme}`);
console.log(`  motif-pair (T2): ${counts.motif}`);
console.log(`  essay-theme (T3): ${counts.essay}`);

const skipCount = Object.values(skipped).reduce((s, v) => s + v.length, 0);
if (skipCount > 0) {
  console.log(`\nSkipped templates (${skipCount} total):`);
  for (const [workId, reasons] of Object.entries(skipped)) {
    console.log(`  ${workId}: ${reasons.join(', ')}`);
  }
}
console.log(`\nWritten to src/data/questions.recognition.json`);
