const BASE_MODES = [
  {
    id: 'random',
    label: 'Случаен тест',
    description: 'Въпроси от всички автори и теми',
  },
  {
    id: 'author',
    label: 'Тест по автор',
    description: 'Избери автор и учи само него',
  },
  {
    id: 'work',
    label: 'Тест по произведение',
    description: 'Избери конкретно произведение',
  },
  {
    id: 'category',
    label: 'Тест по категория',
    description: 'Фокусирай се върху определена тема',
  },
  {
    id: 'difficulty',
    label: 'Тест по трудност',
    description: 'Избери ниво на трудност',
  },
  {
    id: 'flashcards',
    label: 'Флашкарти',
    description: 'Преговаряй автори, произведения, жанрове и композиция',
  },
];

export default function ModeSelector({ onSelect, wrongCount, onClearWrong }) {
  return (
    <div className="mode-selector">
      <p className="mode-selector-title">Избери режим</p>
      <div className="mode-grid">
        {BASE_MODES.map(mode => (
          <button
            key={mode.id}
            className="mode-card"
            onClick={() => onSelect(mode.id)}
          >
            <span className="mode-card-label">{mode.label}</span>
            <span className="mode-card-desc">{mode.description}</span>
          </button>
        ))}

        <button
          className="mode-card mode-card-weakspots"
          onClick={() => onSelect('weakSpots')}
        >
          <span className="mode-card-label">Слаби места</span>
          <span className="mode-card-desc">
            Тест от категориите, в които имаш най-нисък резултат
          </span>
        </button>

        <button
          className={`mode-card mode-card-wrong${wrongCount === 0 ? ' mode-card-empty' : ''}`}
          onClick={() => onSelect('wrong')}
        >
          <span className="mode-card-label">
            Преговор на грешните
            {wrongCount > 0 && (
              <span className="wrong-badge">{wrongCount}</span>
            )}
          </span>
          <span className="mode-card-desc">
            {wrongCount > 0
              ? `${wrongCount} грешни въпроса`
              : 'Все още няма грешни въпроси'
            }
          </span>
        </button>
      </div>

      {wrongCount > 0 && (
        <div className="wrong-actions">
          <button className="btn-clear-wrong" onClick={onClearWrong}>
            Изчисти грешните
          </button>
        </div>
      )}
    </div>
  );
}
