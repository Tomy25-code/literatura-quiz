import questions from '../data/questions.json';
import { computeCategoryStats, computeDifficultyStats } from '../utils/stats';
import { CATEGORY_LABELS, DIFFICULTY_LABELS } from '../utils/quiz';

export default function StatsScreen({ stats, onHome, onClearStats }) {
  const catStats = computeCategoryStats(stats, questions);
  const diffStats = computeDifficultyStats(stats, questions);

  const avg = stats.length > 0
    ? Math.round(stats.reduce((sum, a) => sum + a.percentage, 0) / stats.length)
    : 0;
  const best = stats.length > 0 ? Math.max(...stats.map(a => a.percentage)) : 0;

  const recent = [...stats].reverse().slice(0, 5);

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString('bg-BG', { day: 'numeric', month: 'short' });
  }

  function pctClass(pct) {
    if (pct >= 70) return 'pct-good';
    if (pct >= 50) return 'pct-ok';
    return 'pct-low';
  }

  return (
    <div className="stats-screen">
      <div className="stats-screen-header">
        <button className="btn-back" onClick={onHome}>← Назад</button>
        <h2 className="stats-screen-title">Статистика</h2>
      </div>

      {stats.length === 0 ? (
        <p className="stats-empty">Все още няма записани тестове.</p>
      ) : (
        <>
          <div className="ss-overview-grid">
            <div className="ss-ov-card">
              <span className="ss-ov-value">{stats.length}</span>
              <span className="ss-ov-label">Общо теста</span>
            </div>
            <div className="ss-ov-card">
              <span className="ss-ov-value">{avg}%</span>
              <span className="ss-ov-label">Среден резултат</span>
            </div>
            <div className="ss-ov-card">
              <span className="ss-ov-value">{best}%</span>
              <span className="ss-ov-label">Най-добър</span>
            </div>
          </div>

          <section className="ss-section">
            <h3 className="ss-section-title">Последни тестове</h3>
            <div className="ss-attempts">
              {recent.map(a => (
                <div key={a.id} className="ss-attempt-row">
                  <div className="ss-attempt-info">
                    <span className="ss-attempt-label">{a.modeLabel}</span>
                    <span className="ss-attempt-date">{formatDate(a.timestamp)}</span>
                  </div>
                  <div className="ss-attempt-score">
                    <span className={`ss-attempt-pct ${pctClass(a.percentage)}`}>
                      {a.percentage}%
                    </span>
                    <span className="ss-attempt-frac">{a.correctAnswers}/{a.totalQuestions}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="ss-section">
            <h3 className="ss-section-title">По трудност</h3>
            <div className="ss-breakdown">
              {['easy', 'medium', 'hard'].filter(d => diffStats[d]).map(d => {
                const { total, correct } = diffStats[d];
                const pct = Math.round((correct / total) * 100);
                return (
                  <div key={d} className="ss-bar-row">
                    <span className="ss-bar-label">{DIFFICULTY_LABELS[d]}</span>
                    <div className="ss-bar-track">
                      <div className="ss-bar-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="ss-bar-pct">{pct}%</span>
                    <span className="ss-bar-count">{correct}/{total}</span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="ss-section">
            <h3 className="ss-section-title">По категория</h3>
            <div className="ss-breakdown">
              {Object.entries(catStats)
                .sort((a, b) => b[1].total - a[1].total)
                .map(([cat, { total, correct }]) => {
                  const pct = Math.round((correct / total) * 100);
                  return (
                    <div key={cat} className="ss-bar-row">
                      <span className="ss-bar-label">{CATEGORY_LABELS[cat] || cat}</span>
                      <div className="ss-bar-track">
                        <div className="ss-bar-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="ss-bar-pct">{pct}%</span>
                      <span className="ss-bar-count">{correct}/{total}</span>
                    </div>
                  );
                })}
            </div>
          </section>
        </>
      )}

      {stats.length > 0 && (
        <div className="ss-clear-area">
          <button className="btn-clear-stats" onClick={onClearStats}>
            Изчисти статистиката
          </button>
        </div>
      )}
    </div>
  );
}
