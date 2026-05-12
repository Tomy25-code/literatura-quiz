export default function FlashcardSelection({ authors, works, onSelect, onBack }) {
  const types = [
    {
      id: 'author',
      label: 'Карти по автори',
      count: authors.length,
      desc: 'Имена, псевдоними, периоди, теми, произведения',
    },
    {
      id: 'work',
      label: 'Карти по произведения',
      count: works.length,
      desc: 'Жанр, история, композиция, теми, мотиви',
    },
    {
      id: 'mixed',
      label: 'Смесени карти',
      count: authors.length + works.length,
      desc: 'Автори и произведения наред',
    },
  ];

  return (
    <div className="filter-container">
      <div className="filter-header">
        <button className="btn-back" onClick={onBack}>← Назад</button>
        <h2 className="filter-title">Флашкарти</h2>
      </div>

      <div className="fc-type-grid">
        {types.map(t => (
          <button
            key={t.id}
            className="fc-type-card"
            onClick={() => onSelect(t.id)}
          >
            <span className="fc-type-card-label">{t.label}</span>
            <span className="fc-type-card-count">{t.count} карти</span>
            <span className="fc-type-card-desc">{t.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
