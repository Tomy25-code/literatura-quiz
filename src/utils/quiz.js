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
  genre: 'Жанр',
  period: 'Период',
  nickname: 'Псевдоним/прякор',
  creative_history: 'Творческа история',
  composition: 'Композиция',
  themes: 'Теми',
  motifs: 'Мотиви',
  literary_context: 'Литературен контекст',
  true_false: 'Вярно/невярно',
  essay_preparation: 'Подготовка за съчинение',
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

export function buildQuiz(allQuestions, mode, filterValue, allWorks = [], length = QUIZ_LENGTH) {
  let pool;

  switch (mode) {
    case 'author':
      pool = allQuestions.filter(q => q.authorId === filterValue);
      break;

    case 'work': {
      const work = allWorks.find(w => w.id === filterValue);
      const primary = allQuestions.filter(q => q.workId === filterValue);
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
      pool = allQuestions.filter(q => q.category === filterValue);
      break;

    case 'difficulty':
      pool = allQuestions.filter(q => q.difficulty === filterValue);
      break;

    default: // random
      pool = allQuestions;
  }

  return shuffle([...pool])
    .slice(0, length)
    .map(q => ({ ...q, options: shuffle([...q.options]) }));
}
