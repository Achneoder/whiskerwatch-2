import { addMessages, getLocaleFromNavigator, init, locale } from 'svelte-i18n';
import en from './en.json';
import de from './de.json';
import { readJSON, writeJSON } from '../storage';

export const SUPPORTED_LOCALES = ['en', 'de'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

const STORAGE_KEY = 'whiskerwatch:locale';

addMessages('en', en);
addMessages('de', de);

function isSupported(value: string | null | undefined): value is SupportedLocale {
  return !!value && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

function detectInitialLocale(): SupportedLocale {
  const stored = readJSON<string | null>(STORAGE_KEY, null);
  if (isSupported(stored)) return stored;

  const navigatorLocale = getLocaleFromNavigator()?.slice(0, 2);
  if (isSupported(navigatorLocale)) return navigatorLocale;

  return 'en';
}

const initialLocale = detectInitialLocale();

init({
  fallbackLocale: 'en',
  initialLocale,
});

// Keep the document language in sync so screen readers announce content in the
// right language and pick the correct pronunciation/hyphenation rules.
function syncDocumentLang(next: SupportedLocale): void {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = next;
  }
}

syncDocumentLang(initialLocale);

export function setLocale(next: SupportedLocale): void {
  locale.set(next);
  writeJSON(STORAGE_KEY, next);
  syncDocumentLang(next);
}

export { locale };
