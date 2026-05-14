/**
 * qa-content.mjs — Content QA for Literatura Quiz
 * Run: node scripts/qa-content.mjs
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dir, '..');

// ── Load data ────────────────────────────────────────────────────────────────

function load(rel) {
  return JSON.parse(readFileSync(resolve(root, rel), 'utf8'));
}

const authors   = load('src/data/authors.json');
const works     = load('src/data/works.json');
const baseQuestions = load('src/data/questions.json');
const variantQuestions = (() => {
  try { return load('src/data/questions.v2.json'); }
  catch { return []; } // generated file may not exist yet
})();
const typeQuestions = (() => {
  try { return load('src/data/questions.types.json'); }
  catch { return []; } // generated file may not exist yet
})();
const fillBlankQuestions = (() => {
  try { return load('src/data/questions.fillblank.json'); }
  catch { return []; } // generated file may not exist yet
})();
const recognitionQuestions = (() => {
  try { return load('src/data/questions.recognition.json'); }
  catch { return []; } // generated file may not exist yet
})();
const questions = [...baseQuestions, ...variantQuestions, ...typeQuestions, ...fillBlankQuestions, ...recognitionQuestions];
// IDs of questions from questions.types.json — used for type-specific consistency checks
const typeQuestionIdSet = new Set(typeQuestions.map(q => q.id));
// IDs of generated work-recognition questions — used to enforce recognition-specific rules
const recognitionIdSet = new Set(recognitionQuestions.map(q => q.id));

// ── Constants ─────────────────────────────────────────────────────────────────

const VALID_DIFFICULTIES = new Set(['easy', 'medium', 'hard']);

const VALID_CATEGORIES = new Set([
  'author', 'work', 'work_recognition', 'genre', 'period', 'nickname',
  'creative_history', 'composition', 'themes', 'motifs',
  'literary_context', 'true_false', 'essay_preparation', 'match_author_work',
  'fill_blank',
]);

const VALID_TYPES = new Set(['multiple_choice', 'true_false', 'match_author_work', 'fill_blank']);

const FILLBLANK_BANNED_ANSWERS = new Set([
  'състоянието', 'раздялата', 'добротата', 'човешкото', 'живота', 'света',
]);

const DIFFICULTY_LABELS = { easy: 'Лесно', medium: 'Средно', hard: 'Трудно' };

const SUSPICIOUS_PATTERNS = [
  { pattern: /\(2\)/, label: '"(2)"' },
  { pattern: /\(3\)/, label: '"(3)"' },
  { pattern: /\(4\)/, label: '"(4)"' },
  { pattern: /вариант/i, label: '"вариант"' },
  { pattern: /според записките \(/i, label: '"според записките ("' },
];

const GENERIC_EXPLANATION_PATTERNS = [
  /Твърдението е взето от записките/i,
  /Този отговор съвпада с тема/i,
  /според записките$/i,
];

const ENGLISH_WORD_PATTERN = /\b[a-zA-Z]{3,}\b/g;
// Allow known-OK English in Bulgarian text (ids, etc.)
const ALLOWED_ENGLISH = new Set(['bg', 'en', 'id', 'null', 'true', 'false', 'pdf']);

const OPTION_MAX = 280;
const QUESTION_MAX = 250;
const EXPLANATION_MAX = 350;

// ── Result collectors ─────────────────────────────────────────────────────────

const errors   = [];
const warnings = [];

function err(id, code, message) {
  errors.push({ id, code, message });
}

function warn(id, code, message) {
  warnings.push({ id, code, message });
}

// ── Build lookup maps ─────────────────────────────────────────────────────────

const authorMap = new Map(authors.map(a => [a.id, a]));
const workMap   = new Map(works.map(w => [w.id, w]));

// ── 1. Top-level structure ────────────────────────────────────────────────────

if (!Array.isArray(authors))   err('authors.json',   'NOT_ARRAY', 'authors.json must be an array');
if (!Array.isArray(works))     err('works.json',     'NOT_ARRAY', 'works.json must be an array');
if (!Array.isArray(questions)) err('questions.json', 'NOT_ARRAY', 'questions.json must be an array');

// ── 2. Author field checks ────────────────────────────────────────────────────

authors.forEach((a, i) => {
  const ctx = a.id || `authors[${i}]`;
  if (!a.id)   err(ctx, 'MISSING_FIELD', 'author missing id');
  if (!a.name) err(ctx, 'MISSING_FIELD', 'author missing name');
});

// ── 3. Work field checks ──────────────────────────────────────────────────────

works.forEach((w, i) => {
  const ctx = w.id || `works[${i}]`;
  if (!w.id)       err(ctx, 'MISSING_FIELD', 'work missing id');
  if (!w.title)    err(ctx, 'MISSING_FIELD', 'work missing title');
  if (!w.authorId) err(ctx, 'MISSING_FIELD', 'work missing authorId');
  if (w.authorId && !authorMap.has(w.authorId)) {
    err(ctx, 'ORPHAN_AUTHOR', `work.authorId "${w.authorId}" not found in authors.json`);
  }
});

// ── 4. Question field checks ──────────────────────────────────────────────────

const seenQIds       = new Map(); // id → first index
const seenQTexts     = new Map(); // normalized text → first id

questions.forEach((q, i) => {
  const id    = q.id || `questions[${i}]`;
  const qType = q.type || 'multiple_choice';
  const isMatch     = qType === 'match_author_work';
  const isTrueFalse = qType === 'true_false';
  const isFillBlank = qType === 'fill_blank';

  // type field (if present) must be valid
  if (q.type && !VALID_TYPES.has(q.type)) {
    err(id, 'INVALID_TYPE', `type "${q.type}" is not a recognised type`);
  }

  // In questions.types.json: category "true_false" requires explicit type "true_false".
  // (Old base questions use category "true_false" for statement-selection questions — that
  //  is a legacy convention and must not be replicated in the type questions file.)
  if (typeQuestionIdSet.has(q.id) && q.category === 'true_false' && q.type !== 'true_false') {
    err(id, 'TYPE_CATEGORY_MISMATCH',
      `question in questions.types.json with category "true_false" must have type "true_false"`);
  }

  // Required fields (type-aware)
  const stdRequiredFields = isMatch
    ? ['id', 'question', 'pairs', 'explanation', 'category', 'difficulty']
    : isFillBlank
    ? ['id', 'question', 'correctAnswer', 'acceptedAnswers', 'explanation', 'authorId', 'category', 'difficulty']
    : ['id', 'question', 'options', 'correctAnswer', 'explanation', 'authorId', 'category', 'difficulty'];

  for (const field of stdRequiredFields) {
    const val = q[field];
    if (val === undefined || val === null || val === '') {
      err(id, 'MISSING_FIELD', `question missing or empty field: "${field}"`);
    }
  }

  // Duplicate id
  if (q.id) {
    if (seenQIds.has(q.id)) {
      err(id, 'DUPLICATE_ID', `duplicate question id (first at index ${seenQIds.get(q.id)})`);
    } else {
      seenQIds.set(q.id, i);
    }
  }

  // Duplicate question text — skip for match_author_work (all share the same prompt)
  if (q.question && !isMatch) {
    const norm = q.question.toLowerCase().replace(/\s+/g, ' ').trim();
    if (seenQTexts.has(norm)) {
      err(id, 'DUPLICATE_TEXT', `question text duplicates id "${seenQTexts.get(norm)}"`);
    } else {
      seenQTexts.set(norm, id);
    }
  }

  // Options checks (type-aware)
  if (isTrueFalse) {
    // true_false must have exactly the two Bulgarian options
    if (!Array.isArray(q.options) || q.options.length !== 2) {
      err(id, 'TRUE_FALSE_OPTIONS',
        `true_false question must have exactly 2 options (found ${Array.isArray(q.options) ? q.options.length : typeof q.options})`);
    } else if (!q.options.includes('Вярно') || !q.options.includes('Невярно')) {
      err(id, 'TRUE_FALSE_OPTIONS',
        `true_false options must be exactly ["Вярно", "Невярно"]`);
    }
    // correctAnswer must be Вярно or Невярно
    if (q.correctAnswer !== 'Вярно' && q.correctAnswer !== 'Невярно') {
      err(id, 'TRUE_FALSE_ANSWER',
        `true_false correctAnswer must be "Вярно" or "Невярно" (got "${q.correctAnswer}")`);
    }
    // question text must be a declarative statement, not a statement-selection question
    const FORBIDDEN_TF_PATTERNS = [
      /^Кое твърдение/i,
      /^Кое от твърденията/i,
      /^Кое НЕ е вярно/i,
    ];
    for (const pat of FORBIDDEN_TF_PATTERNS) {
      if (pat.test(q.question || '')) {
        err(id, 'TRUE_FALSE_STATEMENT_FORMAT',
          `true_false question must be a declarative statement, not a statement-selection question (matched /${pat.source}/)`);
        break;
      }
    }
    // category must be true_false
    if (q.category !== 'true_false') {
      err(id, 'TRUE_FALSE_CATEGORY',
        `question with type "true_false" must have category "true_false" (got "${q.category}")`);
    }
  } else if (isMatch) {
    // match_author_work: check pairs array
    if (!Array.isArray(q.pairs) || q.pairs.length < 3) {
      err(id, 'MATCH_PAIRS_COUNT',
        `match_author_work must have at least 3 pairs (found ${Array.isArray(q.pairs) ? q.pairs.length : typeof q.pairs})`);
    } else {
      const pairAuthorIds = q.pairs.map(p => p.authorId);
      const pairWorkIds   = q.pairs.map(p => p.workId);
      if (new Set(pairAuthorIds).size !== pairAuthorIds.length) {
        err(id, 'MATCH_DUPLICATE_AUTHOR', 'match_author_work has duplicate authorId within pairs');
      }
      if (new Set(pairWorkIds).size !== pairWorkIds.length) {
        err(id, 'MATCH_DUPLICATE_WORK', 'match_author_work has duplicate workId within pairs');
      }
      for (const pair of q.pairs) {
        if (!authorMap.has(pair.authorId)) {
          err(id, 'ORPHAN_AUTHOR', `pair.authorId "${pair.authorId}" not found in authors.json`);
        }
        if (!workMap.has(pair.workId)) {
          err(id, 'ORPHAN_WORK', `pair.workId "${pair.workId}" not found in works.json`);
        }
      }
    }
    // options must match pairs count (work titles for dropdowns)
    if (Array.isArray(q.pairs) && Array.isArray(q.options)) {
      if (q.options.length !== q.pairs.length) {
        err(id, 'MATCH_OPTIONS_MISMATCH', 'match_author_work options.length must equal pairs.length');
      }
    }
  } else if (isFillBlank) {
    // fill_blank: id must start with "qfb-"
    if (q.id && !q.id.startsWith('qfb-')) {
      err(id, 'FILLBLANK_ID_FORMAT', `fill_blank question id must start with "qfb-" (got "${q.id}")`);
    }
    // acceptedAnswers must be a non-empty array
    if (!Array.isArray(q.acceptedAnswers) || q.acceptedAnswers.length === 0) {
      err(id, 'FILLBLANK_ACCEPTED_ANSWERS', 'fill_blank acceptedAnswers must be a non-empty array');
    } else {
      // correctAnswer must appear (after normalization) in acceptedAnswers
      const normFn = s => String(s).toLowerCase().replace(/[„""«»]/g, '').replace(/\s+/g, ' ').trim();
      if (q.correctAnswer !== null && q.correctAnswer !== undefined) {
        const normCorrect = normFn(q.correctAnswer);
        if (!q.acceptedAnswers.some(a => normFn(a) === normCorrect)) {
          err(id, 'FILLBLANK_CORRECT_NOT_ACCEPTED',
            `fill_blank correctAnswer "${q.correctAnswer}" is not present in acceptedAnswers`);
        }
        // check against banned vague answers
        if (FILLBLANK_BANNED_ANSWERS.has(normCorrect)) {
          err(id, 'FILLBLANK_VAGUE_ANSWER',
            `fill_blank correctAnswer "${q.correctAnswer}" is a banned vague answer`);
        }
      }
    }
    // category must be fill_blank
    if (q.category !== 'fill_blank') {
      err(id, 'FILLBLANK_CATEGORY',
        `question with type "fill_blank" must have category "fill_blank" (got "${q.category}")`);
    }
  } else {
    // Standard multiple_choice: exactly 4 options
    if (!Array.isArray(q.options) || q.options.length !== 4) {
      err(id, 'OPTIONS_COUNT',
        `options must be an array of exactly 4 (found ${Array.isArray(q.options) ? q.options.length : typeof q.options})`);
    } else {
      q.options.forEach((opt, oi) => {
        if (typeof opt !== 'string' || opt.trim() === '') {
          err(id, 'OPTION_EMPTY', `option[${oi}] is empty or not a string`);
        }
      });
    }
    // correctAnswer must be in options
    if (Array.isArray(q.options) && q.correctAnswer !== undefined) {
      if (!q.options.includes(q.correctAnswer)) {
        err(id, 'ANSWER_NOT_IN_OPTIONS',
          `correctAnswer "${String(q.correctAnswer).slice(0, 60)}…" not found in options`);
      }
    }
  }

  // ── Recognition-question checks ───────────────────────────────────────────
  if (recognitionIdSet.has(q.id)) {
    // workId is mandatory for all recognition questions
    if (!q.workId) {
      err(id, 'RECOGNITION_MISSING_WORK_ID', 'recognition question must have workId');
    }
    // correctAnswer must equal the referenced work's title
    if (q.workId && workMap.has(q.workId)) {
      const expectedTitle = workMap.get(q.workId).title;
      if (q.correctAnswer !== expectedTitle) {
        err(id, 'RECOGNITION_ANSWER_MISMATCH',
          `recognition correctAnswer "${q.correctAnswer}" ≠ work.title "${expectedTitle}"`);
      }
    }
    // options must be exactly 4 unique values
    if (Array.isArray(q.options)) {
      if (new Set(q.options).size !== q.options.length) {
        err(id, 'RECOGNITION_DUPLICATE_OPTIONS', 'recognition question has duplicate options');
      }
    }
    // sourceFields must exist
    if (!Array.isArray(q.sourceFields) || q.sourceFields.length === 0) {
      err(id, 'RECOGNITION_MISSING_SOURCE_FIELDS', 'recognition question must have sourceFields array');
    }
  }

  // authorId must exist (skip match — it uses authorIds array instead)
  if (!isMatch && q.authorId && !authorMap.has(q.authorId)) {
    err(id, 'ORPHAN_AUTHOR', `question.authorId "${q.authorId}" not found in authors.json`);
  }

  // authorIds array for match questions
  if (isMatch && Array.isArray(q.authorIds)) {
    for (const aid of q.authorIds) {
      if (!authorMap.has(aid)) {
        err(id, 'ORPHAN_AUTHOR', `authorIds entry "${aid}" not found in authors.json`);
      }
    }
  }

  // workId must exist if set (skip match — it uses workIds array instead)
  if (!isMatch && q.workId !== null && q.workId !== undefined) {
    if (!workMap.has(q.workId)) {
      err(id, 'ORPHAN_WORK', `question.workId "${q.workId}" not found in works.json`);
    } else {
      const work = workMap.get(q.workId);
      if (work.authorId !== q.authorId) {
        err(id, 'AUTHOR_WORK_MISMATCH',
          `question.authorId "${q.authorId}" ≠ work "${q.workId}".authorId "${work.authorId}"`);
      }
    }
  }

  // workIds array for match questions
  if (isMatch && Array.isArray(q.workIds)) {
    for (const wid of q.workIds) {
      if (!workMap.has(wid)) {
        err(id, 'ORPHAN_WORK', `workIds entry "${wid}" not found in works.json`);
      }
    }
  }

  // difficulty
  if (q.difficulty && !VALID_DIFFICULTIES.has(q.difficulty)) {
    err(id, 'INVALID_DIFFICULTY', `difficulty "${q.difficulty}" is not valid (must be easy/medium/hard)`);
  }

  // category
  if (q.category && !VALID_CATEGORIES.has(q.category)) {
    err(id, 'INVALID_CATEGORY', `category "${q.category}" is not a recognised category`);
  }

  // empty explanation
  if (typeof q.explanation === 'string' && q.explanation.trim() === '') {
    err(id, 'EMPTY_EXPLANATION', 'explanation is empty');
  }

  // ── Suspicious placeholder patterns ──────────────────────────────────────

  for (const { pattern, label } of SUSPICIOUS_PATTERNS) {
    if (q.question && pattern.test(q.question)) {
      warn(id, 'SUSPICIOUS_TEXT', `question text contains suspicious pattern ${label}`);
    }
    if (q.explanation && pattern.test(q.explanation)) {
      warn(id, 'SUSPICIOUS_TEXT', `explanation contains suspicious pattern ${label}`);
    }
    if (Array.isArray(q.options)) {
      q.options.forEach((opt, oi) => {
        if (pattern.test(opt)) {
          warn(id, 'SUSPICIOUS_TEXT', `option[${oi}] contains suspicious pattern ${label}`);
        }
      });
    }
  }

  // ── Length warnings ───────────────────────────────────────────────────────

  if (q.question && q.question.length > QUESTION_MAX) {
    warn(id, 'LONG_QUESTION', `question is ${q.question.length} chars (max ${QUESTION_MAX})`);
  }

  if (q.explanation && q.explanation.length > EXPLANATION_MAX) {
    warn(id, 'LONG_EXPLANATION', `explanation is ${q.explanation.length} chars (max ${EXPLANATION_MAX})`);
  }

  if (!isMatch && Array.isArray(q.options)) {
    q.options.forEach((opt, oi) => {
      if (opt.length > OPTION_MAX) {
        warn(id, 'LONG_OPTION', `option[${oi}] is ${opt.length} chars (max ${OPTION_MAX}): "${opt.slice(0, 60)}…"`);
      }
    });
  }

  // ── First-name clustering in author-option questions ──────────────────────
  // Warn when 3+ options share the same first name — the options become hard
  // to distinguish at a glance.  Only checked for author-typed categories.
  if (['author', 'nickname'].includes(q.category) && Array.isArray(q.options)) {
    const fnCounts = {};
    for (const opt of q.options) {
      const fn = opt.split(' ')[0];
      fnCounts[fn] = (fnCounts[fn] || 0) + 1;
    }
    for (const [fn, cnt] of Object.entries(fnCounts)) {
      if (cnt >= 3) {
        warn(id, 'CLUSTERED_FIRST_NAME',
          `${cnt} options share first name "${fn}" — distractors are hard to distinguish`);
      }
    }
  }

  // ── Generic explanation warnings ──────────────────────────────────────────

  if (q.explanation) {
    for (const pat of GENERIC_EXPLANATION_PATTERNS) {
      if (pat.test(q.explanation)) {
        warn(id, 'GENERIC_EXPLANATION', `explanation matches generic pattern /${pat.source}/`);
        break;
      }
    }
  }

  // ── English words in Bulgarian content ───────────────────────────────────

  for (const field of ['question', 'explanation']) {
    const text = q[field];
    if (!text) continue;
    const matches = [...text.matchAll(ENGLISH_WORD_PATTERN)]
      .map(m => m[0])
      .filter(w => !ALLOWED_ENGLISH.has(w.toLowerCase()));
    if (matches.length > 0) {
      warn(id, 'ENGLISH_WORDS', `${field} contains English words: ${matches.slice(0, 5).join(', ')}`);
    }
  }

  // ── Bulgarian quotation marks ─────────────────────────────────────────────
  // Warn if ASCII quotes appear around Bulgarian text (common mistake)
  for (const field of ['question', 'explanation']) {
    const text = q[field];
    if (!text) continue;
    // Detect straight double quotes used as Bulgarian quotes
    if (/[А-Яа-яЁёЪъЙйїієі]"[А-Яа-яЁёЪъЙйїієі]/.test(text) ||
        /"[А-Яа-яЁёЪъЙйїієі]/.test(text)) {
      // Only warn if they're not the standard „…" or „…" form
      if (!text.includes('„') && text.includes('"')) {
        warn(id, 'QUOTES', `${field} may use ASCII quotes instead of Bulgarian „…"`);
      }
    }
  }
});

// ── 5. Content consistency checks ────────────────────────────────────────────

questions.forEach(q => {
  const id    = q.id;
  const qType = q.type || 'multiple_choice';
  // match_author_work and fill_blank have their own validation — skip generic consistency checks
  if (qType === 'match_author_work') return;
  if (qType === 'fill_blank') return;

  // genre: correctAnswer should match work.genre when workId is set
  if (q.category === 'genre' && q.workId) {
    const work = workMap.get(q.workId);
    if (work && q.correctAnswer !== work.genre) {
      err(id, 'GENRE_MISMATCH',
        `genre question correctAnswer "${q.correctAnswer}" ≠ work.genre "${work.genre}"`);
    }
  }

  // period: correctAnswer should match work.year_or_period when workId is set
  if (q.category === 'period' && q.workId) {
    const work = workMap.get(q.workId);
    if (work && q.correctAnswer !== work.year_or_period) {
      err(id, 'PERIOD_MISMATCH',
        `period question correctAnswer "${q.correctAnswer}" ≠ work.year_or_period "${work.year_or_period}"`);
    }
  }

  // period: check against author.period when no workId
  if (q.category === 'period' && !q.workId && q.authorId) {
    const author = authorMap.get(q.authorId);
    if (author && author.period && q.correctAnswer !== author.period) {
      warn(id, 'PERIOD_AUTHOR_MISMATCH',
        `period question correctAnswer "${q.correctAnswer.slice(0, 60)}" may not match author.period "${author.period.slice(0, 60)}"`);
    }
  }

  // nickname: correctAnswer should match author.nickname
  if (q.category === 'nickname' && q.authorId) {
    const author = authorMap.get(q.authorId);
    if (author && author.nickname && q.correctAnswer !== author.nickname) {
      err(id, 'NICKNAME_MISMATCH',
        `nickname question correctAnswer "${q.correctAnswer}" ≠ author.nickname "${author.nickname}"`);
    }
  }

  // Warn if question text mentions a known work title but workId is null
  // (skip for match and fill_blank questions which have null workId by design)
  if (!q.workId && qType !== 'match_author_work' && qType !== 'fill_blank') {
    for (const w of works) {
      if (q.question.includes(w.title) || (q.correctAnswer || '').includes(w.title)) {
        if (w.authorId === q.authorId) {
          warn(id, 'MISSING_WORK_ID',
            `question mentions "${w.title}" but workId is null (work id: ${w.id})`);
          break;
        }
      }
    }
  }
});

// ── 6. Statistics ─────────────────────────────────────────────────────────────

const catCounts  = {};
const diffCounts = {};
const authorQCounts = {};
const workQCounts   = {};

questions.forEach(q => {
  catCounts[q.category]    = (catCounts[q.category]    || 0) + 1;
  diffCounts[q.difficulty] = (diffCounts[q.difficulty] || 0) + 1;
  if (q.authorId) {
    authorQCounts[q.authorId] = (authorQCounts[q.authorId] || 0) + 1;
  } else if (Array.isArray(q.authorIds)) {
    // match_author_work — count once per author in the group
    for (const aid of q.authorIds) {
      authorQCounts[aid] = (authorQCounts[aid] || 0) + 1;
    }
  }
  if (q.workId) {
    workQCounts[q.workId] = (workQCounts[q.workId] || 0) + 1;
  } else if (Array.isArray(q.workIds)) {
    for (const wid of q.workIds) {
      workQCounts[wid] = (workQCounts[wid] || 0) + 1;
    }
  }
});

// Author name resolution for report
const authorQCountsNamed = {};
for (const [authorId, count] of Object.entries(authorQCounts)) {
  const name = authorMap.get(authorId)?.name || authorId;
  authorQCountsNamed[name] = count;
}

const workQCountsNamed = {};
for (const [workId, count] of Object.entries(workQCounts)) {
  const title = workMap.get(workId)?.title || workId;
  workQCountsNamed[title] = count;
}

// ── 7. Build report objects ───────────────────────────────────────────────────

const needsReview = [
  ...new Set([
    ...errors.map(e => e.id),
    ...warnings.filter(w =>
      ['GENRE_MISMATCH', 'PERIOD_MISMATCH', 'NICKNAME_MISMATCH', 'AUTHOR_WORK_MISMATCH'].includes(w.code)
    ).map(w => w.id),
  ])
].filter(id => id !== 'authors.json' && id !== 'works.json' && id !== 'questions.json');

const summary = {
  authors:                authors.length,
  works:                  works.length,
  baseQuestions:          baseQuestions.length,
  generatedQuestions:     variantQuestions.length,
  typeQuestions:          typeQuestions.length,
  fillBlankQuestions:     fillBlankQuestions.length,
  recognitionQuestions:   recognitionQuestions.length,
  totalQuestions:         questions.length,
  totalErrors:          errors.length,
  totalWarnings:        warnings.length,
  questionsWithErrors:      [...new Set(errors.map(e => e.id))].filter(id => seenQIds.has(id)).length,
  questionsNeedingReview:   needsReview.length,
};

const jsonReport = {
  generatedAt: new Date().toISOString(),
  summary,
  categoryCounts:  catCounts,
  difficultyCounts: diffCounts,
  authorQuestionCounts: authorQCountsNamed,
  workQuestionCounts: workQCountsNamed,
  errors:   errors.slice(0, 200),
  warnings: warnings.slice(0, 500),
  questionsNeedingReview: needsReview,
};

// ── 8. Markdown report ────────────────────────────────────────────────────────

function table(rows) {
  if (rows.length === 0) return '_No entries._\n';
  const headers = Object.keys(rows[0]);
  const sep = headers.map(h => '-'.repeat(Math.max(h.length, 4)));
  const line = cols => `| ${cols.join(' | ')} |`;
  return [
    line(headers),
    line(sep),
    ...rows.map(r => line(headers.map(h => String(r[h] ?? '')))),
  ].join('\n') + '\n';
}

function sortedTable(obj, keyLabel = 'Name', valLabel = 'Count') {
  return table(
    Object.entries(obj)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => ({ [keyLabel]: k, [valLabel]: v }))
  );
}

const md = `# Literatura Quiz — Content QA Report

Generated: ${new Date().toLocaleString('bg-BG')}

---

## Summary

| Metric | Value |
|--------|-------|
| Authors | ${summary.authors} |
| Works | ${summary.works} |
| Base questions (questions.json) | ${summary.baseQuestions} |
| Generated variants (questions.v2.json) | ${summary.generatedQuestions} |
| Generated type questions (questions.types.json) | ${summary.typeQuestions} |
| **Total questions** | **${summary.totalQuestions}** |
| **Total errors** | **${summary.totalErrors}** |
| **Total warnings** | **${summary.totalWarnings}** |
| Questions with errors | ${summary.questionsWithErrors} |
| Questions needing review | ${summary.questionsNeedingReview} |

---

## Category distribution

${sortedTable(catCounts, 'Category', 'Questions')}

## Difficulty distribution

${table(
  ['easy', 'medium', 'hard'].map(d => ({
    Difficulty: DIFFICULTY_LABELS[d] || d,
    Questions: diffCounts[d] || 0,
  }))
)}

## Questions per author (top 20)

${sortedTable(authorQCountsNamed, 'Author', 'Questions')}

## Questions per work (top 20, works with questions only)

${sortedTable(workQCountsNamed, 'Work', 'Questions')}

---

## Top errors${errors.length > 20 ? ' (first 20 of ' + errors.length + ')' : ''}

${errors.length === 0 ? '_No errors found._\n' : table(
  errors.slice(0, 20).map(e => ({
    ID: e.id.length > 45 ? e.id.slice(0, 42) + '…' : e.id,
    Code: e.code,
    Message: e.message.length > 80 ? e.message.slice(0, 77) + '…' : e.message,
  }))
)}

## Top warnings${warnings.length > 50 ? ' (first 50 of ' + warnings.length + ')' : ''}

${warnings.length === 0 ? '_No warnings found._\n' : table(
  warnings.slice(0, 50).map(w => ({
    ID: w.id.length > 45 ? w.id.slice(0, 42) + '…' : w.id,
    Code: w.code,
    Message: w.message.length > 80 ? w.message.slice(0, 77) + '…' : w.message,
  }))
)}

---

## Recommendations

${buildRecommendations()}

---

_Report generated by scripts/qa-content.mjs_
`;

function buildRecommendations() {
  const recs = [];

  // Error-based
  const errorCodes = errors.reduce((acc, e) => { acc[e.code] = (acc[e.code] || 0) + 1; return acc; }, {});
  const warnCodes  = warnings.reduce((acc, w) => { acc[w.code] = (acc[w.code] || 0) + 1; return acc; }, {});

  if (errors.length === 0) {
    recs.push('✅ **No errors** — all technical validation checks passed.');
  } else {
    if (errorCodes.GENRE_MISMATCH)   recs.push(`❌ Fix **${errorCodes.GENRE_MISMATCH} genre mismatch(es)** — correctAnswer does not match work.genre.`);
    if (errorCodes.PERIOD_MISMATCH)  recs.push(`❌ Fix **${errorCodes.PERIOD_MISMATCH} period mismatch(es)** — correctAnswer does not match work.year_or_period.`);
    if (errorCodes.NICKNAME_MISMATCH) recs.push(`❌ Fix **${errorCodes.NICKNAME_MISMATCH} nickname mismatch(es)** — correctAnswer does not match author.nickname.`);
    if (errorCodes.ANSWER_NOT_IN_OPTIONS) recs.push(`❌ Fix **${errorCodes.ANSWER_NOT_IN_OPTIONS} question(s)** where correctAnswer is not in options.`);
    if (errorCodes.DUPLICATE_ID)     recs.push(`❌ Fix **${errorCodes.DUPLICATE_ID} duplicate question id(s)**.`);
    if (errorCodes.DUPLICATE_TEXT)   recs.push(`❌ Fix **${errorCodes.DUPLICATE_TEXT} duplicate question text(s)**.`);
    if (errorCodes.AUTHOR_WORK_MISMATCH) recs.push(`❌ Fix **${errorCodes.AUTHOR_WORK_MISMATCH} author/work mismatch(es)** where question.authorId ≠ work.authorId.`);
    if (errorCodes.ORPHAN_AUTHOR)    recs.push(`❌ Fix **${errorCodes.ORPHAN_AUTHOR}** reference(s) to non-existent author ids.`);
    if (errorCodes.ORPHAN_WORK)      recs.push(`❌ Fix **${errorCodes.ORPHAN_WORK}** reference(s) to non-existent work ids.`);
    if (errorCodes.EMPTY_EXPLANATION) recs.push(`❌ Add explanations to **${errorCodes.EMPTY_EXPLANATION} question(s)** with empty explanation.`);
    if (errorCodes.MISSING_FIELD)    recs.push(`❌ Fix **${errorCodes.MISSING_FIELD} missing required field(s)**.`);
  }

  if (warnCodes.MISSING_WORK_ID) {
    recs.push(`⚠️ Consider adding workId to **${warnCodes.MISSING_WORK_ID} question(s)** that mention a known work title but have workId=null.`);
  }
  if (warnCodes.LONG_OPTION) {
    recs.push(`⚠️ Review **${warnCodes.LONG_OPTION} option(s)** longer than ${OPTION_MAX} characters — they may be hard to read on mobile.`);
  }
  if (warnCodes.LONG_QUESTION) {
    recs.push(`⚠️ Shorten **${warnCodes.LONG_QUESTION} question(s)** longer than ${QUESTION_MAX} characters.`);
  }
  if (warnCodes.LONG_EXPLANATION) {
    recs.push(`⚠️ Shorten **${warnCodes.LONG_EXPLANATION} explanation(s)** longer than ${EXPLANATION_MAX} characters.`);
  }
  if (warnCodes.PERIOD_AUTHOR_MISMATCH) {
    recs.push(`⚠️ Manually review **${warnCodes.PERIOD_AUTHOR_MISMATCH} period question(s)** where the correct answer may not match author.period.`);
  }
  if (warnCodes.GENERIC_EXPLANATION) {
    recs.push(`⚠️ Improve **${warnCodes.GENERIC_EXPLANATION} generic explanation(s)** — they contain low-information boilerplate text.`);
  }
  if (warnCodes.ENGLISH_WORDS) {
    recs.push(`⚠️ Check **${warnCodes.ENGLISH_WORDS} question(s)/explanation(s)** containing English words.`);
  }
  if (warnCodes.SUSPICIOUS_TEXT) {
    recs.push(`⚠️ Review **${warnCodes.SUSPICIOUS_TEXT} item(s)** with suspicious placeholder text.`);
  }
  if (warnCodes.QUOTES) {
    recs.push(`⚠️ Fix **${warnCodes.QUOTES} item(s)** with ASCII quotes — use Bulgarian „…" quotation marks.`);
  }
  if (warnCodes.CLUSTERED_FIRST_NAME) {
    recs.push(`⚠️ Fix **${warnCodes.CLUSTERED_FIRST_NAME} question(s)** where 3+ options share the same first name — regenerate with diverse distractors.`);
  }

  if (recs.length === 0) recs.push('✅ No recommendations — content looks clean!');
  return recs.map(r => `- ${r}`).join('\n');
}

// ── 9. Write reports ──────────────────────────────────────────────────────────

mkdirSync(resolve(root, 'reports'), { recursive: true });

writeFileSync(
  resolve(root, 'reports/qa-report.json'),
  JSON.stringify(jsonReport, null, 2),
  'utf8'
);

writeFileSync(
  resolve(root, 'reports/qa-report.md'),
  md,
  'utf8'
);

// ── 10. Console summary ───────────────────────────────────────────────────────

const RED    = '\x1b[31m';
const YELLOW = '\x1b[33m';
const GREEN  = '\x1b[32m';
const CYAN   = '\x1b[36m';
const BOLD   = '\x1b[1m';
const RESET  = '\x1b[0m';

console.log('');
console.log(`${BOLD}${CYAN}━━━ Literatura Quiz — Content QA ━━━${RESET}`);
console.log(`  Authors:    ${authors.length}`);
console.log(`  Works:      ${works.length}`);
console.log(`  Questions:  ${summary.baseQuestions} base + ${summary.generatedQuestions} variants + ${summary.typeQuestions} types + ${summary.fillBlankQuestions} fill-blank + ${summary.recognitionQuestions} recognition = ${summary.totalQuestions} total`);
console.log('');

if (errors.length === 0) {
  console.log(`${GREEN}${BOLD}  ✓ Errors:   0${RESET}`);
} else {
  console.log(`${RED}${BOLD}  ✗ Errors:   ${errors.length}${RESET}`);
  const topCodes = Object.entries(
    errors.reduce((a, e) => { a[e.code] = (a[e.code]||0)+1; return a; }, {})
  ).sort((a,b) => b[1]-a[1]).slice(0, 5);
  topCodes.forEach(([code, n]) => console.log(`${RED}    ${code}: ${n}${RESET}`));
}

if (warnings.length === 0) {
  console.log(`${GREEN}${BOLD}  ✓ Warnings: 0${RESET}`);
} else {
  console.log(`${YELLOW}${BOLD}  ⚠ Warnings: ${warnings.length}${RESET}`);
  const topCodes = Object.entries(
    warnings.reduce((a, w) => { a[w.code] = (a[w.code]||0)+1; return a; }, {})
  ).sort((a,b) => b[1]-a[1]).slice(0, 5);
  topCodes.forEach(([code, n]) => console.log(`${YELLOW}    ${code}: ${n}${RESET}`));
}

console.log('');
console.log(`${BOLD}  Reports saved:${RESET}`);
console.log('    reports/qa-report.json');
console.log('    reports/qa-report.md');
console.log('');

if (errors.length > 0) {
  process.exitCode = 1;
}
