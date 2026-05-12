import { useState } from 'react';
import authors from './data/authors.json';
import works from './data/works.json';
import questions from './data/questions.json';
import Home from './components/Home';
import Quiz from './components/Quiz';
import Results from './components/Results';
import FilterSelection from './components/FilterSelection';
import FlashcardSelection from './components/FlashcardSelection';
import Flashcards from './components/Flashcards';
import { buildQuiz, shuffle, QUIZ_LENGTH, MODE_LABELS } from './utils/quiz';
import { buildAuthorCards, buildWorkCards, buildMixedCards } from './utils/flashcards';
import { getWrongQuestionIds } from './utils/wrongAnswers';
import './App.css';

export default function App() {
  const [screen, setScreen] = useState('home');
  const [quizMode, setQuizMode] = useState('random');
  const [quizFilter, setQuizFilter] = useState(null);
  const [modeLabel, setModeLabel] = useState('');
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [finalScore, setFinalScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(() => getWrongQuestionIds().length);
  const [flashcardDeck, setFlashcardDeck] = useState([]);
  const [filterError, setFilterError] = useState('');

  function startQuiz(mode, filterValue, label) {
    let qs;
    if (mode === 'wrong') {
      const wrongIds = getWrongQuestionIds();
      const pool = questions.filter(q => wrongIds.includes(q.id));
      qs = shuffle([...pool])
        .slice(0, QUIZ_LENGTH)
        .map(q => ({ ...q, options: shuffle([...q.options]) }));
    } else {
      qs = buildQuiz(questions, mode, filterValue, works);
    }
    setQuizMode(mode);
    setQuizFilter(filterValue);
    setModeLabel(label);
    setQuizQuestions(qs);
    setScreen('quiz');
  }

  function handleModeSelect(mode) {
    setFilterError('');
    if (mode === 'random') {
      startQuiz('random', null, MODE_LABELS.random);
    } else if (mode === 'wrong') {
      startQuiz('wrong', null, MODE_LABELS.wrong);
    } else if (mode === 'flashcards') {
      setScreen('flashcard-select');
    } else {
      setQuizMode(mode);
      setScreen('filter');
    }
  }

  function handleFilterSelect(filterValue, label) {
    const testPool = buildQuiz(questions, quizMode, filterValue, works);
    if (testPool.length === 0) {
      setFilterError('Няма въпроси за този избор.');
      return;
    }
    setFilterError('');
    startQuiz(quizMode, filterValue, label);
  }

  function handleFlashcardTypeSelect(type) {
    let deck;
    if (type === 'author') deck = buildAuthorCards(authors, works);
    else if (type === 'work') deck = buildWorkCards(works, authors);
    else deck = buildMixedCards(authors, works);
    setFlashcardDeck(shuffle(deck));
    setScreen('flashcards');
  }

  function handleFinish(score) {
    setFinalScore(score);
    setWrongCount(getWrongQuestionIds().length);
    setScreen('results');
  }

  function handleRestart() {
    if (quizMode === 'wrong' && getWrongQuestionIds().length === 0) {
      goHome();
      return;
    }
    startQuiz(quizMode, quizFilter, modeLabel);
  }

  function goHome() {
    setFilterError('');
    setWrongCount(getWrongQuestionIds().length);
    setScreen('home');
  }

  if (screen === 'filter') {
    return (
      <FilterSelection
        mode={quizMode}
        authors={authors}
        works={works}
        questions={questions}
        onSelect={handleFilterSelect}
        onBack={goHome}
        error={filterError}
      />
    );
  }

  if (screen === 'flashcard-select') {
    return (
      <FlashcardSelection
        authors={authors}
        works={works}
        onSelect={handleFlashcardTypeSelect}
        onBack={goHome}
      />
    );
  }

  if (screen === 'flashcards') {
    return (
      <Flashcards
        deck={flashcardDeck}
        onHome={goHome}
      />
    );
  }

  if (screen === 'quiz') {
    return (
      <Quiz
        questions={quizQuestions}
        modeLabel={modeLabel}
        isWrongMode={quizMode === 'wrong'}
        onFinish={handleFinish}
        onHome={goHome}
      />
    );
  }

  if (screen === 'results') {
    return (
      <Results
        score={finalScore}
        total={quizQuestions.length}
        modeLabel={modeLabel}
        isWrongMode={quizMode === 'wrong'}
        wrongCount={wrongCount}
        onRestart={handleRestart}
        onHome={goHome}
      />
    );
  }

  return (
    <Home
      authorCount={authors.length}
      workCount={works.length}
      questionCount={questions.length}
      wrongCount={wrongCount}
      onSelectMode={handleModeSelect}
    />
  );
}
