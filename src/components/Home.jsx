import ModeSelector from './ModeSelector';
import StatsSummary from './StatsSummary';
import { VALID_LENGTHS } from '../utils/settings';

export default function Home({
  authorCount,
  workCount,
  questionCount,
  wrongCount,
  quizLength,
  stats,
  onSelectMode,
  onSetQuizLength,
  onClearWrong,
  onViewStats,
}) {
  return (
    <div className="home-container">
      <div className="home-header">
        <h1>Матура БЕЛ Quiz</h1>
        <p className="home-subtitle">
          Подготви се за матурата по български език и литература. Тествай знанията
          си за автори, произведения, жанрове, периоди, теми и композиция.
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-number">{authorCount}</span>
          <span className="stat-label">Автори</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{workCount}</span>
          <span className="stat-label">Произведения</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{questionCount}</span>
          <span className="stat-label">Въпроса</span>
        </div>
      </div>

      <div className="quiz-length-picker">
        <span className="qlp-label">Брой въпроси в тест</span>
        <div className="qlp-options">
          {VALID_LENGTHS.map(n => (
            <button
              key={n}
              className={`qlp-btn${quizLength === n ? ' active' : ''}`}
              onClick={() => onSetQuizLength(n)}
              aria-pressed={quizLength === n}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <StatsSummary stats={stats} onViewStats={onViewStats} />

      <ModeSelector
        onSelect={onSelectMode}
        wrongCount={wrongCount}
        onClearWrong={onClearWrong}
      />

      <details className="help-section">
        <summary className="help-summary">Как да използваш сайта?</summary>
        <ul className="help-list">
          <li>Започни със случаен тест, за да провериш общите си знания.</li>
          <li>Използвай тест по автор или произведение за целенасочен преговор.</li>
          <li>Грешните отговори се запазват автоматично.</li>
          <li>Флашкартите са подходящи за бърз преговор преди изпит.</li>
          <li>След всеки завършен тест статистиката се обновява, за да виждаш напредъка си по категории и трудност.</li>
        </ul>
      </details>
    </div>
  );
}
