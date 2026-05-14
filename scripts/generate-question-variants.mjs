/**
 * generate-question-variants.mjs
 *
 * Generates src/data/questions.v2.json from existing JSON data only.
 * All generated facts derive strictly from authors.json and works.json.
 * No external sources are consulted.
 *
 * Generated variant types:
 *   A. alt_work_to_author  — "Кой е авторът на „X"?" (alternate phrasing)
 *   B. work_recognition    — "За коя творба се отнася следният факт: „X"?"
 *   C. alt_author_to_work  — "Кое от изброените произведения е написано от X?"
 *   D. reverse_nickname    — "Кой автор е известен с прозвището „X"?"
 *
 * Run: node scripts/generate-question-variants.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dir, '..');

function load(rel) {
  return JSON.parse(readFileSync(resolve(root, rel), 'utf8'));
}

const authors   = load('src/data/authors.json');
const works     = load('src/data/works.json');

const authorMap = new Map(authors.map(a => [a.id, a]));
const workMap   = new Map(works.map(w => [w.id, w]));

// ── Deterministic helper ───────────────────────────────────────────────────────
// A simple 32-bit hash so distractor selection is stable across runs.
function hash32(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h * 33) ^ str.charCodeAt(i)) >>> 0;
  }
  return h;
}

/**
 * Pick `count` items from `pool`, excluding any value in `excludeSet`.
 * Selection is deterministic: sorted alphabetically, then offset by `seedStr`.
 * Returns null if fewer than `count` candidates exist.
 */
function pickDistractors(pool, count, excludeSet, seedStr) {
  const candidates = pool.filter(x => !excludeSet.has(x));
  if (candidates.length < count) return null;
  const sorted = [...candidates].sort((a, b) => a.localeCompare(b));
  const start = hash32(seedStr) % sorted.length;
  const result = [];
  for (let i = 0; i < sorted.length && result.length < count; i++) {
    result.push(sorted[(start + i) % sorted.length]);
  }
  return result;
}

// ── Key-fact suitability check for work_recognition ───────────────────────────
/**
 * Returns the first key_fact string from `work` that:
 *  1. Does not contain the work's own title (to avoid trivial giveaways).
 *  2. Is at least 30 characters long (rules out bare year statements).
 *  3. Appears in no other work's key_facts array (ensures the clue is unique).
 * Returns null if no suitable fact is found.
 */
function findUsableKeyFact(work) {
  const titleNorm = work.title.toLowerCase().replace(/[„""«»]/g, '"');
  for (const fact of (work.key_facts || [])) {
    const factNorm = fact.toLowerCase().replace(/[„""«»]/g, '"');

    // Must not name the work title directly
    if (factNorm.includes(titleNorm)) continue;

    // Must be long enough to be distinctive
    if (fact.length < 30) continue;

    // Must be unique across all other works' key_facts
    const isUnique = !works.some(
      w => w.id !== work.id && (w.key_facts || []).some(f => f === fact)
    );
    if (!isUnique) continue;

    return fact;
  }
  return null;
}

// ── Counters ───────────────────────────────────────────────────────────────────
const generated = [];
const counts = {
  altWorkToAuthor:  0,
  workRecognition:  0,
  altAuthorToWork:  0,
  reverseNickname:  0,
};
const skipped = {
  noUniqueKeyFact:          0,
  insufficientDistractors:  0,
  duplicateText:            0,
};

// Track generated question texts to catch within-file duplicates
const usedTexts = new Set();

function addQuestion(q) {
  const normText = q.question.toLowerCase().replace(/\s+/g, ' ').trim();
  if (usedTexts.has(normText)) {
    skipped.duplicateText++;
    return;
  }
  usedTexts.add(normText);
  generated.push(q);
}

// ── All author names / work titles (distractor pools) ─────────────────────────
const allAuthorNames = authors.map(a => a.name);
const allWorkTitles  = works.map(w => w.title);

// ══════════════════════════════════════════════════════════════════════════════
//  Type A: Alternate work → author phrasing
//  "Кой е авторът на „{title}"?"   correctAnswer: author.name
// ══════════════════════════════════════════════════════════════════════════════
for (const work of works) {
  const author = authorMap.get(work.authorId);
  if (!author) continue;

  const correct = author.name;
  const distractors = pickDistractors(allAuthorNames, 3, new Set([correct]), `A-${work.id}`);
  if (!distractors) { skipped.insufficientDistractors++; continue; }

  addQuestion({
    id:            `qv-work-author-${work.id}-01`,
    question:      `Кой е авторът на „${work.title}"?`,
    options:       [correct, ...distractors],
    correctAnswer: correct,
    explanation:   `„${work.title}" е ${work.genre} на ${author.name}.`,
    authorId:      work.authorId,
    workId:        work.id,
    category:      'author',
    difficulty:    'easy',
    sourceNote:    'generated:alt_work_to_author',
  });
  counts.altWorkToAuthor++;
}

// ══════════════════════════════════════════════════════════════════════════════
//  Type B: Work recognition from key fact
//  "За коя творба от изучавания материал се отнася следният факт: „X"?"
//  correctAnswer: work.title
// ══════════════════════════════════════════════════════════════════════════════
for (const work of works) {
  const author = authorMap.get(work.authorId);
  if (!author) continue;

  const fact = findUsableKeyFact(work);
  if (!fact) { skipped.noUniqueKeyFact++; continue; }

  const correct = work.title;
  const distractors = pickDistractors(allWorkTitles, 3, new Set([correct]), `B-${work.id}`);
  if (!distractors) { skipped.insufficientDistractors++; continue; }

  const recogYear = work.year_or_period.replace(/\s*г\.\s*$/, '');

  addQuestion({
    id:            `qv-work-recog-${work.id}-01`,
    question:      `За коя творба от изучавания материал се отнася следният факт: „${fact}"?`,
    options:       [correct, ...distractors],
    correctAnswer: correct,
    explanation:   `„${work.title}" е ${work.genre} (${recogYear}) на ${author.name}. Посоченият факт е характерен именно за тази творба.`,
    authorId:      work.authorId,
    workId:        work.id,
    category:      'work_recognition',
    difficulty:    'medium',
    sourceNote:    'generated:work_recognition',
  });
  counts.workRecognition++;
}

// ══════════════════════════════════════════════════════════════════════════════
//  Type C: Alternate author → work phrasing (one per author)
//  "Кое от изброените произведения е написано от {author.name}?"
//  correctAnswer: first work's title
// ══════════════════════════════════════════════════════════════════════════════
for (const author of authors) {
  if (!author.works || author.works.length === 0) continue;

  const workId = author.works[0];
  const work = workMap.get(workId);
  if (!work) continue;

  const correct = work.title;
  // Distractors: works by other authors only
  const otherTitles = works.filter(w => w.authorId !== author.id).map(w => w.title);
  const distractors = pickDistractors(otherTitles, 3, new Set([correct]), `C-${author.id}`);
  if (!distractors) { skipped.insufficientDistractors++; continue; }

  // Strip trailing "г." to avoid double period in explanation
  const yearClean = work.year_or_period.replace(/\s*г\.\s*$/, '');

  addQuestion({
    id:            `qv-author-work-${author.id}-${workId}-01`,
    question:      `Кое от изброените произведения е написано от ${author.name}?`,
    options:       [correct, ...distractors],
    correctAnswer: correct,
    explanation:   `„${work.title}" е ${work.genre} на ${author.name} (${yearClean}).`,
    authorId:      author.id,
    workId:        work.id,
    category:      'work',
    difficulty:    'easy',
    sourceNote:    'generated:alt_author_to_work',
  });
  counts.altAuthorToWork++;
}

// ══════════════════════════════════════════════════════════════════════════════
//  Type D: Reverse nickname — given nickname, identify author
//  "Кой автор е известен с прозвището „{nickname}"?"
//  correctAnswer: author.name
// ══════════════════════════════════════════════════════════════════════════════
for (const author of authors) {
  if (!author.nickname) continue;

  // Use only the first nickname phrase (before any semicolon)
  const nickname = author.nickname.split(';')[0].trim();
  if (!nickname) continue;

  const correct = author.name;
  const distractors = pickDistractors(allAuthorNames, 3, new Set([correct]), `D-${author.id}`);
  if (!distractors) { skipped.insufficientDistractors++; continue; }

  addQuestion({
    id:            `qv-nick-author-${author.id}-01`,
    question:      `Кой автор е известен с прозвището „${nickname}"?`,
    options:       [correct, ...distractors],
    correctAnswer: correct,
    explanation:   `${author.name} е известен/а с прозвището „${nickname}".`,
    authorId:      author.id,
    workId:        null,
    category:      'author',
    difficulty:    'medium',
    sourceNote:    'generated:reverse_nickname',
  });
  counts.reverseNickname++;
}

// ── Write output ───────────────────────────────────────────────────────────────
const outputPath = resolve(root, 'src/data/questions.v2.json');
writeFileSync(outputPath, JSON.stringify(generated, null, 2) + '\n', 'utf8');

// ── Print summary ──────────────────────────────────────────────────────────────
const base = JSON.parse(readFileSync(resolve(root, 'src/data/questions.json'), 'utf8'));
const total = generated.length;

const CYAN  = '\x1b[36m';
const GREEN = '\x1b[32m';
const BOLD  = '\x1b[1m';
const RESET = '\x1b[0m';

console.log('');
console.log(`${BOLD}${CYAN}━━━ Question Variants Generator ━━━${RESET}`);
console.log(`  Base questions:        ${base.length}`);
console.log(`  Generated variants:    ${total}`);
console.log(`  Final pool:            ${base.length} + ${total} = ${base.length + total}`);
console.log('');
console.log(`  By type:`);
console.log(`  - Alternate work → author:   ${counts.altWorkToAuthor}`);
console.log(`  - Work recognition:          ${counts.workRecognition}`);
console.log(`  - Alternate author → work:   ${counts.altAuthorToWork}`);
console.log(`  - Reverse nickname:          ${counts.reverseNickname}`);
console.log('');
console.log(`  Skipped:`);
console.log(`  - No unique key fact:        ${skipped.noUniqueKeyFact}`);
console.log(`  - Insufficient distractors:  ${skipped.insufficientDistractors}`);
console.log(`  - Duplicate text:            ${skipped.duplicateText}`);
console.log('');
console.log(`${GREEN}  Output: src/data/questions.v2.json${RESET}`);
console.log('');
