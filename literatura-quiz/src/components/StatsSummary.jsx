export default function StatsSummary({ stats, onViewStats }) {
  if (stats.length === 0) return null;

  const avg = Math.round(stats.reduce((sum, a) => sum + a.percentage, 0) / stats.length);
  const best = Math.max(...stats.map(a => a.percentage));

  return (
    <div className="stats-summary">
      <div className="stats-summary-header">
        <span className="ss-heading">Статистика</span>
        <button className="btn-view-stats" onClick={onViewStats}>
          Виж всички →
        </button>
      </div>
      <div className="stats-summary-row">
        <div className="ss-item">
          <span className="ss-value">{stats.length}</span>
          <span className="ss-label">Теста</span>
        </div>
        <div className="ss-item">
          <span className="ss-value">{avg}%</span>
          <span className="ss-label">Среден резултат</span>
        </div>
        <div className="ss-item">
          <span className="ss-value">{best}%</span>
          <span className="ss-label">Най-добър</span>
        </div>
      </div>
    </div>
  );
}
