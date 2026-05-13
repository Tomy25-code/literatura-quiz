import { computeCategoryStats, computeDifficultyStats } from './stats.js';
import { shuffle } from './quiz.js';

// Categories/difficulties need at least this many seen questions before being
// considered "weak" — avoids false positives from single-question samples.
const MIN_SEEN = 3;
const WEAK_THRESHOLD = 0.70;

/**
 * Builds a quiz pool prioritised toward the user's weak areas.
 *
 * Priority (highest → lowest):
 *   1. Questions answered wrong multiple times (× 3 per wrong answer)
 *   2. Weak category (accuracy < 70%, ≥ 3 seen) → +2
 *   3. Never seen before → +2
 *   4. Weak difficulty (accuracy < 70%, ≥ 3 seen) → +1
 *   5. Already-correct answers reduce score (−1 per correct)
 *
 * Ties are broken randomly so the selection is shuffled, not deterministic.
 * Falls back to unseen/random questions when there are not enough weak ones.
 */
export function buildWeakSpotsQuiz({ questions, stats, length }) {
  const wrongCounts = {};
  const correctCounts = {};
  const seenIds = new Set();

  for (const attempt of stats) {
    for (const id of (attempt.wrongIds || [])) {
      wrongCounts[id] = (wrongCounts[id] || 0) + 1;
      seenIds.add(id);
    }
    for (const id of (attempt.correctIds || [])) {
      correctCounts[id] = (correctCounts[id] || 0) + 1;
      seenIds.add(id);
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

  const scored = questions.map(q => {
    const wrongs = wrongCounts[q.id] || 0;
    const corrects = correctCounts[q.id] || 0;

    let score = 0;
    score += wrongs * 3;
    if (weakCategories.has(q.category)) score += 2;
    if (!seenIds.has(q.id)) score += 2;
    if (weakDifficulties.has(q.difficulty)) score += 1;
    score -= corrects;

    return { q, score };
  });

  // Descending by score; ties broken randomly to keep the set varied
  scored.sort((a, b) => b.score - a.score || Math.random() - 0.5);

  return scored
    .slice(0, length)
    .map(({ q }) => ({ ...q, options: shuffle([...q.options]) }));
}
