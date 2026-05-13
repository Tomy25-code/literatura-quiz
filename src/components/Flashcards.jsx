import { useState } from 'react';
import { shuffle } from '../utils/quiz';

function AuthorFront({ card }) {
  return (
    <div className="fc-front">
      <p className="fc-main-name">{card.front.name}</p>
      {card.front.nickname && (
        <p className="fc-subtitle">„{card.front.nickname}"</p>
      )}
    </div>
  );
}

function AuthorBack({ card, onlyKeyFacts }) {
  const { period, literary_context, main_themes, key_facts, workTitles } = card.back;
  return (
    <div className="fc-back">
      {onlyKeyFacts ? (
        <div className="fc-section">
          <span className="fc-section-label">Ключови факти</span>
          <ul className="fc-list">
            {key_facts.map((f, i) => <li key={i}>{f}</li>)}
          </ul>
        </div>
      ) : (
        <>
          <div className="fc-section">
            <span className="fc-section-label">Период</span>
            <p className="fc-section-text">{period}</p>
          </div>
          <div className="fc-section">
            <span className="fc-section-label">Литературен контекст</span>
            <p className="fc-section-text">{literary_context}</p>
          </div>
          {main_themes.length > 0 && (
            <div className="fc-section">
              <span className="fc-section-label">Основни теми</span>
              <ul className="fc-list">
                {main_themes.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </div>
          )}
          <div className="fc-section">
            <span className="fc-section-label">Ключови факти</span>
            <ul className="fc-list">
              {key_facts.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
          </div>
          {workTitles.length > 0 && (
            <div className="fc-section">
              <span className="fc-section-label">Произведения</span>
              <ul className="fc-list">
                {workTitles.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function WorkFront({ card }) {
  return (
    <div className="fc-front">
      <p className="fc-main-name">{card.front.title}</p>
      <p className="fc-subtitle">{card.front.authorName}</p>
      <p className="fc-genre">{card.front.genre}</p>
    </div>
  );
}

function WorkBack({ card, onlyKeyFacts }) {
  const { year_or_period, creative_history, composition, themes, motifs, key_facts } = card.back;
  return (
    <div className="fc-back">
      {onlyKeyFacts ? (
        <div className="fc-section">
          <span className="fc-section-label">Ключови факти</span>
          <ul className="fc-list">
            {key_facts.map((f, i) => <li key={i}>{f}</li>)}
          </ul>
        </div>
      ) : (
        <>
          <div className="fc-section">
            <span className="fc-section-label">Година / период</span>
            <p className="fc-section-text">{year_or_period}</p>
          </div>
          <div className="fc-section">
            <span className="fc-section-label">Творческа история</span>
            <p className="fc-section-text">{creative_history}</p>
          </div>
          <div className="fc-section">
            <span className="fc-section-label">Композиция</span>
            <p className="fc-section-text">{composition}</p>
          </div>
          {themes.length > 0 && (
            <div className="fc-section">
              <span className="fc-section-label">Теми</span>
              <ul className="fc-list">
                {themes.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </div>
          )}
          {motifs.length > 0 && (
            <div className="fc-section">
              <span className="fc-section-label">Мотиви</span>
              <ul className="fc-list">
                {motifs.map((m, i) => <li key={i}>{m}</li>)}
              </ul>
            </div>
          )}
          <div className="fc-section">
            <span className="fc-section-label">Ключови факти</span>
            <ul className="fc-list">
              {key_facts.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

export default function Flashcards({ deck: initialDeck, onHome }) {
  const [cards, setCards] = useState(initialDeck);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [onlyKeyFacts, setOnlyKeyFacts] = useState(false);

  const card = cards[index];

  function goNext() {
    setIndex(i => Math.min(i + 1, cards.length - 1));
    setFlipped(false);
  }

  function goPrev() {
    setIndex(i => Math.max(i - 1, 0));
    setFlipped(false);
  }

  function reshuffle() {
    setCards(shuffle([...cards]));
    setIndex(0);
    setFlipped(false);
  }

  return (
    <div className="flashcards-container">
      <div className="fc-top-bar">
        <span className="fc-progress">Карта {index + 1} от {cards.length}</span>
        <div className="fc-top-actions">
          <button
            className={`btn-toggle${onlyKeyFacts ? ' active' : ''}`}
            onClick={() => setOnlyKeyFacts(v => !v)}
          >
            Само факти
          </button>
          <button className="btn-ghost" onClick={onHome}>Към началото</button>
        </div>
      </div>

      <div className="fc-card">
        <div className={`fc-type-badge ${card.type === 'author' ? 'badge-author' : 'badge-work'}`}>
          {card.type === 'author' ? 'Автор' : 'Произведение'}
        </div>

        {!flipped ? (
          card.type === 'author'
            ? <AuthorFront card={card} />
            : <WorkFront card={card} />
        ) : (
          card.type === 'author'
            ? <AuthorBack card={card} onlyKeyFacts={onlyKeyFacts} />
            : <WorkBack card={card} onlyKeyFacts={onlyKeyFacts} />
        )}
      </div>

      <div className="fc-flip-area">
        {!flipped ? (
          <button className="btn-primary" onClick={() => setFlipped(true)}>
            Покажи отговора
          </button>
        ) : (
          <button className="btn-secondary" onClick={() => setFlipped(false)}>
            Скрий отговора
          </button>
        )}
      </div>

      <div className="fc-nav">
        <button className="btn-secondary" onClick={goPrev} disabled={index === 0}>
          ← Предишна
        </button>
        <button className="btn-secondary" onClick={reshuffle}>
          Разбъркай
        </button>
        <button className="btn-secondary" onClick={goNext} disabled={index === cards.length - 1}>
          Следваща →
        </button>
      </div>
    </div>
  );
}
