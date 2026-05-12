import { useMemo } from 'react';
import { CATEGORY_LABELS, DIFFICULTY_LABELS, MODE_LABELS } from '../utils/quiz';

export default function FilterSelection({ mode, authors, works, questions, onSelect, onBack }) {
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
        c[key] = questions.filter(q => q.category === key).length;
      });
    } else if (mode === 'difficulty') {
      ['easy', 'medium', 'hard'].forEach(d => {
        c[d] = questions.filter(q => q.difficulty === d).length;
      });
    }
    return c;
  }, [mode, authors, works, questions]);

  function renderList() {
    if (mode === 'author') {
      return (
        <div className="filter-grid">
          {authors.map(a => (
            <button
              key={a.id}
              className="filter-card"
              onClick={() => onSelect(a.id, `${MODE_LABELS.author} · ${a.name}`)}
            >
              <span className="filter-card-name">{a.name}</span>
              <span className="filter-card-count">{counts[a.id] || 0} въпр.</span>
            </button>
          ))}
        </div>
      );
    }

    if (mode === 'work') {
      return (
        <div className="filter-grid">
          {works.map(w => (
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

  return (
    <div className="filter-container">
      <div className="filter-header">
        <button className="btn-back" onClick={onBack}>← Назад</button>
        <h2 className="filter-title">{MODE_LABELS[mode]}</h2>
      </div>
      {renderList()}
    </div>
  );
}
