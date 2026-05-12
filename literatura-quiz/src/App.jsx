import { useState } from 'react';
import authors from './data/authors.json';
import works from './data/works.json';
import questions from './data/questions.json';
import Home from './components/Home';
import Quiz from './components/Quiz';
import Results from './components/Results';
import FilterSelection from './components/FilterSelection';
import { buildQuiz, MODE_LABELS } from './utils/quiz';
import './App.css';

export default function App() {
  const [screen, setScreen] = useState('home');
  const [quizMode, setQuizMode] = useState('random');
  const [quizFilter, setQuizFilter] = useState(null);
  const [modeLabel, setModeLabel] = useState('');
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [finalScore, setFinalScore] = useState(0);

  function startQuiz(mode, filterValue, label) {
    const qs = buildQuiz(questions, mode, filterValue, works);
    setQuizMode(mode);
    setQuizFilter(filterValue);
    setModeLabel(label);
    setQuizQuestions(qs);
    setScreen('quiz');
  }

  function handleModeSelect(mode) {
    if (mode === 'random') {
      startQuiz('random', null, MODE_LABELS.random);
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
    setScreen('results');
  }

  function handleRestart() {
    startQuiz(quizMode, quizFilter, modeLabel);
  }

  function goHome() {
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
      onSelectMode={handleModeSelect}
    />
  );
}
