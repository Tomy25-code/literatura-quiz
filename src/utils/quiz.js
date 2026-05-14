export const QUIZ_LENGTH = 10;

export const MODE_LABELS = {
  random: 'Случаен тест',
  author: 'Тест по автор',
  work: 'Тест по произведение',
  category: 'Тест по категория',
  difficulty: 'Тест по трудност',
  wrong: 'Преговор на грешните',
  weakSpots: 'Слаби места',
  dailyPractice: 'Дневна тренировка',
};

export const CATEGORY_LABELS = {
  author: 'Автор',
  work: 'Произведение',
  work_recognition: 'Разпознаване на творби',
  genre: 'Жанр',
  period: 'Период',
  nickname: 'Псевдоним/прякор',
  creative_history: 'Творческа история',
  composition: 'Композиция',
  themes: 'Теми',
  motifs: 'Мотиви',
  literary_context: 'Литературен контекст',
  true_false: 'Вярно/невярно',
  match_author_work: 'Свържи автор с произведение',
  essay_preparation: 'Подготовка за съчинение',
  fill_blank: 'Попълни липсваща дума',
};

export const DIFFICULTY_LABELS = {
  easy: 'Лесно',
  medium: 'Средно',
  hard: 'Трудно',
};

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Returns true if question q belongs to the given category for filtering purposes.
 *
 * The "true_false" category is type-gated: only questions with an explicit
 * `type: "true_false"` field are considered binary true/false questions.
 * Base questions that carry `category: "true_false"` but no `type` are
 * statement-selection questions ("Кое твърдение е вярно...") and must not
 * appear under the "Вярно/невярно" filter.
 */
export function questionMatchesCategory(q, category) {
  if (q.category !== category) return false;
  if (category === 'true_false') return q.type === 'true_false';
  return true;
}

export function buildQuiz(allQuestions, mode, filterValue, allWorks = [], length = QUIZ_LENGTH) {
  let pool;

  switch (mode) {
    case 'author':
      pool = allQuestions.filter(q =>
        q.authorId === filterValue ||
        (q.authorIds && q.authorIds.includes(filterValue))
      );
      break;

    case 'work': {
      const work = allWorks.find(w => w.id === filterValue);
      const primary = allQuestions.filter(q =>
        q.workId === filterValue ||
        (q.workIds && q.workIds.includes(filterValue))
      );
      if (!work || primary.length >= length) {
        pool = primary;
      } else {
        const secondary = shuffle(
          allQuestions.filter(q => q.authorId === work.authorId && q.workId !== filterValue)
        );
        pool = [...primary, ...secondary.slice(0, length - primary.length)];
      }
      break;
    }

    case 'category':
      pool = allQuestions.filter(q => questionMatchesCategory(q, filterValue));
      break;

    case 'difficulty':
      pool = allQuestions.filter(q => q.difficulty === filterValue);
      break;

    default: // random
      pool = allQuestions;
  }

  return shuffle([...pool])
    .slice(0, length)
    .map(q => {
      const shuffled = { ...q, options: shuffle([...(q.options || [])]) };
      if ((q.type || 'multiple_choice') === 'match_author_work' && q.pairs) {
        shuffled.pairs = shuffle([...q.pairs]);
      }
      return shuffled;
    });
}
