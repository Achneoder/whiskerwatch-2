import { createPersistedList } from './persistedList.svelte';

export interface Hireling {
  id: string;
  name: string;
  role: string;
  hp: number;
  max: number;
  loyalty: number;
  notes: string;
}

const STORAGE_KEY = 'whiskerwatch:hirelings';

const seedHirelings: Hireling[] = [
  {
    id: crypto.randomUUID(),
    name: 'Oat',
    role: 'Porter',
    hp: 3,
    max: 3,
    loyalty: 4,
    notes: 'Carries the spare rope and two rations. Paid 5p/day.',
  },
];

const list = createPersistedList<Hireling>(STORAGE_KEY, seedHirelings);

export function getHirelings(): Hireling[] {
  return list.items;
}

export function addHireling(input: Omit<Hireling, 'id'>): void {
  list.add({ ...input, id: crypto.randomUUID() });
}

export function updateHireling(id: string, patch: Partial<Omit<Hireling, 'id'>>): void {
  list.update(id, patch);
}

export function removeHireling(id: string): void {
  list.remove(id);
}

export function replaceHirelings(hirelings: Hireling[]): void {
  list.replaceAll(hirelings);
}
