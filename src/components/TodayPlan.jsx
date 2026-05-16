export default function TodayPlan({ recommendations, onAction }) {
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <div className="today-plan">
      <div className="today-plan-header">
        <p className="today-plan-title">Какво да уча днес?</p>
        <p className="today-plan-subtitle">Кратък план според последните ти резултати.</p>
      </div>
      <div className="today-plan-cards">
        {recommendations.map(rec => (
          <div key={rec.id} className="today-plan-card">
            <div className="tpc-body">
              {rec.badge && <span className="tpc-badge">{rec.badge}</span>}
              <p className="tpc-title">{rec.title}</p>
              <p className="tpc-desc">{rec.description}</p>
            </div>
            <button
              className="tpc-btn"
              onClick={() => onAction(rec.action)}
            >
              {rec.buttonText}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
