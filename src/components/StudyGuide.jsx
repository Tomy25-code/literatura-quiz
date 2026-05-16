import { useState, useMemo } from 'react';

export default function StudyGuide({ authors, works, onSelect, onBack }) {
  const [type, setType] = useState('author');
  const [query, setQuery] = useState('');

  const authorMap = useMemo(() => {
    const m = {};
    authors.forEach(a => { m[a.id] = a.name; });
    return m;
  }, [authors]);

  const normalizedQuery = query.toLowerCase().trim();

  const filteredAuthors = useMemo(() =>
    authors.filter(a => {
      if (!normalizedQuery) return true;
      return (
        a.name.toLowerCase().includes(normalizedQuery) ||
        (a.nickname && a.nickname.toLowerCase().includes(normalizedQuery))
      );
    }),
    [authors, normalizedQuery]
  );

  const filteredWorks = useMemo(() =>
    works.filter(w => {
      if (!normalizedQuery) return true;
      return (
        w.title.toLowerCase().includes(normalizedQuery) ||
        (authorMap[w.authorId] || '').toLowerCase().includes(normalizedQuery)
      );
    }),
    [works, authorMap, normalizedQuery]
  );

  function handleTypeChange(newType) {
    setType(newType);
    setQuery('');
  }

  return (
    <div className="filter-container">
      <div className="filter-header">
        <button className="btn-back" onClick={onBack}>← Назад</button>
        <h2 className="filter-title">Падна ми се…</h2>
      </div>

      <div className="sg-tabs">
        <button
          className={`sg-tab${type === 'author' ? ' sg-tab-active' : ''}`}
          onClick={() => handleTypeChange('author')}
        >
          Автор
        </button>
        <button
          className={`sg-tab${type === 'work' ? ' sg-tab-active' : ''}`}
          onClick={() => handleTypeChange('work')}
        >
          Произведение
        </button>
      </div>

      <div className="search-box">
        <input
          type="search"
          className="search-input"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={type === 'author' ? 'Търси автор...' : 'Търси произведение или автор...'}
          autoComplete="off"
          spellCheck={false}
        />
      </div>

      {type === 'author' && (
        filteredAuthors.length === 0
          ? <p className="filter-empty">Няма намерени автори.</p>
          : (
            <div className="filter-grid">
              {filteredAuthors.map(a => (
                <button
                  key={a.id}
                  className="filter-card"
                  onClick={() => onSelect('author', a.id)}
                >
                  <span className="filter-card-name">{a.name}</span>
                  {a.nickname && <span className="filter-card-sub">„{a.nickname}"</span>}
                  {a.period && <span className="filter-card-sub">{a.period}</span>}
                </button>
              ))}
            </div>
          )
      )}

      {type === 'work' && (
        filteredWorks.length === 0
          ? <p className="filter-empty">Няма намерени произведения.</p>
          : (
            <div className="filter-grid">
              {filteredWorks.map(w => (
                <button
                  key={w.id}
                  className="filter-card"
                  onClick={() => onSelect('work', w.id)}
                >
                  <span className="filter-card-name">{w.title}</span>
                  <span className="filter-card-sub">{authorMap[w.authorId] || ''}</span>
                  {w.genre && <span className="filter-card-sub">{w.genre}</span>}
                </button>
              ))}
            </div>
          )
      )}
    </div>
  );
}
