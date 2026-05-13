const STORAGE_KEY = 'literaturaQuizWrongQuestionIds';

export function getWrongQuestionIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveWrongQuestionId(id) {
  const ids = getWrongQuestionIds();
  if (!ids.includes(id)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids, id]));
  }
}

export function removeWrongQuestionId(id) {
  const ids = getWrongQuestionIds();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids.filter(x => x !== id)));
}

export function clearWrongQuestionIds() {
  localStorage.removeItem(STORAGE_KEY);
}
