import { useState } from 'react';
import { saveWrongQuestionId, recordWrongQuestionCorrect } from '../utils/wrongAnswers';
import MatchQuestion from './MatchQuestion';
import FillBlankQuestion from './FillBlankQuestion';

export default function Quiz({ questions, modeLabel, isWrongMode, isRemediationMode, onFinish, onHome }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [remediationFeedback, setRemediationFeedback] = useState(null);
  const [answeredMap, setAnsweredMap] = useState({});

  const question = questions[currentIndex];
  const qType    = question.type || 'multiple_choice';
  const answered = selectedAnswer !== null;

  // For multiple_choice and true_false, correctness is a simple string comparison.
  // For match_author_work and fill_blank, correctness is set via sentinel values.
  const isCorrect = (qType === 'match_author_work' || qType === 'fill_blank')
    ? selectedAnswer === '__correct__'
    : selectedAnswer === question.correctAnswer;

  const isLastQuestion = currentIndex === questions.length - 1;

  // ── Shared answer-recording logic ─────────────────────────────────────────
  function recordAnswer(correct) {
    setAnsweredMap(m => ({ ...m, [question.id]: correct }));
    if (correct) {
      setScore(s => s + 1);
      if (isRemediationMode) {
        const result = recordWrongQuestionCorrect(question.id);
        if (result.wasActive) {
          setRemediationFeedback(result.mastered ? 'mastered' : 'progressing');
        }
      }
    } else {
      saveWrongQuestionId(question.id);
      if (isRemediationMode) {
        setRemediationFeedback('stayed');
      }
    }
  }

  // ── Multiple-choice / true-false handler ──────────────────────────────────
  function handleSelect(option) {
    if (answered) return;
    const correct = option === question.correctAnswer;
    setSelectedAnswer(option);
    recordAnswer(correct);
  }

  // ── Match answer handler ───────────────────────────────────────────────────
  function handleMatchSubmit(allCorrect) {
    setSelectedAnswer(allCorrect ? '__correct__' : '__wrong__');
    recordAnswer(allCorrect);
  }

  // ── Fill-blank answer handler ──────────────────────────────────────────────
  function handleFillBlankSubmit(correct) {
    setSelectedAnswer(correct ? '__correct__' : '__wrong__');
    recordAnswer(correct);
  }

  // ── Navigation ─────────────────────────────────────────────────────────────
  function handleNext() {
    if (isLastQuestion) {
      onFinish(score, answeredMap);
    } else {
      setCurrentIndex(i => i + 1);
      setSelectedAnswer(null);
      setRemediationFeedback(null);
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
      <div className="quiz-progress-header">
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
      </div>

      <div className="question-card">
        <p className="question-text">{question.question}</p>

        {qType === 'match_author_work' ? (
          <MatchQuestion
            question={question}
            onSubmit={handleMatchSubmit}
            answered={answered}
            isCorrect={isCorrect}
            remediationFeedback={remediationFeedback}
            onNext={handleNext}
            isLastQuestion={isLastQuestion}
          />
        ) : qType === 'fill_blank' ? (
          <FillBlankQuestion
            question={question}
            onSubmit={handleFillBlankSubmit}
            answered={answered}
            isCorrect={isCorrect}
            remediationFeedback={remediationFeedback}
            onNext={handleNext}
            isLastQuestion={isLastQuestion}
          />
        ) : (
          <>
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

                {remediationFeedback === 'progressing' && (
                  <p className="mastered-msg mastered-progressing">
                    Добре! Още 1 верен отговор за усвояване.
                  </p>
                )}
                {remediationFeedback === 'mastered' && (
                  <p className="mastered-msg">
                    Браво! Въпросът е усвоен и премахнат от преговора.
                  </p>
                )}
                {remediationFeedback === 'stayed' && (
                  <p className="mastered-msg mastered-stayed">
                    Въпросът остава в преговора.
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
          </>
        )}
      </div>
    </div>
  );
}
