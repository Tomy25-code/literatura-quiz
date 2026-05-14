/**
 * qa-semantic-content.mjs — Semantic Content QA for Literatura Quiz
 *
 * Catches pedagogically weak or structurally suspicious questions that pass
 * the structural qa-content.mjs checks but may be poor quiz items:
 *
 *   CATEGORY_SOURCE_MISMATCH — answer for a themes/essay question derives
 *     from the composition or creative_history field, not thematic content.
 *   TOO_ABSTRACT_ANSWER — correctAnswer is too short or context-free for
 *     a themes, essay_preparation, or motifs question.
 *   ESSAY_WEAK_ANSWER — essay_preparation answer is a single short phrase
 *     insufficient as an interpretative accent.
 *   DUPLICATE_CONCEPT — multiple questions for the same work/author+category
 *     use identical correct answers.
 *   GENERIC_EXPLANATION — explanation does not explain the answer and only
 *     says it is present in the notes.
 *
 * Run: node scripts/qa-semantic-content.mjs
 * Output: reports/semantic-content-qa-report.json
 *         reports/semantic-content-qa-report.md
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const root  = resolve(__dir, '..');

function load(rel) {
  return JSON.parse(readFileSync(resolve(root, rel), 'utf8'));
}

const authors       = load('src/data/authors.json');
const works         = load('src/data/works.json');
const baseQuestions = load('src/data/questions.json');
const variantQuestions = (() => {
  try { return load('src/data/questions.v2.json'); }
  catch { return []; }
})();
const typeQuestions = (() => {
  try { return load('src/data/questions.types.json'); }
  catch { return []; }
})();
const fillBlankQuestions = (() => {
  try { return load('src/data/questions.fillblank.json'); }
  catch { return []; }
})();
const recognitionQuestions = (() => {
  try { return load('src/data/questions.recognition.json'); }
  catch { return []; }
})();
// All questions for most checks; base only for DUPLICATE_CONCEPT (variants and
// type questions are generated alternate phrasings and must not be flagged as
// duplicate concepts).
const questions    = [...baseQuestions, ...variantQuestions, ...typeQuestions, ...fillBlankQuestions, ...recognitionQuestions];
const baseOnlyIds  = new Set(baseQuestions.map(q => q.id));
// Generated question IDs — skip from semantic checks (validated by generators)
const typeQuestionIds    = new Set(typeQuestions.map(q => q.id));
const fillBlankIds       = new Set(fillBlankQuestions.map(q => q.id));
const recognitionIds     = new Set(recognitionQuestions.map(q => q.id));

const authorMap = new Map(authors.map(a => [a.id, a]));
const workMap   = new Map(works.map(w => [w.id, w]));

// ── Text utilities ─────────────────────────────────────────────────────────────

function norm(s) {
  return (s || '')
    .toLowerCase()
    .replace(/[„""«»]/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

// Returns the first N normalised characters — used for root/stem matching.
function stem(s, len = 7) {
  const n = norm(s);
  return n.slice(0, Math.min(len, n.length));
}

// ── Warning codes and severity ────────────────────────────────────────────────

const SEVERITY = {
  DUPLICATE_CONCEPT:        'high',
  CATEGORY_SOURCE_MISMATCH: 'high',
  ESSAY_WEAK_ANSWER:        'medium',
  TOO_ABSTRACT_ANSWER:      'medium',
  GENERIC_EXPLANATION:      'low',
};

// ── Suggested actions per code ────────────────────────────────────────────────

const SUGGESTED_ACTION = {
  DUPLICATE_CONCEPT:        'remove or rewrite one of the duplicates',
  CATEGORY_SOURCE_MISMATCH: 'recategorize as composition or rewrite with a clear thematic framing',
  ESSAY_WEAK_ANSWER:        'rewrite with a fuller interpretative phrase',
  TOO_ABSTRACT_ANSWER:      'rewrite with more specific context or remove',
  GENERIC_EXPLANATION:      'rewrite explanation to state why the answer is correct',
};

// ── Thresholds ─────────────────────────────────────────────────────────────────

// essay_preparation answers shorter than this (chars) are flagged as ESSAY_WEAK_ANSWER.
const ESSAY_SHORT_THRESHOLD = 20;

// themes/motifs answers shorter than this (chars) are flagged as TOO_ABSTRACT_ANSWER.
const ABSTRACT_SHORT_THRESHOLD = 12;

// Motif answers that are a single token of fewer than this chars are flagged.
const MOTIF_SINGLE_TOKEN_THRESHOLD = 10;

// Generic explanation patterns (extends qa-content patterns).
const GENERIC_EXPLANATION_PATTERNS = [
  /Твърдението е взето от записките/i,
  /Този отговор съвпада с тема/i,
  /според записките$/i,
  /посочено е в записките/i,
  /посочен[оа]? в записките/i,
  /среща се в записките/i,
];

// ── Collectors ────────────────────────────────────────────────────────────────

const findings = []; // { id, questionText, correctAnswer, category, authorId, workId, code, severity, reason, suggestedAction }

function flag(q, code, reason) {
  findings.push({
    id:            q.id,
    questionText:  q.question,
    correctAnswer: q.correctAnswer,
    category:      q.category,
    authorId:      q.authorId || null,
    workId:        q.workId   || null,
    code,
    severity:       SEVERITY[code] || 'low',
    reason,
    suggestedAction: SUGGESTED_ACTION[code] || 'review',
  });
}

// ── Check 1: DUPLICATE_CONCEPT ────────────────────────────────────────────────
// Same (workId OR authorId) + category with identical correctAnswer on 2+ questions.
// Only applied to base questions — generated variants intentionally reuse the same
// correct answer with different question phrasings and must not be flagged here.

{
  // Group key: workId (if set) else authorId, plus category.
  const groups = new Map(); // key → question[]
  for (const q of questions) {
    if (!baseOnlyIds.has(q.id)) continue; // skip generated questions
    const scopeKey = q.workId ? `work:${q.workId}` : `author:${q.authorId}`;
    const key = `${scopeKey}|${q.category}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(q);
  }

  for (const qs of groups.values()) {
    if (qs.length < 2) continue;
    // Find pairs with identical normalised correctAnswer.
    const seenAnswers = new Map(); // normAnswer → first question
    for (const q of qs) {
      const na = norm(q.correctAnswer);
      if (seenAnswers.has(na)) {
        // Flag both
        const first = seenAnswers.get(na);
        flag(q, 'DUPLICATE_CONCEPT',
          `Identical correct answer "${q.correctAnswer.slice(0, 60)}" already used by ${first.id} (${q.category} for same ${q.workId ? 'work' : 'author'})`);
      } else {
        seenAnswers.set(na, q);
      }
    }
  }
}

// ── Check 2: CATEGORY_SOURCE_MISMATCH ─────────────────────────────────────────
// For themes/essay_preparation questions with workId: the answer's stem appears
// in the work's composition or creative_history text but not in a thematic field.
// This catches answers silently derived from structural/compositional notes.

{
  const TARGET_CATS = new Set(['themes', 'essay_preparation']);
  // Only check composition — not creative_history, because historical themes
  // naturally appear in creative_history as legitimate contextual description.
  const STRUCTURAL_FIELDS = ['composition'];

  for (const q of questions) {
    if (!TARGET_CATS.has(q.category) || !q.workId) continue;
    const work = workMap.get(q.workId);
    if (!work) continue;

    const ca = norm(q.correctAnswer);
    if (ca.length < 5) continue; // too short to produce a meaningful stem

    // If the answer is directly listed in the work's themes or motifs, it is
    // legitimate thematic content — skip even if composition mentions the same term.
    const workThemes = (work.themes || []).map(norm);
    const workMotifs = (work.motifs || []).map(norm);
    if (workThemes.includes(ca) || workMotifs.includes(ca)) continue;

    const s = stem(ca, 7);

    for (const field of STRUCTURAL_FIELDS) {
      const text = norm(work[field] || '');
      if (text.includes(s)) {
        // Verify the answer is short enough to be suspicious (long phrases are fine)
        if (q.correctAnswer.length <= 25) {
          flag(q, 'CATEGORY_SOURCE_MISMATCH',
            `Answer "${q.correctAnswer}" (stem "${s}") appears in work.${field} — may be extracted from structural description rather than standing thematic content`);
          break;
        }
      }
    }
  }
}

// ── Check 3: ESSAY_WEAK_ANSWER ────────────────────────────────────────────────
// essay_preparation answers that are too short to be a useful interpretative accent.

{
  for (const q of questions) {
    if (q.category !== 'essay_preparation') continue;
    const ca = q.correctAnswer.trim();
    if (ca.length < ESSAY_SHORT_THRESHOLD) {
      const isSingleWord = !ca.includes(' ');
      flag(q, 'ESSAY_WEAK_ANSWER',
        isSingleWord
          ? `Single-word essay answer "${ca}" — too abstract for an interpretative accent; needs a fuller phrase`
          : `Essay answer "${ca}" is only ${ca.length} chars — likely too short to be a useful essay focus`);
    }
  }
}

// ── Check 4: TOO_ABSTRACT_ANSWER ──────────────────────────────────────────────
// Themes or motifs with single-word or very short answers that lack interpretive context.

{
  for (const q of questions) {
    if (!['themes', 'motifs'].includes(q.category)) continue;
    const ca = q.correctAnswer.trim();
    const isSingleToken = !ca.includes(' ');

    if (q.category === 'themes' && ca.length < ABSTRACT_SHORT_THRESHOLD) {
      flag(q, 'TOO_ABSTRACT_ANSWER',
        `Theme answer "${ca}" is only ${ca.length} chars — a single decontextualised word is a weak theme label`);
    }

    if (q.category === 'motifs' && isSingleToken && ca.length < MOTIF_SINGLE_TOKEN_THRESHOLD) {
      flag(q, 'TOO_ABSTRACT_ANSWER',
        `Motif answer "${ca}" is a single short word — consider whether this is the most meaningful motif label`);
    }
  }
}

// ── Check 5: GENERIC_EXPLANATION ─────────────────────────────────────────────
// Explanations that don't explain the answer — they only say it's in the notes.

{
  for (const q of questions) {
    if (!q.explanation) continue;
    for (const pattern of GENERIC_EXPLANATION_PATTERNS) {
      if (pattern.test(q.explanation)) {
        flag(q, 'GENERIC_EXPLANATION',
          `Explanation matches generic pattern /${pattern.source}/ — does not explain why the answer is correct`);
        break;
      }
    }
  }
}

// ── Build report ──────────────────────────────────────────────────────────────

const bySeverity  = { high: 0, medium: 0, low: 0 };
const byCode      = {};
for (const f of findings) {
  bySeverity[f.severity] = (bySeverity[f.severity] || 0) + 1;
  byCode[f.code]         = (byCode[f.code]         || 0) + 1;
}

// Sorted: high → medium → low, then by code alphabetically.
const SORDER = { high: 0, medium: 1, low: 2 };
findings.sort((a, b) =>
  SORDER[a.severity] - SORDER[b.severity] ||
  a.code.localeCompare(b.code) ||
  a.id.localeCompare(b.id)
);

const jsonReport = {
  generatedAt:  new Date().toISOString(),
  summary: {
    questions:      questions.length,
    totalFindings:  findings.length,
    bySeverity,
    byCode,
  },
  findings,
};

// ── Markdown report ───────────────────────────────────────────────────────────

function mdTable(rows) {
  if (rows.length === 0) return '_No findings._\n';
  const headers = Object.keys(rows[0]);
  const sep     = headers.map(h => '-'.repeat(Math.max(h.length, 4)));
  const line    = cols => `| ${cols.join(' | ')} |`;
  return [
    line(headers),
    line(sep),
    ...rows.map(r => line(headers.map(h => String(r[h] ?? '')))),
  ].join('\n') + '\n';
}

function truncate(s, n) {
  s = String(s || '');
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}

const highFindings   = findings.filter(f => f.severity === 'high');
const mediumFindings = findings.filter(f => f.severity === 'medium');
const lowFindings    = findings.filter(f => f.severity === 'low');

const md = `# Literatura Quiz — Semantic Content QA Report

Generated: ${new Date().toLocaleString('bg-BG')}

> This report flags pedagogically weak questions that pass structural validation.
> Use it as a prioritised review queue before Phase 2 question expansion.

---

## Summary

| Metric | Value |
|--------|-------|
| Questions checked | ${questions.length} |
| **Total findings** | **${findings.length}** |
| High severity | ${bySeverity.high} |
| Medium severity | ${bySeverity.medium} |
| Low severity | ${bySeverity.low} |

### Findings by code

${mdTable(
  Object.entries(byCode)
    .sort((a, b) => b[1] - a[1])
    .map(([code, n]) => ({ Code: code, Count: n, Severity: SEVERITY[code] || '?', Action: SUGGESTED_ACTION[code] || '' }))
)}

---

## High severity — immediate review recommended

${highFindings.length === 0 ? '_None._\n' : mdTable(
  highFindings.map(f => ({
    ID:       truncate(f.id, 45),
    Code:     f.code,
    Category: f.category,
    Answer:   truncate(f.correctAnswer, 40),
    Reason:   truncate(f.reason, 90),
    Action:   f.suggestedAction,
  }))
)}

---

## Medium severity — review before Phase 2

${mediumFindings.length === 0 ? '_None._\n' : mdTable(
  mediumFindings.map(f => ({
    ID:       truncate(f.id, 45),
    Code:     f.code,
    Category: f.category,
    Answer:   truncate(f.correctAnswer, 40),
    Reason:   truncate(f.reason, 90),
    Action:   f.suggestedAction,
  }))
)}

---

## Low severity — optional improvement

${lowFindings.length === 0 ? '_None._\n' : mdTable(
  lowFindings.map(f => ({
    ID:       truncate(f.id, 45),
    Code:     f.code,
    Category: f.category,
    Reason:   truncate(f.reason, 100),
  }))
)}

---

## Code reference

| Code | Description |
|------|-------------|
| DUPLICATE_CONCEPT | Same work/author + category has two or more questions with the identical correct answer |
| CATEGORY_SOURCE_MISMATCH | Answer for a themes/essay question is derived from the composition or creative_history field, not from thematic content |
| ESSAY_WEAK_ANSWER | essay_preparation answer is too short or abstract to be a useful interpretative accent |
| TOO_ABSTRACT_ANSWER | themes/motifs answer is a single decontextualised word or very short phrase |
| GENERIC_EXPLANATION | Explanation only states the answer is in the notes without explaining why it is correct |

---

_Report generated by scripts/qa-semantic-content.mjs_
`;

// ── Write output ──────────────────────────────────────────────────────────────

mkdirSync(resolve(root, 'reports'), { recursive: true });

writeFileSync(resolve(root, 'reports/semantic-content-qa-report.json'), JSON.stringify(jsonReport, null, 2), 'utf8');
writeFileSync(resolve(root, 'reports/semantic-content-qa-report.md'),   md, 'utf8');

// ── Console summary ───────────────────────────────────────────────────────────

const RED    = '\x1b[31m';
const YELLOW = '\x1b[33m';
const GREEN  = '\x1b[32m';
const CYAN   = '\x1b[36m';
const BOLD   = '\x1b[1m';
const RESET  = '\x1b[0m';

console.log('');
console.log(`${BOLD}${CYAN}━━━ Literatura Quiz — Semantic Content QA ━━━${RESET}`);
console.log(`  Questions: ${baseQuestions.length} base + ${variantQuestions.length} variants + ${typeQuestions.length} types + ${fillBlankQuestions.length} fill-blank + ${recognitionQuestions.length} recognition = ${questions.length} total`);
console.log('');

function printSeverityLine(label, n, color) {
  if (n === 0) {
    console.log(`${GREEN}${BOLD}  ✓ ${label}: 0${RESET}`);
  } else {
    console.log(`${color}${BOLD}  ✗ ${label}: ${n}${RESET}`);
  }
}

printSeverityLine('High severity',   bySeverity.high,   RED);
printSeverityLine('Medium severity', bySeverity.medium, YELLOW);
printSeverityLine('Low severity',    bySeverity.low,    YELLOW);

if (findings.length > 0) {
  console.log('');
  console.log(`${BOLD}  By code:${RESET}`);
  Object.entries(byCode)
    .sort((a, b) => b[1] - a[1])
    .forEach(([code, n]) => {
      const sev = SEVERITY[code] || 'low';
      const color = sev === 'high' ? RED : YELLOW;
      console.log(`${color}    ${code}: ${n}${RESET}`);
    });
}

console.log('');
console.log(`${BOLD}  Reports saved:${RESET}`);
console.log('    reports/semantic-content-qa-report.json');
console.log('    reports/semantic-content-qa-report.md');
console.log('');
