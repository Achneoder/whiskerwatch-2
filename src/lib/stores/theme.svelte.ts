import { readJSON, writeJSON } from '../storage';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'whiskerwatch:theme';

const state = $state<{ theme: Theme }>(readJSON(STORAGE_KEY, { theme: 'light' as Theme }));

function apply() {
  document.documentElement.setAttribute('data-theme', state.theme);
}

export function getTheme(): Theme {
  return state.theme;
}

export function toggleTheme(): void {
  setTheme(state.theme === 'light' ? 'dark' : 'light');
}

export function setTheme(theme: Theme): void {
  state.theme = theme;
  writeJSON(STORAGE_KEY, state);
  apply();
}

export function initTheme(): void {
  apply();
}
