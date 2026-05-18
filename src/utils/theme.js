const KEY = 'literaturaQuizTheme';
const VALID = ['dark', 'light', 'system'];

export function getStoredTheme() {
  const v = localStorage.getItem(KEY);
  return VALID.includes(v) ? v : 'system';
}

export function saveTheme(theme) {
  localStorage.setItem(KEY, theme);
}

function getSystemPreference() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function resolveTheme(theme) {
  return theme === 'system' ? getSystemPreference() : theme;
}

export function applyTheme(theme) {
  document.documentElement.dataset.theme = resolveTheme(theme);
}
