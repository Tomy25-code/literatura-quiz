import { computeCategoryStats, computeAuthorStats, computeWorkStats } from './stats.js';
import { CATEGORY_LABELS } from './quiz.js';

const MIN_SEEN = 3;
const WEAK_THRESHOLD = 0.70;

function plural(n, one, many) {
  return n === 1 ? one : many;
}

function findWeakestCategory(stats, questions) {
  const catStats = computeCategoryStats(stats, questions);
  let best = null;
  let bestAcc = Infinity;

  for (const [cat, s] of Object.entries(catStats)) {
    if (s.total < MIN_SEEN) continue;
    const acc = s.correct / s.total;
    if (acc < bestAcc) {
      bestAcc = acc;
      best = cat;
    }
  }
  return best ? { category: best, accuracy: bestAcc } : null;
}

function findWeakestAuthor(stats, questions) {
  const authorStats = computeAuthorStats(stats, questions);
  let best = null;
  let bestAcc = Infinity;

  for (const [authorId, s] of Object.entries(authorStats)) {
    if (s.total < MIN_SEEN) continue;
    const acc = s.correct / s.total;
    if (acc >= WEAK_THRESHOLD) continue;
    if (acc < bestAcc || (acc === bestAcc && s.total > (best?.total || 0))) {
      bestAcc = acc;
      best = { authorId, accuracy: acc, total: s.total };
    }
  }
  return best;
}

function findWeakestWork(stats, questions) {
  const workStats = computeWorkStats(stats, questions);
  let best = null;
  let bestAcc = Infinity;

  for (const [workId, s] of Object.entries(workStats)) {
    if (s.total < MIN_SEEN) continue;
    const acc = s.correct / s.total;
    if (acc >= WEAK_THRESHOLD) continue;
    if (acc < bestAcc || (acc === bestAcc && s.total > (best?.total || 0))) {
      bestAcc = acc;
      best = { workId, accuracy: acc, total: s.total };
    }
  }
  return best;
}

function findTopWrongAuthorId(wrongQuestionIds, stats, questions) {
  const questionMap = new Map(questions.map(q => [q.id, q]));
  const authorCount = {};

  for (const id of wrongQuestionIds) {
    const q = questionMap.get(id);
    if (q?.authorId) authorCount[q.authorId] = (authorCount[q.authorId] || 0) + 2;
  }
  for (const attempt of (stats || []).slice(-5)) {
    for (const id of (attempt.wrongIds || [])) {
      const q = questionMap.get(id);
      if (q?.authorId) authorCount[q.authorId] = (authorCount[q.authorId] || 0) + 1;
    }
  }

  const top = Object.entries(authorCount).sort((a, b) => b[1] - a[1])[0];
  return top ? top[0] : null;
}

/**
 * Builds up to 3 actionable study recommendations based on existing localStorage data.
 * Read-only: does not write to localStorage, does not modify stats.
 *
 * Priority order:
 *   1. Active wrong review (if wrong queue is non-empty)
 *   2. Daily Practice (if not completed today)
 *   3. Weakest category (accuracy < 70%, ≥ 3 seen)
 *   4. Weakest author (accuracy < 70%, ≥ 3 seen)
 *   5. Weakest work (accuracy < 70%, ≥ 3 seen)
 *   6. Thesis Practice (if essay_preparation is weak and not already covered)
 *   7. Flashcards (with author hint, avoiding already-used author)
 *   8. Study Guide deep-link (for top wrong-answer author, avoiding already-used author)
 *   Fallback: starter plan when no stats and no wrong answers
 */
export function buildTodayPlan({ stats, wrongQuestionIds, dailyCompletedToday, questions, authors, works }) {
  const hasStats = stats.length > 0;
  const hasWrong = wrongQuestionIds.length > 0;

  if (!hasStats && !hasWrong) {
    return [
      {
        id: 'starter-random',
        title: 'Започни с кратък тест',
        description: 'Направи първи случаен тест, за да може приложението да открие силните и слабите ти места.',
        badge: null,
        buttonText: 'Случаен тест',
        action: { type: 'mode', modeId: 'random' },
      },
      {
        id: 'starter-flashcards',
        title: 'Преговори с флашкарти',
        description: 'Разгледай автори, произведения, жанрове и композиция.',
        badge: null,
        buttonText: 'Флашкарти',
        action: { type: 'mode', modeId: 'flashcards' },
      },
      {
        id: 'starter-study-guide',
        title: 'Отвори справочника',
        description: 'Избери автор или произведение и виж най-важното от записките.',
        badge: null,
        buttonText: 'Справочник',
        action: { type: 'mode', modeId: 'studyGuide' },
      },
    ];
  }

  const recs = [];
  // Track entities already targeted so flashcard/study-guide hints avoid duplicates.
  const usedAuthorIds = new Set();

  // 1. Wrong review
  if (hasWrong) {
    const count = wrongQuestionIds.length;
    recs.push({
      id: 'wrong-review',
      title: 'Преговори грешните въпроси',
      description: `Имаш ${count} ${plural(count, 'въпрос', 'въпроса')} за преговор.`,
      badge: 'Приоритет',
      buttonText: 'Започни преговор',
      action: { type: 'mode', modeId: 'wrong' },
    });
  }

  if (recs.length >= 3) return recs.slice(0, 3);

  // 2. Daily Practice (not completed today)
  if (!dailyCompletedToday) {
    recs.push({
      id: 'daily-practice',
      title: 'Направи дневната тренировка',
      description: 'Кратък балансиран тест за поддържане на серия.',
      badge: 'Днес',
      buttonText: 'Започни',
      action: { type: 'mode', modeId: 'dailyPractice' },
    });
  }

  if (recs.length >= 3) return recs.slice(0, 3);

  // 3. Weakest category — only when accuracy is genuinely below threshold
  const weakCat = hasStats ? findWeakestCategory(stats, questions) : null;
  if (weakCat && weakCat.accuracy < WEAK_THRESHOLD) {
    const label = CATEGORY_LABELS[weakCat.category] || weakCat.category;
    const pct = Math.round(weakCat.accuracy * 100);
    const isEssay = weakCat.category === 'essay_preparation';
    recs.push({
      id: 'weak-category',
      title: `Упражни категория: ${label}`,
      description: `Точност ${pct}% — тази категория е сред най-слабите ти.`,
      badge: 'Слаба категория',
      buttonText: isEssay ? 'Избери теза' : '5 въпроса',
      action: isEssay
        ? { type: 'mode', modeId: 'thesisPractice' }
        : { type: 'category-quiz', category: weakCat.category, label: `Тест по категория: ${label}` },
    });
  }

  if (recs.length >= 3) return recs.slice(0, 3);

  // 4. Weakest author
  const weakAuthor = hasStats ? findWeakestAuthor(stats, questions) : null;
  if (weakAuthor) {
    const author = authors?.find(a => a.id === weakAuthor.authorId);
    if (author) {
      usedAuthorIds.add(weakAuthor.authorId);
      const pct = Math.round(weakAuthor.accuracy * 100);
      recs.push({
        id: 'weak-author',
        title: `Упражни автор: ${author.name}`,
        description: `Точност ${pct}% — този автор има нужда от преговор.`,
        badge: 'Слаб автор',
        buttonText: '5 въпроса',
        action: { type: 'author-quiz', authorId: weakAuthor.authorId, label: `Тест по автор: ${author.name}` },
      });
    }
  }

  if (recs.length >= 3) return recs.slice(0, 3);

  // 5. Weakest work
  const weakWork = hasStats ? findWeakestWork(stats, questions) : null;
  if (weakWork) {
    const work = works?.find(w => w.id === weakWork.workId);
    if (work) {
      const pct = Math.round(weakWork.accuracy * 100);
      recs.push({
        id: 'weak-work',
        title: `Упражни произведение: „${work.title}"`,
        description: `Точност ${pct}% — това произведение има нужда от преговор.`,
        badge: 'Слабо произведение',
        buttonText: '5 въпроса',
        action: { type: 'work-quiz', workId: weakWork.workId, label: `Тест по произведение: „${work.title}"` },
      });
    }
  }

  if (recs.length >= 3) return recs.slice(0, 3);

  // 6. Thesis Practice if essay_preparation is weak and not already covered
  const alreadyHasThesis = recs.some(
    r => r.action.type === 'mode' && r.action.modeId === 'thesisPractice'
  );
  if (!alreadyHasThesis && hasStats) {
    const catStats = computeCategoryStats(stats, questions);
    const essayStat = catStats['essay_preparation'];
    if (essayStat && essayStat.total >= MIN_SEEN && essayStat.correct / essayStat.total < WEAK_THRESHOLD) {
      recs.push({
        id: 'thesis-practice',
        title: 'Упражни теза',
        description: 'Подходящо за подготовка за интерпретативно съчинение.',
        badge: 'Слаба категория',
        buttonText: 'Избери теза',
        action: { type: 'mode', modeId: 'thesisPractice' },
      });
    }
  }

  if (recs.length >= 3) return recs.slice(0, 3);

  // 7. Flashcards — with author hint, avoiding already-targeted authors
  const topAuthorId = findTopWrongAuthorId(wrongQuestionIds, stats, questions);
  const topAuthor = topAuthorId && !usedAuthorIds.has(topAuthorId)
    ? authors?.find(a => a.id === topAuthorId)
    : null;
  recs.push({
    id: 'flashcards',
    title: 'Преговори с флашкарти',
    description: topAuthor
      ? `Препоръчани флашкарти за ${topAuthor.name}.`
      : 'Разгледай автори, произведения, жанрове и композиция.',
    badge: 'Преговор',
    buttonText: 'Отвори флашкарти',
    action: { type: 'mode', modeId: 'flashcards' },
  });

  if (recs.length >= 3) return recs.slice(0, 3);

  // 8. Study Guide deep-link — avoid repeating the author already used in weak-author or flashcard hint
  if (topAuthor && !usedAuthorIds.has(topAuthorId)) {
    recs.push({
      id: 'study-guide',
      title: 'Преговори справочник',
      description: `Виж картата за ${topAuthor.name}.`,
      badge: null,
      buttonText: 'Отвори справочник',
      action: { type: 'study-guide', itemType: 'author', itemId: topAuthor.id },
    });
  }

  return recs.slice(0, 3);
}
