import { useState } from 'react';

/**
 * Renders a match-author-with-work question.
 *
 * Props:
 *   question        — full question object (pairs, options, explanation)
 *   onSubmit(bool)  — called with true/false when user clicks "Провери"
 *   answered        — bool; locks the form after submission
 *   isCorrect       — bool; only meaningful when answered=true
 *   remediationFeedback — null | 'progressing' | 'mastered' | 'stayed'
 *   onNext          — called when user clicks "Следващ въпрос" / "Виж резултата"
 *   isLastQuestion  — bool
 */
export default function MatchQuestion({
  question,
  onSubmit,
  answered,
  isCorrect,
  remediationFeedback,
  onNext,
  isLastQuestion,
}) {
  const { pairs = [], options = [], explanation } = question;
  const [selections, setSelections] = useState({});

  const allSelected = pairs.every(p => selections[p.authorId]);

  function handleChange(authorId, value) {
    if (answered) return;
    setSelections(prev => ({ ...prev, [authorId]: value }));
  }

  function handleSubmit() {
    if (!allSelected || answered) return;
    const allCorrect = pairs.every(p => selections[p.authorId] === p.workTitle);
    onSubmit(allCorrect);
  }

  function getPairClass(pair) {
    if (!answered) return 'match-row';
    return selections[pair.authorId] === pair.workTitle
      ? 'match-row match-row-correct'
      : 'match-row match-row-wrong';
  }

  return (
    <div className="match-question">
      <div className="match-pairs">
        {pairs.map(pair => (
          <div key={pair.authorId} className={getPairClass(pair)}>
            <span className="match-author">{pair.authorName}</span>
            <span className="match-arrow">→</span>
            <select
              className="match-select"
              value={selections[pair.authorId] || ''}
              onChange={e => handleChange(pair.authorId, e.target.value)}
              disabled={answered}
              aria-label={`Произведение за ${pair.authorName}`}
            >
              <option value="">— изберете —</option>
              {options.map(title => (
                <option key={title} value={title}>{title}</option>
              ))}
            </select>
            {answered && selections[pair.authorId] !== pair.workTitle && (
              <span className="match-correct-hint">✓ {pair.workTitle}</span>
            )}
          </div>
        ))}
      </div>

      {!answered && (
        <div className="match-actions">
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={!allSelected}
          >
            Провери
          </button>
        </div>
      )}

      {answered && (
        <div className={`feedback ${isCorrect ? 'feedback-correct' : 'feedback-wrong'}`}>
          <p className="feedback-status">
            {isCorrect ? 'Верен отговор!' : 'Грешен отговор!'}
          </p>
          <p className="feedback-explanation">{explanation}</p>

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
