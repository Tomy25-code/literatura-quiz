import { useState, useMemo } from 'react';
import { CATEGORY_LABELS, DIFFICULTY_LABELS, MODE_LABELS, questionMatchesCategory } from '../utils/quiz';

export default function FilterSelection({ mode, authors, works, questions, onSelect, onBack, error }) {
  const [query, setQuery] = useState('');

  const authorMap = useMemo(() => {
    const map = {};
    authors.forEach(a => { map[a.id] = a.name; });
    return map;
  }, [authors]);

  const counts = useMemo(() => {
    const c = {};
    if (mode === 'author') {
      authors.forEach(a => {
        c[a.id] = questions.filter(q => q.authorId === a.id).length;
      });
    } else if (mode === 'work') {
      works.forEach(w => {
        c[w.id] = questions.filter(q => q.workId === w.id).length;
      });
    } else if (mode === 'category') {
      Object.keys(CATEGORY_LABELS).forEach(key => {
        c[key] = questions.filter(q => questionMatchesCategory(q, key)).length;
      });
    } else if (mode === 'difficulty') {
      ['easy', 'medium', 'hard'].forEach(d => {
        c[d] = questions.filter(q => q.difficulty === d).length;
      });
    }
    return c;
  }, [mode, authors, works, questions]);

  const normalizedQuery = query.toLowerCase().trim();

  function renderList() {
    if (mode === 'author') {
      const filtered = authors.filter(a => {
        if (!normalizedQuery) return true;
        const inName = a.name.toLowerCase().includes(normalizedQuery);
        const inNickname = a.nickname && a.nickname.toLowerCase().includes(normalizedQuery);
        return inName || inNickname;
      });

      return filtered.length === 0
        ? <p className="filter-empty">Няма намерени автори.</p>
        : (
          <div className="filter-grid">
            {filtered.map(a => (
              <button
                key={a.id}
                className="filter-card"
                onClick={() => onSelect(a.id, `${MODE_LABELS.author} · ${a.name}`)}
              >
                <span className="filter-card-name">{a.name}</span>
                {a.nickname && (
                  <span className="filter-card-sub">„{a.nickname}"</span>
                )}
                <span className="filter-card-count">{counts[a.id] || 0} въпр.</span>
              </button>
            ))}
          </div>
        );
    }

    if (mode === 'work') {
      const filtered = works.filter(w => {
        if (!normalizedQuery) return true;
        const inTitle = w.title.toLowerCase().includes(normalizedQuery);
        const inAuthor = (authorMap[w.authorId] || '').toLowerCase().includes(normalizedQuery);
        return inTitle || inAuthor;
      });

      return filtered.length === 0
        ? <p className="filter-empty">Няма намерени произведения.</p>
        : (
          <div className="filter-grid">
            {filtered.map(w => (
              <button
                key={w.id}
                className="filter-card"
                onClick={() => onSelect(w.id, `${MODE_LABELS.work} · ${w.title}`)}
              >
                <span className="filter-card-name">{w.title}</span>
                <span className="filter-card-sub">{authorMap[w.authorId] || ''}</span>
                <span className="filter-card-count">{counts[w.id] || 0} въпр.</span>
              </button>
            ))}
          </div>
        );
    }

    if (mode === 'category') {
      const available = Object.entries(CATEGORY_LABELS).filter(([key]) => counts[key] > 0);
      return (
        <div className="filter-grid filter-grid-3">
          {available.map(([key, label]) => (
            <button
              key={key}
              className="filter-card"
              onClick={() => onSelect(key, `${MODE_LABELS.category} · ${label}`)}
            >
              <span className="filter-card-name">{label}</span>
              <span className="filter-card-count">{counts[key]} въпр.</span>
            </button>
          ))}
        </div>
      );
    }

    if (mode === 'difficulty') {
      return (
        <div className="filter-grid filter-grid-3">
          {[
            { id: 'easy', label: DIFFICULTY_LABELS.easy },
            { id: 'medium', label: DIFFICULTY_LABELS.medium },
            { id: 'hard', label: DIFFICULTY_LABELS.hard },
          ].map(d => (
            <button
              key={d.id}
              className="filter-card filter-card-center"
              onClick={() => onSelect(d.id, `${MODE_LABELS.difficulty} · ${d.label}`)}
            >
              <span className="filter-card-name">{d.label}</span>
              <span className="filter-card-count">{counts[d.id] || 0} въпр.</span>
            </button>
          ))}
        </div>
      );
    }

    return null;
  }

  const showSearch = mode === 'author' || mode === 'work';

  return (
    <div className="filter-container">
      <div className="filter-header">
        <button className="btn-back" onClick={onBack}>← Назад</button>
        <h2 className="filter-title">{MODE_LABELS[mode]}</h2>
      </div>

      {error && (
        <div className="filter-error" role="alert">{error}</div>
      )}

      {showSearch && (
        <div className="search-box">
          <input
            type="search"
            className="search-input"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={mode === 'author' ? 'Търси автор...' : 'Търси произведение или автор...'}
            autoComplete="off"
            spellCheck={false}
          />
        </div>
      )}

      {renderList()}
    </div>
  );
}
