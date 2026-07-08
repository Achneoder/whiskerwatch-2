import { createPersistedList } from './persistedList.svelte';

export type AdventureStatus = 'planned' | 'active' | 'completed';

export interface Adventure {
  id: string;
  title: string;
  description: string;
  status: AdventureStatus;
}

const STORAGE_KEY = 'whiskerwatch:adventures';

/**
 * Deliberately no seed data here: unlike every other store, an `Adventure`
 * used to be implicit (the app's one root `Beat`). Rather than seeding this
 * list independently — which would create a duplicate "The granary raid"
 * adventure for every GM already carrying that seed beat forward from before
 * this feature existed — the very first Adventure is *derived* by
 * `migrateLegacyBeatsToAdventures` (see `beats.svelte.ts`) from whatever root
 * beat is already on record, including the one baked into `beats.svelte.ts`'s
 * own seed data for a genuinely fresh install. See that function's doc
 * comment for the full algorithm.
 */
const seedAdventures: Adventure[] = [];

const list = createPersistedList<Adventure>(STORAGE_KEY, seedAdventures);

/** Resolves once this store's data has been hydrated from IndexedDB. App boot awaits this (alongside every other store) before mounting `App.svelte`. */
export const ready: Promise<void> = list.ready;

/** See `PersistedList.flush` — awaited by `campaignExport.ts` after `replaceAdventures` to guarantee an import is durably saved. */
export const flush: () => Promise<void> = () => list.flush();

export function getAdventures(): Adventure[] {
  return list.items;
}

export function addAdventure(input: Omit<Adventure, 'id'>): void {
  list.add({ ...input, id: crypto.randomUUID() });
}

export function updateAdventure(id: string, patch: Partial<Omit<Adventure, 'id'>>): void {
  list.update(id, patch);
}

export function removeAdventure(id: string): void {
  list.remove(id);
}

export function replaceAdventures(adventures: Adventure[]): void {
  list.replaceAll(adventures);
}
