import { shuffle } from './quiz.js';
import { getWeakSets } from './weakSpots.js';

const STORAGE_KEY = 'literaturaQuizDailyPractice';

export function getLocalDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getYesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return getLocalDateKey(d);
}

export function getDailyPracticeState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { lastDate: null, count: 0, streak: 0, bestStreak: 0 };
    return { lastDate: null, count: 0, streak: 0, bestStreak: 0, ...JSON.parse(raw) };
  } catch {
    return { lastDate: null, count: 0, streak: 0, bestStreak: 0 };
  }
}

export function saveDailyPracticeCompletion() {
  const today = getLocalDateKey();
  const state = getDailyPracticeState();
  const count = (state.count || 0) + 1;

  let streak = state.streak || 0;
  if (state.lastDate === today) {
    // already completed today — streak unchanged
  } else if (state.lastDate === getYesterdayKey()) {
    streak += 1;
  } else {
    streak = 1;
  }

  const bestStreak = Math.max(state.bestStreak || 0, streak);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ lastDate: today, count, streak, bestStreak }));
  } catch {}
}

/**
 * Builds a balanced daily practice quiz using a 40/40/20 pool split.
 *
 * Quota strategy (always sums to `length`):
 *   wrongQuota  = floor(length × 0.4)
 *   weakQuota   = floor(length × 0.4)
 *   randomQuota = length − wrongQuota − weakQuota
 *
 * Pool A — Wrong (highest priority): active wrong-answer queue.
 * Pool B — Weak: questions in weak categories/difficulties not yet selected.
 *   Admission: category/difficulty accuracy < 70% over ≥ 10 answers.
 *   Historical wrong count used for sorting only, not for admission.
 * Pool C — Random: remaining questions, unseen questions preferred.
 *
 * Shortfall redistribution:
 *   wrong shortage → flows to weak quota
 *   weak shortage  → flows to random quota
 *   random shortage → quiz is shorter (no duplication)
 *
 * Returns { questions: [...], emptyReason: null | 'empty' }.
 */
export function buildDailyPracticeQuiz({ questions, stats, wrongQuestionIds, length }) {
  const wrongIdSet = new Set(wrongQuestionIds);

  const wrongQuota = Math.floor(length * 0.4);
  const weakQuota = Math.floor(length * 0.4);
  const baseRandomQuota = length - wrongQuota - weakQuota;

  const selected = new Set();
  const result = [];

  // --- Pool A: wrong ---
  const wrongPool = shuffle(questions.filter(q => wrongIdSet.has(q.id)));
  const wrongTaken = wrongPool.slice(0, wrongQuota);
  for (const q of wrongTaken) { selected.add(q.id); result.push(q); }
  const wrongOverflow = wrongQuota - wrongTaken.length;

  // --- Pool B: weak ---
  const { weakCategories, weakDifficulties } = getWeakSets({ stats, questions });

  const wrongCounts = {};
  const correctCounts = {};
  for (const attempt of stats) {
    for (const id of (attempt.wrongIds || [])) wrongCounts[id] = (wrongCounts[id] || 0) + 1;
    for (const id of (attempt.correctIds || [])) correctCounts[id] = (correctCounts[id] || 0) + 1;
  }

  const weakPool = questions.filter(q =>
    !selected.has(q.id) &&
    (weakCategories.has(q.category) || weakDifficulties.has(q.difficulty))
  );

  const scoredWeak = weakPool.map(q => {
    let score = 0;
    if (wrongIdSet.has(q.id)) score += 4;
    score += (wrongCounts[q.id] || 0) * 3;
    if (weakCategories.has(q.category)) score += 2;
    if (weakDifficulties.has(q.difficulty)) score += 1;
    score -= (correctCounts[q.id] || 0);
    return { q, score };
  });
  scoredWeak.sort((a, b) => b.score - a.score || Math.random() - 0.5);

  const effectiveWeakQuota = weakQuota + wrongOverflow;
  const weakTaken = scoredWeak.slice(0, effectiveWeakQuota).map(({ q }) => q);
  for (const q of weakTaken) { selected.add(q.id); result.push(q); }
  const weakOverflow = effectiveWeakQuota - weakTaken.length;

  // --- Pool C: random (unseen first) ---
  const seenIds = new Set(stats.flatMap(a => a.questionIds || []));
  const remaining = questions.filter(q => !selected.has(q.id));
  const randomPool = [
    ...shuffle(remaining.filter(q => !seenIds.has(q.id))),
    ...shuffle(remaining.filter(q => seenIds.has(q.id))),
  ];

  const effectiveRandomQuota = baseRandomQuota + weakOverflow;
  const randomTaken = randomPool.slice(0, effectiveRandomQuota);
  for (const q of randomTaken) { result.push(q); }

  if (result.length === 0) return { questions: [], emptyReason: 'empty' };

  return {
    questions: shuffle(result).map(q => {
      const shuffled = { ...q, options: shuffle([...(q.options || [])]) };
      if ((q.type || 'multiple_choice') === 'match_author_work' && q.pairs) {
        shuffled.pairs = shuffle([...q.pairs]);
      }
      return shuffled;
    }),
    emptyReason: null,
  };
}
