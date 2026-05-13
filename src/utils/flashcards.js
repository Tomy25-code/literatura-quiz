export function buildAuthorCards(authors, works) {
  return authors.map(author => {
    const authorWorks = works.filter(w => author.works.includes(w.id));
    return {
      type: 'author',
      id: author.id,
      front: {
        name: author.name,
        nickname: author.nickname,
      },
      back: {
        period: author.period,
        literary_context: author.literary_context,
        main_themes: author.main_themes,
        key_facts: author.key_facts,
        workTitles: authorWorks.map(w => w.title),
      },
    };
  });
}

export function buildWorkCards(works, authors) {
  const authorMap = {};
  authors.forEach(a => { authorMap[a.id] = a.name; });

  return works.map(work => ({
    type: 'work',
    id: work.id,
    front: {
      title: work.title,
      authorName: authorMap[work.authorId] || '',
      genre: work.genre,
    },
    back: {
      year_or_period: work.year_or_period,
      creative_history: work.creative_history,
      composition: work.composition,
      themes: work.themes,
      motifs: work.motifs,
      key_facts: work.key_facts,
    },
  }));
}

export function buildMixedCards(authors, works) {
  return [...buildAuthorCards(authors, works), ...buildWorkCards(works, authors)];
}
