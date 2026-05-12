const QUIZ_LENGTH_KEY = 'literaturaQuizLength';
const DEFAULT_LENGTH = 10;
export const VALID_LENGTHS = [5, 10, 15, 20];

export function getStoredQuizLength() {
  try {
    const raw = localStorage.getItem(QUIZ_LENGTH_KEY);
    if (!raw) return DEFAULT_LENGTH;
    const n = parseInt(raw, 10);
    return VALID_LENGTHS.includes(n) ? n : DEFAULT_LENGTH;
  } catch {
    return DEFAULT_LENGTH;
  }
}

export function storeQuizLength(n) {
  try {
    localStorage.setItem(QUIZ_LENGTH_KEY, String(n));
  } catch {}
}
