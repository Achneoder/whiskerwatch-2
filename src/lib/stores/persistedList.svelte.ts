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

export function createPersistedList<T extends Identified>(storageKey: string, seed: T[]): PersistedList<T> {
  const items = $state<T[]>(readJSON(storageKey, seed));

  function persist() {
    writeJSON(storageKey, items);
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
