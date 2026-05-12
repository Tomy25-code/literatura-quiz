import { useState } from 'react';
import { saveWrongQuestionId, removeWrongQuestionId } from '../utils/wrongAnswers';

export default function Quiz({ questions, modeLabel, isWrongMode, onFinish, onHome }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [wasRemoved, setWasRemoved] = useState(false);
  const [answeredMap, setAnsweredMap] = useState({});

  const question = questions[currentIndex];
  const answered = selectedAnswer !== null;
  const isCorrect = selectedAnswer === question.correctAnswer;
  const isLastQuestion = currentIndex === questions.length - 1;

  function handleSelect(option) {
    if (answered) return;
    setSelectedAnswer(option);
    const correct = option === question.correctAnswer;
    setAnsweredMap(m => ({ ...m, [question.id]: correct }));
    if (correct) {
      setScore(s => s + 1);
      if (isWrongMode) {
        removeWrongQuestionId(question.id);
        setWasRemoved(true);
      }
    } else {
      if (!isWrongMode) {
        saveWrongQuestionId(question.id);
      }
    }
  }

  function handleNext() {
    if (isLastQuestion) {
      onFinish(score, answeredMap);
    } else {
      setCurrentIndex(i => i + 1);
      setSelectedAnswer(null);
      setWasRemoved(false);
    }
  }

  function getOptionClass(option) {
    if (!answered) return 'answer-btn';
    if (option === question.correctAnswer) return 'answer-btn correct';
    if (option === selectedAnswer) return 'answer-btn wrong';
    return 'answer-btn dimmed';
  }

  const progressPercent = (currentIndex / questions.length) * 100;

  return (
    <div className="quiz-container">
      <div className="quiz-top-bar">
        {modeLabel
          ? <span className="quiz-mode-label">{modeLabel}</span>
          : <span />
        }
        <button className="btn-ghost" onClick={onHome}>Към началото</button>
      </div>

      <div className="quiz-header">
        <span>Въпрос {currentIndex + 1} от {questions.length}</span>
        <span className="quiz-score-label">Верни: {score}</span>
      </div>

      <div
        className="progress-bar"
        role="progressbar"
        aria-valuenow={currentIndex + 1}
        aria-valuemax={questions.length}
      >
        <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
      </div>

      <div className="question-card">
        <p className="question-text">{question.question}</p>

        <div className="options">
          {question.options.map((option, i) => (
            <button
              key={i}
              className={getOptionClass(option)}
              onClick={() => handleSelect(option)}
              disabled={answered}
            >
              {option}
            </button>
          ))}
        </div>

        {answered && (
          <div className={`feedback ${isCorrect ? 'feedback-correct' : 'feedback-wrong'}`}>
            <p className="feedback-status">
              {isCorrect
                ? 'Верен отговор!'
                : `Грешен отговор! Правилният е: „${question.correctAnswer}"`
              }
            </p>
            <p className="feedback-explanation">{question.explanation}</p>
            {wasRemoved && (
              <p className="mastered-msg">
                Браво! Този въпрос е премахнат от грешните.
              </p>
            )}
          </div>
        )}

        {answered && (
          <div className="quiz-action">
            <button className="btn-primary" onClick={handleNext}>
              {isLastQuestion ? 'Виж резултата' : 'Следващ въпрос'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
