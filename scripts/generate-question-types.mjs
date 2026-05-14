/**
 * generate-question-types.mjs
 *
 * Generates src/data/questions.types.json from authors.json and works.json only.
 * All facts derive strictly from existing JSON — no external sources consulted.
 *
 * Generated question types:
 *   1. true_false       — "„X" е произведение на Y."  correctAnswer: "Вярно" / "Невярно"
 *   2. match_author_work — "Свържи авторите с правилните произведения."  pairs: [{authorId,…}]
 *
 * IDs use the prefix "qt-" to avoid collisions with base ("q-") and variant ("qv-") IDs.
 *
 * Difficulty rule (documented):
 *   true_false TRUE  → easy   (student only needs to recognise the correct author-work pair)
 *   true_false FALSE → medium (student must detect the deliberate swap)
 *   match_author_work → medium (requires matching all pairs simultaneously)
 *
 * Run: node scripts/generate-question-types.mjs
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
const workMap   = new Map(works.map(w => [w.id, w]));

// ── Deterministic helper ───────────────────────────────────────────────────────
function hash32(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h * 33) ^ str.charCodeAt(i)) >>> 0;
  }
  return h;
}

// ── Counters ───────────────────────────────────────────────────────────────────
const generated = [];
const counts = { trueFalse: 0, matchAuthorWork: 0 };
const usedTexts = new Set();

function addQuestion(q) {
  // Duplicate-text guard (skip for match_author_work which shares a question phrase)
  if (q.type !== 'match_author_work') {
    const norm = q.question.toLowerCase().replace(/\s+/g, ' ').trim();
    if (usedTexts.has(norm)) return;
    usedTexts.add(norm);
  }
  generated.push(q);
}

// ══════════════════════════════════════════════════════════════════════════════
//  Type 1: True / False
//
//  For each work:
//    TRUE  — "„{title}" е произведение на {correctAuthor.name}."   difficulty: easy
//    FALSE — "„{title}" е произведение на {wrongAuthor.name}."     difficulty: medium
//            wrongAuthor is a different author selected deterministically.
//
//  authorId on BOTH questions is the CORRECT author so author-filter works.
// ══════════════════════════════════════════════════════════════════════════════

for (const work of works) {
  const author = authorMap.get(work.authorId);
  if (!author) continue;

  // TRUE statement
  addQuestion({
    id:            `qt-tf-${work.id}-true`,
    type:          'true_false',
    question:      `„${work.title}" е произведение на ${author.name}.`,
    options:       ['Вярно', 'Невярно'],
    correctAnswer: 'Вярно',
    explanation:   `„${work.title}" е ${work.genre} на ${author.name}.`,
    authorId:      work.authorId,
    workId:        work.id,
    category:      'true_false',
    difficulty:    'easy',
    sourceNote:    'generated:true_false',
  });
  counts.trueFalse++;

  // FALSE statement — deterministic wrong-author selection
  const otherAuthors = authors.filter(a => a.id !== work.authorId);
  const wrongAuthor  = otherAuthors[hash32(`false-${work.id}`) % otherAuthors.length];

  addQuestion({
    id:            `qt-tf-${work.id}-false`,
    type:          'true_false',
    question:      `„${work.title}" е произведение на ${wrongAuthor.name}.`,
    options:       ['Вярно', 'Невярно'],
    correctAnswer: 'Невярно',
    explanation:   `„${work.title}" е ${work.genre} на ${author.name}, не на ${wrongAuthor.name}.`,
    authorId:      work.authorId,
    workId:        work.id,
    category:      'true_false',
    difficulty:    'medium',
    sourceNote:    'generated:true_false_false',
  });
  counts.trueFalse++;
}

// ══════════════════════════════════════════════════════════════════════════════
//  Type 2: Match author with work
//
//  Groups all 20 authors into groups of 4 (stable order = JSON order).
//  Each group becomes one matching question.
//  Each author contributes their first listed work (author.works[0]).
//
//  pairs: [{ authorId, authorName, workId, workTitle }]
//  options: work titles (for dropdown display; shuffled at quiz-build time)
//  authorIds / workIds: arrays for multi-author/work filtering
//  correctAnswer: null (correctness checked via pairs in the Quiz component)
// ══════════════════════════════════════════════════════════════════════════════

const GROUP_SIZE = 4;

for (let i = 0; i < authors.length; i += GROUP_SIZE) {
  const group = authors.slice(i, i + GROUP_SIZE);

  const pairs = group
    .map(author => {
      const workId = (author.works || [])[0];
      if (!workId) return null;
      const work = workMap.get(workId);
      if (!work) return null;
      return { authorId: author.id, authorName: author.name, workId, workTitle: work.title };
    })
    .filter(Boolean);

  if (pairs.length < 3) continue;

  const groupNum   = Math.floor(i / GROUP_SIZE) + 1;
  const options    = pairs.map(p => p.workTitle);
  const authorIds  = pairs.map(p => p.authorId);
  const workIds    = pairs.map(p => p.workId);
  const explanation = pairs.map(p => `${p.authorName} — „${p.workTitle}"`).join('; ') + '.';

  addQuestion({
    id:            `qt-match-${String(groupNum).padStart(2, '0')}`,
    type:          'match_author_work',
    question:      'Свържи авторите с правилните произведения.',
    pairs,
    options,
    correctAnswer: null,
    explanation,
    authorId:      null,
    authorIds,
    workId:        null,
    workIds,
    category:      'match_author_work',
    difficulty:    'medium',
    sourceNote:    'generated:match_author_work',
  });
  counts.matchAuthorWork++;
}

// ── Write output ───────────────────────────────────────────────────────────────
const outputPath = resolve(root, 'src/data/questions.types.json');
writeFileSync(outputPath, JSON.stringify(generated, null, 2) + '\n', 'utf8');

// ── Print summary ──────────────────────────────────────────────────────────────
const base     = JSON.parse(readFileSync(resolve(root, 'src/data/questions.json'), 'utf8'));
const variants = (() => {
  try { return JSON.parse(readFileSync(resolve(root, 'src/data/questions.v2.json'), 'utf8')); }
  catch { return []; }
})();
const total = base.length + variants.length + generated.length;

const CYAN  = '\x1b[36m';
const GREEN = '\x1b[32m';
const BOLD  = '\x1b[1m';
const RESET = '\x1b[0m';

console.log('');
console.log(`${BOLD}${CYAN}━━━ Question Types Generator ━━━${RESET}`);
console.log(`  Base questions:          ${base.length}`);
console.log(`  Generated variants:      ${variants.length}`);
console.log(`  Generated type questions:${generated.length}`);
console.log(`  Final pool:              ${base.length} + ${variants.length} + ${generated.length} = ${total}`);
console.log('');
console.log(`  By type:`);
console.log(`  - True / False:          ${counts.trueFalse}`);
console.log(`  - Match author/work:     ${counts.matchAuthorWork}`);
console.log('');
console.log(`${GREEN}  Output: src/data/questions.types.json${RESET}`);
console.log('');
