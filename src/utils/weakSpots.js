import { computeCategoryStats, computeDifficultyStats } from './stats.js';
import { shuffle } from './quiz.js';

// Minimum questions answered in a category/difficulty before it can be "weak".
// 10 avoids noisy signals from small samples early in a session.
const MIN_SEEN = 10;
const WEAK_THRESHOLD = 0.70;

/**
 * Returns Sets of weak category and difficulty keys based on current stats.
 * Shared between Weak Spots mode and Daily Practice.
 */
export function getWeakSets({ stats, questions }) {
  const catStats = computeCategoryStats(stats, questions);
  const diffStats = computeDifficultyStats(stats, questions);
  return {
    weakCategories: new Set(
      Object.entries(catStats)
        .filter(([, s]) => s.total >= MIN_SEEN && s.correct / s.total < WEAK_THRESHOLD)
        .map(([cat]) => cat)
    ),
    weakDifficulties: new Set(
      Object.entries(diffStats)
        .filter(([, s]) => s.total >= MIN_SEEN && s.correct / s.total < WEAK_THRESHOLD)
        .map(([d]) => d)
    ),
  };
}

export function hasWeakSpots({ questions, wrongQuestionIds, stats }) {
  if (stats.length === 0) return false;
  if (wrongQuestionIds.length > 0) return true;
  const { weakCategories, weakDifficulties } = getWeakSets({ stats, questions });
  return weakCategories.size > 0 || weakDifficulties.size > 0;
}

/**
 * Wrong Review vs Weak Spots — what each mode targets:
 *
 *   Wrong Review ("Преговор на грешните"):
 *     The active wrong-answer queue — questions the user got wrong and has
 *     not yet answered correctly. This is a task list: work through it and
 *     it shrinks.
 *
 *   Weak Spots ("Слаби места"):
 *     Broader smart practice based on two signals:
 *       1. Active wrong-answer queue (same as Wrong Review — highest priority)
 *       2. Categories or difficulties where overall accuracy is statistically
 *          low (< 70% over at least 10 answered questions)
 *     Historical wrong counts alone are NOT a qualification criterion.
 *     A question that was once wrong but has since been mastered (removed
 *     from the active list) will not reappear unless its category or
 *     difficulty is genuinely weak.
 *
 * Returns { questions: [...], emptyReason: null | 'no-weak-spots' }
 *   emptyReason null          → quiz can start
 *   emptyReason 'no-weak-spots' → stats exist but nothing qualifies
 *
 * Callers must check stats.length === 0 before calling and show the
 * "no-stats" screen themselves.
 *
 * Qualification (a question needs at least one):
 *   A. Currently in the active wrong-answers list
 *   B. Belongs to a weak category  (accuracy < 70%, ≥ 10 answered)
 *   C. Belongs to a weak difficulty (accuracy < 70%, ≥ 10 answered)
 *
 * Historical wrong-answer count is used only as a scoring boost for
 * questions that already qualify through A, B, or C — not as an entry
 * criterion. This prevents mastered questions from re-entering the pool.
 *
 * Scoring within the qualifying pool:
 *   +4  currently in wrong-answers list
 *   +3  per historical wrong answer (boosts already-qualifying questions)
 *   +2  belongs to a weak category
 *   +1  belongs to a weak difficulty
 *   −1  per historical correct answer
 * Ties broken randomly so the selection varies across sessions.
 *
 * Quiz length = min(qualifying, requested). Never padded with random questions.
 */
export function buildWeakSpotsQuiz({ questions, wrongQuestionIds, stats, length }) {
  const wrongIdSet = new Set(wrongQuestionIds);
  const wrongCounts = {};
  const correctCounts = {};

  for (const attempt of stats) {
    for (const id of (attempt.wrongIds || [])) {
      wrongCounts[id] = (wrongCounts[id] || 0) + 1;
    }
    for (const id of (attempt.correctIds || [])) {
      correctCounts[id] = (correctCounts[id] || 0) + 1;
    }
  }

  const { weakCategories, weakDifficulties } = getWeakSets({ stats, questions });

  // Qualify on active wrong list OR statistically weak category/difficulty only.
  // Historical wrongCounts alone do NOT qualify — mastered questions stay out.
  const qualifying = questions.filter(q =>
    wrongIdSet.has(q.id) ||
    weakCategories.has(q.category) ||
    weakDifficulties.has(q.difficulty)
  );

  if (qualifying.length === 0) {
    return { questions: [], emptyReason: 'no-weak-spots' };
  }

  const scored = qualifying.map(q => {
    let score = 0;
    if (wrongIdSet.has(q.id)) score += 4;
    score += (wrongCounts[q.id] || 0) * 3;
    if (weakCategories.has(q.category)) score += 2;
    if (weakDifficulties.has(q.difficulty)) score += 1;
    score -= (correctCounts[q.id] || 0);
    return { q, score };
  });

  scored.sort((a, b) => b.score - a.score || Math.random() - 0.5);

  const selected = scored
    .slice(0, length)
    .map(({ q }) => {
      const shuffled = { ...q, options: shuffle([...(q.options || [])]) };
      if ((q.type || 'multiple_choice') === 'match_author_work' && q.pairs) {
        shuffled.pairs = shuffle([...q.pairs]);
      }
      return shuffled;
    });

  return { questions: selected, emptyReason: null };
}
