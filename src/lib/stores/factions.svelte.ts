import { createPersistedList } from './persistedList.svelte';
import { removeEdgesForFaction } from './factionEdges.svelte';
import { seedFactions } from './factionSeed';

export type FactionDisposition = 'hostile' | 'neutral' | 'ally';

export interface Faction {
  id: string;
  name: string;
  disposition: FactionDisposition;
  clock: number;
  of: number;
  note: string;
  tags: string[];
}

/** Disposition → `Tag` tone (alignment signal, kept separate from the clock). */
export const dispositionTagTone: Record<FactionDisposition, 'danger' | 'default' | 'success'> = {
  hostile: 'danger',
  neutral: 'default',
  ally: 'success',
};

/** Disposition → node ring colour in the relationship graph. */
export const dispositionRingColor: Record<FactionDisposition, string> = {
  hostile: 'var(--danger)',
  neutral: 'var(--border-strong)',
  ally: 'var(--success)',
};

const STORAGE_KEY = 'whiskerwatch:factions';

const list = createPersistedList<Faction>(STORAGE_KEY, seedFactions);

export function getFactions(): Faction[] {
  return list.items;
}

export function addFaction(input: Omit<Faction, 'id'>): void {
  list.add({ ...input, id: crypto.randomUUID() });
}

export function updateFaction(id: string, patch: Partial<Omit<Faction, 'id'>>): void {
  list.update(id, patch);
}

/** Removes a faction and cascades to any relationships that referenced it. */
export function removeFaction(id: string): void {
  list.remove(id);
  removeEdgesForFaction(id);
}

export function replaceFactions(factions: Faction[]): void {
  list.replaceAll(factions);
}
