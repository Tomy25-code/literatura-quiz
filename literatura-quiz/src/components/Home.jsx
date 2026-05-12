import ModeSelector from './ModeSelector';

export default function Home({ authorCount, workCount, questionCount, onSelectMode }) {
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

      <ModeSelector onSelect={onSelectMode} />
    </div>
  );
}
