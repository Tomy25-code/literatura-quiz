export default function Results({ score, total, modeLabel, isWrongMode, wrongCount, overallAvg, onRestart, onHome }) {
  const percentage = Math.round((score / total) * 100);

  function getMessage() {
    if (percentage >= 90) return 'Отличен резултат! Готов си за матурата.';
    if (percentage >= 70) return 'Много добре! Продължавай да учиш.';
    if (percentage >= 50) return 'Добре, но може и по-добре.';
    return 'Трябва повече упражнения. Не се отказвай!';
  }

  function getScoreClass() {
    if (percentage >= 70) return 'score-good';
    if (percentage >= 50) return 'score-ok';
    return 'score-low';
  }

  const restartDisabled = isWrongMode && wrongCount === 0;

  return (
    <div className="results-container">
      {modeLabel && <p className="results-mode-label">{modeLabel}</p>}
      <h2 className="results-title">Краен резултат</h2>

      <div className={`score-circle ${getScoreClass()}`}>
        <span className="score-fraction">
          {score}<span className="score-total">/{total}</span>
        </span>
        <span className="score-percent">{percentage}%</span>
      </div>

      <p className="score-message">{getMessage()}</p>

      {overallAvg !== null && overallAvg !== undefined && (
        <p className={`results-comparison ${percentage >= overallAvg ? 'comp-above' : 'comp-below'}`}>
          {percentage > overallAvg
            ? `Над средното ти (${overallAvg}%) — отлична работа!`
            : percentage === overallAvg
            ? `Равно на средното ти (${overallAvg}%)`
            : `Под средното ти (${overallAvg}%) — продължавай да тренираш`
          }
        </p>
      )}

      <div className="results-stats">
        {isWrongMode ? (
          wrongCount > 0
            ? <p className="results-stat-row">Остават за преговор: <strong>{wrongCount}</strong></p>
            : <p className="results-stat-row results-all-mastered">Всички грешни въпроси са усвоени!</p>
        ) : (
          wrongCount > 0 && (
            <p className="results-stat-row">
              Запазени грешни въпроси: <strong>{wrongCount}</strong>
            </p>
          )
        )}
      </div>

      <div className="results-actions">
        <button
          className="btn-primary"
          onClick={onRestart}
          disabled={restartDisabled}
        >
          Нов тест
        </button>
        <button className="btn-secondary" onClick={onHome}>Към началото</button>
      </div>
    </div>
  );
}
