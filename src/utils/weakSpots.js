import { computeCategoryStats, computeDifficultyStats } from './stats.js';
import { shuffle } from './quiz.js';

const MIN_SEEN = 3;       // minimum answered in a category/difficulty before it can be "weak"
const WEAK_THRESHOLD = 0.70;

/**
 * Builds a strict weak-spots quiz pool.
 *
 * Returns { questions: [...], emptyReason: null | 'no-weak-spots' }
 *   - emptyReason null   → proceed with quiz
 *   - emptyReason 'no-weak-spots' → user has stats but no qualifying weak questions
 *
 * Callers must check stats.length === 0 BEFORE calling this function and
 * show the "no-stats" empty state themselves.
 *
 * A question qualifies if it meets at least one of:
 *   1. Currently in the active wrong-answers list
 *   2. Previously answered incorrectly at least once (in stats history)
 *   3. Belongs to a weak category  (accuracy < 70%, ≥ MIN_SEEN answered)
 *   4. Belongs to a weak difficulty (accuracy < 70%, ≥ MIN_SEEN answered)
 *
 * Unseen questions and random global fallback are never included.
 * If fewer questions qualify than the requested length, the quiz is shorter.
 *
 * Within the qualifying pool, questions are ranked:
 *   +4  currently in wrong-answers list
 *   +3  per historical wrong answer
 *   +2  belongs to a weak category
 *   +1  belongs to a weak difficulty
 *   −1  per historical correct answer (de-prioritises already-improving questions)
 * Ties broken randomly so the selection varies across sessions.
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

  const catStats = computeCategoryStats(stats, questions);
  const diffStats = computeDifficultyStats(stats, questions);

  const weakCategories = new Set(
    Object.entries(catStats)
      .filter(([, s]) => s.total >= MIN_SEEN && s.correct / s.total < WEAK_THRESHOLD)
      .map(([cat]) => cat)
  );
  const weakDifficulties = new Set(
    Object.entries(diffStats)
      .filter(([, s]) => s.total >= MIN_SEEN && s.correct / s.total < WEAK_THRESHOLD)
      .map(([d]) => d)
  );

  const qualifying = questions.filter(q =>
    wrongIdSet.has(q.id) ||
    (wrongCounts[q.id] || 0) > 0 ||
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
    .map(({ q }) => ({ ...q, options: shuffle([...q.options]) }));

  return { questions: selected, emptyReason: null };
}
