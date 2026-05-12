import { useState } from 'react';
import authors from './data/authors.json';
import works from './data/works.json';
import questions from './data/questions.json';
import Home from './components/Home';
import Quiz from './components/Quiz';
import Results from './components/Results';
import './App.css';

const QUIZ_LENGTH = 10;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function App() {
  const [screen, setScreen] = useState('home');
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [finalScore, setFinalScore] = useState(0);

  function startQuiz() {
    const selected = shuffle(questions)
      .slice(0, QUIZ_LENGTH)
      .map(q => ({ ...q, options: shuffle(q.options) }));
    setQuizQuestions(selected);
    setScreen('quiz');
  }

  function finishQuiz(score) {
    setFinalScore(score);
    setScreen('results');
  }

  function goHome() {
    setScreen('home');
  }

  if (screen === 'quiz') {
    return <Quiz questions={quizQuestions} onFinish={finishQuiz} />;
  }
  if (screen === 'results') {
    return (
      <Results
        score={finalScore}
        total={quizQuestions.length}
        onRestart={startQuiz}
        onHome={goHome}
      />
    );
  }
  return (
    <Home
      authorCount={authors.length}
      workCount={works.length}
      questionCount={questions.length}
      onStart={startQuiz}
    />
  );
}
