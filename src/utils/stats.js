const STORAGE_KEY = 'literaturaQuizStats';

export function getStats() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export function saveAttempt(attempt) {
  try {
    const stats = getStats();
    stats.push(attempt);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {}
}

export function clearStats() {
  localStorage.removeItem(STORAGE_KEY);
}

export function computeCategoryStats(stats, allQuestions) {
  const questionMap = new Map(allQuestions.map(q => [q.id, q]));
  const catStats = {};

  stats.forEach(attempt => {
    const correctSet = new Set(attempt.correctIds || []);
    (attempt.questionIds || []).forEach(qId => {
      const q = questionMap.get(qId);
      if (!q?.category) return;
      if (!catStats[q.category]) catStats[q.category] = { total: 0, correct: 0 };
      catStats[q.category].total++;
      if (correctSet.has(qId)) catStats[q.category].correct++;
    });
  });

  return catStats;
}

/**
 * Returns per-authorId accuracy across all completed attempts.
 * Only counts questions that carry a single authorId field.
 * Match questions (authorIds array) are skipped — they span multiple authors.
 */
export function computeAuthorStats(stats, allQuestions) {
  const questionMap = new Map(allQuestions.map(q => [q.id, q]));
  const authorStats = {};

  stats.forEach(attempt => {
    const correctSet = new Set(attempt.correctIds || []);
    (attempt.questionIds || []).forEach(qId => {
      const q = questionMap.get(qId);
      if (!q?.authorId) return;
      if (!authorStats[q.authorId]) authorStats[q.authorId] = { total: 0, correct: 0 };
      authorStats[q.authorId].total++;
      if (correctSet.has(qId)) authorStats[q.authorId].correct++;
    });
  });

  return authorStats;
}

/**
 * Returns per-workId accuracy across all completed attempts.
 * Only counts questions that carry a single workId field.
 * Match questions (workIds array) are skipped — they span multiple works.
 */
export function computeWorkStats(stats, allQuestions) {
  const questionMap = new Map(allQuestions.map(q => [q.id, q]));
  const workStats = {};

  stats.forEach(attempt => {
    const correctSet = new Set(attempt.correctIds || []);
    (attempt.questionIds || []).forEach(qId => {
      const q = questionMap.get(qId);
      if (!q?.workId) return;
      if (!workStats[q.workId]) workStats[q.workId] = { total: 0, correct: 0 };
      workStats[q.workId].total++;
      if (correctSet.has(qId)) workStats[q.workId].correct++;
    });
  });

  return workStats;
}

export function computeDifficultyStats(stats, allQuestions) {
  const questionMap = new Map(allQuestions.map(q => [q.id, q]));
  const diffStats = {};

  stats.forEach(attempt => {
    const correctSet = new Set(attempt.correctIds || []);
    (attempt.questionIds || []).forEach(qId => {
      const q = questionMap.get(qId);
      if (!q?.difficulty) return;
      if (!diffStats[q.difficulty]) diffStats[q.difficulty] = { total: 0, correct: 0 };
      diffStats[q.difficulty].total++;
      if (correctSet.has(qId)) diffStats[q.difficulty].correct++;
    });
  });

  return diffStats;
}

export function buildAttempt({ quizMode, modeLabel, quizQuestions, score, answeredMap }) {
  const questionIds = quizQuestions.map(q => q.id);
  const correctIds = quizQuestions.filter(q => answeredMap[q.id] === true).map(q => q.id);
  const wrongIds = quizQuestions.filter(q => answeredMap[q.id] === false).map(q => q.id);
  const categories = [...new Set(quizQuestions.map(q => q.category).filter(Boolean))];
  const difficulties = [...new Set(quizQuestions.map(q => q.difficulty).filter(Boolean))];
  const percentage = quizQuestions.length > 0
    ? Math.round((score / quizQuestions.length) * 100)
    : 0;

  return {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    quizMode,
    modeLabel,
    totalQuestions: quizQuestions.length,
    correctAnswers: score,
    percentage,
    questionIds,
    correctIds,
    wrongIds,
    categories,
    difficulties,
  };
}
