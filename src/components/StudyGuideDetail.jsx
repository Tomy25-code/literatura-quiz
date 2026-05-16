function SgSection({ label, children }) {
  return (
    <div className="sg-section">
      <div className="sg-section-label">{label}</div>
      {children}
    </div>
  );
}

function SgText({ value }) {
  return <p className="sg-section-text">{value}</p>;
}

function SgList({ items }) {
  return (
    <ul className="sg-list">
      {items.map((item, i) => <li key={i}>{item}</li>)}
    </ul>
  );
}

export default function StudyGuideDetail({ type, item, authors, works, onBack, onNavigateToWork }) {
  if (type === 'author') {
    const authorWorks = works.filter(w => w.authorId === item.id);

    return (
      <div className="filter-container">
        <div className="filter-header">
          <button className="btn-back" onClick={onBack}>← Назад</button>
          <h2 className="filter-title sg-detail-title">{item.name}</h2>
        </div>

        <span className="sg-type-badge sg-badge-author">Автор</span>

        {item.nickname && (
          <p className="sg-subtitle">„{item.nickname}"</p>
        )}

        {item.period && (
          <SgSection label="Период">
            <SgText value={item.period} />
          </SgSection>
        )}

        {item.literary_context && (
          <SgSection label="Литературен контекст">
            <SgText value={item.literary_context} />
          </SgSection>
        )}

        {item.main_themes && item.main_themes.length > 0 && (
          <SgSection label="Основни теми">
            <SgList items={item.main_themes} />
          </SgSection>
        )}

        {item.key_facts && item.key_facts.length > 0 && (
          <SgSection label="Ключови факти">
            <SgList items={item.key_facts} />
          </SgSection>
        )}

        {authorWorks.length > 0 && (
          <SgSection label="Произведения">
            <div className="sg-works-list">
              {authorWorks.map(w => (
                <button
                  key={w.id}
                  className="sg-work-item"
                  onClick={() => onNavigateToWork(w.id)}
                >
                  <span className="sg-work-title">{w.title}</span>
                  {w.genre && <span className="sg-work-genre">{w.genre}</span>}
                </button>
              ))}
            </div>
          </SgSection>
        )}
      </div>
    );
  }

  // type === 'work'
  const author = authors.find(a => a.id === item.authorId);

  return (
    <div className="filter-container">
      <div className="filter-header">
        <button className="btn-back" onClick={onBack}>← Назад</button>
        <h2 className="filter-title sg-detail-title">{item.title}</h2>
      </div>

      <span className="sg-type-badge sg-badge-work">Произведение</span>

      {author && (
        <p className="sg-subtitle">{author.name}</p>
      )}

      {item.genre && (
        <SgSection label="Жанр">
          <SgText value={item.genre} />
        </SgSection>
      )}

      {item.year_or_period && (
        <SgSection label="Година / период">
          <SgText value={item.year_or_period} />
        </SgSection>
      )}

      {item.creative_history && (
        <SgSection label="Творческа история">
          <SgText value={item.creative_history} />
        </SgSection>
      )}

      {item.composition && (
        <SgSection label="Композиция">
          <SgText value={item.composition} />
        </SgSection>
      )}

      {item.themes && item.themes.length > 0 && (
        <SgSection label="Теми">
          <SgList items={item.themes} />
        </SgSection>
      )}

      {item.motifs && item.motifs.length > 0 && (
        <SgSection label="Мотиви">
          <SgList items={item.motifs} />
        </SgSection>
      )}

      {item.key_facts && item.key_facts.length > 0 && (
        <SgSection label="Ключови идеи">
          <SgList items={item.key_facts} />
        </SgSection>
      )}
    </div>
  );
}
