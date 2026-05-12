const MODES = [
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
];

export default function ModeSelector({ onSelect }) {
  return (
    <div className="mode-selector">
      <p className="mode-selector-title">Избери режим</p>
      <div className="mode-grid">
        {MODES.map(mode => (
          <button
            key={mode.id}
            className="mode-card"
            onClick={() => onSelect(mode.id)}
          >
            <span className="mode-card-label">{mode.label}</span>
            <span className="mode-card-desc">{mode.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
