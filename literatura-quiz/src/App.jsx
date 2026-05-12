import { useState } from 'react';
import authors from './data/authors.json';
import works from './data/works.json';
import questions from './data/questions.json';
import Home from './components/Home';
import Quiz from './components/Quiz';
import Results from './components/Results';
import FilterSelection from './components/FilterSelection';
import { buildQuiz, shuffle, QUIZ_LENGTH, MODE_LABELS } from './utils/quiz';
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
    if (mode === 'random') {
      startQuiz('random', null, MODE_LABELS.random);
    } else if (mode === 'wrong') {
      startQuiz('wrong', null, MODE_LABELS.wrong);
    } else {
      setQuizMode(mode);
      setScreen('filter');
    }
  }

  function handleFilterSelect(filterValue, label) {
    startQuiz(quizMode, filterValue, label);
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
