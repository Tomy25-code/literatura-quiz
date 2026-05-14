/**
 * generate-fill-blank-questions.mjs
 *
 * Generates src/data/questions.fillblank.json from authors.json and works.json only.
 * All facts derive strictly from existing JSON — no invented content.
 *
 * Generated templates:
 *   1. author  — "„{title}" е произведение на ____."         (27 q, medium)
 *   2. genre   — "Жанрът на „{title}" е ____."               (27 q, easy)
 *   3. year    — "Годината на „{title}" е ____."             (21 q, easy)  clean years only
 *   4. nickname— "{authorName} е известен с прозвището ____." (8 q, medium)
 *
 * ID prefix: qfb-
 * Run: node scripts/generate-fill-blank-questions.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dir, '..');

function load(rel) {
  return JSON.parse(readFileSync(resolve(root, rel), 'utf8'));
}

const authors = load('src/data/authors.json');
const works   = load('src/data/works.json');
const authorMap = new Map(authors.map(a => [a.id, a]));

// ── Answer normalisation (mirrors FillBlankQuestion.jsx) ──────────────────────
function norm(s) {
  return String(s)
    .toLowerCase()
    .replace(/[„""«»]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ── Results ───────────────────────────────────────────────────────────────────
const generated = [];
const counts = { author: 0, genre: 0, year: 0, nickname: 0 };

// ─────────────────────────────────────────────────────────────────────────────
// Template 1 — Author attribution
// "„{title}" е произведение на ____."
// correctAnswer: author.name
// difficulty: medium
// ─────────────────────────────────────────────────────────────────────────────
for (const work of works) {
  const author = authorMap.get(work.authorId);
  if (!author) continue;

  const correctAnswer = author.name;
  const acceptedAnswers = [correctAnswer];

  generated.push({
    id: `qfb-author-${work.id}`,
    type: 'fill_blank',
    category: 'fill_blank',
    question: `„${work.title}" е произведение на ____.`,
    correctAnswer,
    acceptedAnswers,
    explanation: `„${work.title}" е произведение на ${author.name}.`,
    authorId: work.authorId,
    workId: work.id,
    difficulty: 'medium',
    source: 'generated-fillblank',
  });
  counts.author++;
}

// ─────────────────────────────────────────────────────────────────────────────
// Template 2 — Genre
// "Жанрът на „{title}" е ____."
// correctAnswer: primary genre (before "/" or ";")
// acceptedAnswers: correctAnswer + full genre string (if different) + base word (if applicable)
// difficulty: easy
// ─────────────────────────────────────────────────────────────────────────────
for (const work of works) {
  const author = authorMap.get(work.authorId);
  if (!author) continue;

  const fullGenre = work.genre;
  // Primary: first segment before "/" or ";"
  const primaryGenre = fullGenre.split(/[\/;]/)[0].trim();

  // Deduplicate by normalized form, store original-case values.
  const seenNorms = new Set();
  const acceptedAnswers = [];
  for (const v of [primaryGenre, fullGenre]) {
    const n = norm(v);
    if (!seenNorms.has(n)) { seenNorms.add(n); acceptedAnswers.push(v); }
  }
  // Add base word for compound genres (e.g. "епически роман" → "роман")
  const baseWord = primaryGenre.split(/\s+/).pop();
  if (baseWord && baseWord.length >= 4) {
    const n = norm(baseWord);
    if (!seenNorms.has(n)) { seenNorms.add(n); acceptedAnswers.push(baseWord); }
  }

  generated.push({
    id: `qfb-genre-${work.id}`,
    type: 'fill_blank',
    category: 'fill_blank',
    question: `Жанрът на „${work.title}" е ____.`,
    correctAnswer: primaryGenre,
    acceptedAnswers,
    explanation: `Жанрът на „${work.title}" е ${fullGenre}.`,
    authorId: work.authorId,
    workId: work.id,
    difficulty: 'easy',
    source: 'generated-fillblank',
  });
  counts.genre++;
}

// ─────────────────────────────────────────────────────────────────────────────
// Template 3 — Year (clean years only)
// "Годината на „{title}" е ____."
// Clean year: year_or_period matches /^\d{4}\s*г\.\s*$/
// correctAnswer: "YYYY г."
// acceptedAnswers: ["YYYY г.", "YYYY", "YYYYг."]
// difficulty: easy
// ─────────────────────────────────────────────────────────────────────────────
const CLEAN_YEAR_RE = /^\d{4}\s*г\.\s*$/;

for (const work of works) {
  const author = authorMap.get(work.authorId);
  if (!author) continue;
  if (!CLEAN_YEAR_RE.test(work.year_or_period)) continue;

  const yearFull = work.year_or_period.trim(); // e.g. "1952 г."
  const yearNum  = yearFull.replace(/\s*г\.\s*$/, '').trim(); // e.g. "1952"

  const acceptedAnswers = [yearFull, yearNum, `${yearNum}г.`];

  generated.push({
    id: `qfb-year-${work.id}`,
    type: 'fill_blank',
    category: 'fill_blank',
    question: `Годината на „${work.title}" е ____.`,
    correctAnswer: yearFull,
    acceptedAnswers,
    explanation: `„${work.title}" е написано в ${yearFull}.`,
    authorId: work.authorId,
    workId: work.id,
    difficulty: 'easy',
    source: 'generated-fillblank',
  });
  counts.year++;
}

// ─────────────────────────────────────────────────────────────────────────────
// Template 4 — Nickname
// "{authorName} е известен с прозвището ____."
// Only authors with non-null nickname field.
// correctAnswer: first phrase before ";"
// acceptedAnswers: correctAnswer + full nickname string (if different)
// difficulty: medium
// ─────────────────────────────────────────────────────────────────────────────
for (const author of authors) {
  if (!author.nickname) continue;

  const fullNick  = author.nickname;
  const firstNick = fullNick.split(';')[0].trim();

  // Deduplicate by normalized form, but store original-case values.
  const seenNorms = new Set();
  const acceptedAnswers = [];
  for (const v of [firstNick, fullNick]) {
    const n = norm(v);
    if (!seenNorms.has(n)) { seenNorms.add(n); acceptedAnswers.push(v); }
  }

  generated.push({
    id: `qfb-nick-${author.id}`,
    type: 'fill_blank',
    category: 'fill_blank',
    question: `${author.name} е известен с прозвището ____.`,
    correctAnswer: firstNick,
    acceptedAnswers,
    explanation: `${author.name} е известен с прозвището „${firstNick}".`,
    authorId: author.id,
    workId: null,
    difficulty: 'medium',
    source: 'generated-fillblank',
  });
  counts.nickname++;
}

// ─────────────────────────────────────────────────────────────────────────────
// Write output
// ─────────────────────────────────────────────────────────────────────────────
const outPath = resolve(root, 'src/data/questions.fillblank.json');
writeFileSync(outPath, JSON.stringify(generated, null, 2) + '\n', 'utf8');

const total = generated.length;
console.log(`Generated ${total} fill-blank questions:`);
console.log(`  author:   ${counts.author}`);
console.log(`  genre:    ${counts.genre}`);
console.log(`  year:     ${counts.year}`);
console.log(`  nickname: ${counts.nickname}`);
console.log(`Written to src/data/questions.fillblank.json`);
