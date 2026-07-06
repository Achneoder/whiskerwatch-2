import { readJSON, writeJSON } from '../storage';

export interface Identified {
  id: string;
}

export interface PersistedList<T extends Identified> {
  items: T[];
  add: (item: T) => void;
  update: (id: string, patch: Partial<Omit<T, 'id'>>) => void;
  remove: (id: string) => void;
  replaceAll: (newItems: T[]) => void;
}

function ensureId<T extends Identified>(item: T): T {
  if (typeof item?.id === 'string' && item.id.length > 0) return item;
  return { ...item, id: crypto.randomUUID() };
}

/**
 * Repairs data written by an older schema (e.g. entities saved before an `id`
 * field existed) instead of crashing the app: a missing/duplicate id here
 * would otherwise blow up every keyed `{#each ... (item.id)}` block downstream
 * and unmount the whole page.
 */
function sanitize<T extends Identified>(raw: unknown, seed: T[]): T[] {
  if (!Array.isArray(raw)) return seed;
  const seenIds = new Set<string>();
  return raw.map((item) => {
    const withId = ensureId(item as T);
    if (seenIds.has(withId.id)) return { ...withId, id: crypto.randomUUID() };
    seenIds.add(withId.id);
    return withId;
  });
}

export function createPersistedList<T extends Identified>(storageKey: string, seed: T[]): PersistedList<T> {
  const raw = readJSON<unknown>(storageKey, seed);
  const sanitized = sanitize(raw, seed);
  const items = $state<T[]>(sanitized);

  function persist() {
    writeJSON(storageKey, items);
  }

  // If loading required repairs (missing/duplicate ids, or a malformed
  // record), persist the fix immediately so it doesn't need repairing again.
  if (JSON.stringify(raw) !== JSON.stringify(sanitized)) {
    persist();
  }

  function add(item: T): void {
    items.push(item);
    persist();
  }

  function update(id: string, patch: Partial<Omit<T, 'id'>>): void {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    Object.assign(item, patch);
    persist();
  }

  function remove(id: string): void {
    const index = items.findIndex((i) => i.id === id);
    if (index === -1) return;
    items.splice(index, 1);
    persist();
  }

  function replaceAll(newItems: T[]): void {
    items.splice(0, items.length, ...newItems);
    persist();
  }

  return { items, add, update, remove, replaceAll };
}
