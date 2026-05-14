import { useState, useRef } from 'react';

/**
 * Renders a fill-in-the-blank question.
 *
 * Props:
 *   question        — full question object (correctAnswer, acceptedAnswers, explanation)
 *   onSubmit(bool)  — called with true/false when user clicks "Провери"
 *   answered        — bool; locks the form after submission
 *   isCorrect       — bool; only meaningful when answered=true
 *   remediationFeedback — null | 'progressing' | 'mastered' | 'stayed'
 *   onNext          — called when user clicks "Следващ въпрос" / "Виж резултата"
 *   isLastQuestion  — bool
 */
export default function FillBlankQuestion({
  question,
  onSubmit,
  answered,
  isCorrect,
  remediationFeedback,
  onNext,
  isLastQuestion,
}) {
  const [userInput, setUserInput] = useState('');
  const inputRef = useRef(null);

  function normalize(s) {
    return String(s)
      .toLowerCase()
      .replace(/[„""«»]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function handleSubmit() {
    if (answered || !userInput.trim()) return;
    const normInput = normalize(userInput);
    const correct = (question.acceptedAnswers || []).some(a => normalize(a) === normInput);
    onSubmit(correct);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSubmit();
  }

  return (
    <div className="fillblank-question">
      <div className="fillblank-input-row">
        <input
          ref={inputRef}
          className={
            'fillblank-input' +
            (answered ? (isCorrect ? ' fillblank-input-correct' : ' fillblank-input-wrong') : '')
          }
          type="text"
          placeholder="Въведи отговор..."
          value={userInput}
          onChange={e => !answered && setUserInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={answered}
          autoComplete="off"
        />
        {!answered && (
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={!userInput.trim()}
          >
            Провери
          </button>
        )}
      </div>

      {answered && (
        <div className={`feedback ${isCorrect ? 'feedback-correct' : 'feedback-wrong'}`}>
          <p className="feedback-status">
            {isCorrect ? 'Верен отговор!' : 'Грешен отговор!'}
          </p>
          {!isCorrect && (
            <p className="fillblank-correct-reveal">
              Правилният отговор е: „{question.correctAnswer}"
            </p>
          )}
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
          <button className="btn-primary" onClick={onNext}>
            {isLastQuestion ? 'Виж резултата' : 'Следващ въпрос'}
          </button>
        </div>
      )}
    </div>
  );
}
