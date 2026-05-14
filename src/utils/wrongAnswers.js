import { shuffle } from './quiz.js';

const STORAGE_KEY = 'literaturaQuizWrongReview';
const LEGACY_KEY = 'literaturaQuizWrongQuestionIds';
const MASTERY_THRESHOLD = 2;

// Migrate from legacy array format on first access.
// Old format: string[] of question IDs → new format: { [id]: ReviewRecord }
function migrateIfNeeded() {
  if (localStorage.getItem(STORAGE_KEY) !== null) return;
  const legacyRaw = localStorage.getItem(LEGACY_KEY);
  if (!legacyRaw) return;
  try {
    const legacyIds = JSON.parse(legacyRaw);
    if (!Array.isArray(legacyIds)) {
      localStorage.removeItem(LEGACY_KEY);
      return;
    }
    const now = new Date().toISOString();
    const records = {};
    for (const id of legacyIds) {
      records[id] = {
        id,
        wrongCount: 1,
        correctStreak: 0,
        lastWrongAt: now,
        lastCorrectAt: null,
        masteredAt: null,
        status: 'active',
      };
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    localStorage.removeItem(LEGACY_KEY);
  } catch {}
}

function saveRecords(records) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {}
}

export function getWrongReviewRecords() {
  migrateIfNeeded();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getWrongQuestionReviewMeta(id) {
  return getWrongReviewRecords()[id] || null;
}

// Returns IDs of all questions still in active wrong-review (not yet mastered).
export function getWrongQuestionIds() {
  return Object.values(getWrongReviewRecords())
    .filter(r => r.status === 'active')
    .map(r => r.id);
}

// Called on any wrong answer in any mode.
// Increments wrongCount, resets correctStreak, ensures status = 'active'.
export function saveWrongQuestionId(id) {
  const records = getWrongReviewRecords();
  const existing = records[id];
  records[id] = {
    id,
    wrongCount: (existing?.wrongCount || 0) + 1,
    correctStreak: 0,
    lastWrongAt: new Date().toISOString(),
    lastCorrectAt: existing?.lastCorrectAt || null,
    masteredAt: null,
    status: 'active',
  };
  saveRecords(records);
}

/**
 * Called on correct answers in focused remediation modes (Wrong Review, Weak Spots).
 * Advances correctStreak toward the mastery threshold.
 * At MASTERY_THRESHOLD consecutive correct answers the question is marked mastered.
 *
 * Returns { wasActive, mastered, correctStreak }.
 * wasActive=false if question was not in the active queue (no-op).
 */
export function recordWrongQuestionCorrect(id) {
  const records = getWrongReviewRecords();
  const existing = records[id];
  if (!existing || existing.status !== 'active') {
    return { wasActive: false, mastered: false, correctStreak: 0 };
  }
  const correctStreak = (existing.correctStreak || 0) + 1;
  const mastered = correctStreak >= MASTERY_THRESHOLD;
  records[id] = {
    ...existing,
    correctStreak,
    lastCorrectAt: new Date().toISOString(),
    masteredAt: mastered ? new Date().toISOString() : existing.masteredAt,
    status: mastered ? 'mastered' : 'active',
  };
  saveRecords(records);
  return { wasActive: true, mastered, correctStreak };
}

export function clearWrongQuestionIds() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(LEGACY_KEY);
}

/**
 * Builds a priority-sorted Wrong Review quiz.
 * Priority: higher wrongCount → lower correctStreak → more recent lastWrongAt → random.
 * Never padded with non-wrong questions.
 */
export function buildWrongReviewQuiz({ questions, length }) {
  const records = getWrongReviewRecords();
  const active = Object.values(records).filter(r => r.status === 'active');

  active.sort((a, b) => {
    if (b.wrongCount !== a.wrongCount) return b.wrongCount - a.wrongCount;
    if (a.correctStreak !== b.correctStreak) return a.correctStreak - b.correctStreak;
    if (a.lastWrongAt && b.lastWrongAt && a.lastWrongAt !== b.lastWrongAt) {
      return b.lastWrongAt > a.lastWrongAt ? 1 : -1;
    }
    return Math.random() - 0.5;
  });

  const topIds = new Set(active.slice(0, length).map(r => r.id));
  const questionMap = new Map(questions.map(q => [q.id, q]));

  return shuffle(
    [...topIds]
      .map(id => questionMap.get(id))
      .filter(Boolean)
      .map(q => {
        const shuffled = { ...q, options: shuffle([...(q.options || [])]) };
        if ((q.type || 'multiple_choice') === 'match_author_work' && q.pairs) {
          shuffled.pairs = shuffle([...q.pairs]);
        }
        return shuffled;
      })
  );
}
