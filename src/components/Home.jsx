import StatsSummary from './StatsSummary';
import TodayPlan from './TodayPlan';
import HomeNavigation from './HomeNavigation';
import { VALID_LENGTHS } from '../utils/settings';

export default function Home({
  authorCount,
  workCount,
  questionCount,
  wrongCount,
  quizLength,
  stats,
  weakSpotsActive,
  dailyCompletedToday,
  dailyStreak,
  todayPlanRecs,
  onSelectMode,
  onTodayPlanAction,
  onSetQuizLength,
  onClearWrong,
  onViewStats,
  theme,
  onSetTheme,
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

      <TodayPlan recommendations={todayPlanRecs} onAction={onTodayPlanAction} />

      <HomeNavigation
        onSelect={onSelectMode}
        wrongCount={wrongCount}
        onClearWrong={onClearWrong}
        weakSpotsActive={weakSpotsActive}
        dailyCompletedToday={dailyCompletedToday}
        dailyStreak={dailyStreak}
        onViewStats={onViewStats}
        theme={theme}
        onSetTheme={onSetTheme}
      />
    </div>
  );
}
