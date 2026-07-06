import { createPersistedList } from './persistedList.svelte';

export type BeatStatus = 'planned' | 'active' | 'done';

export interface Beat {
  id: string;
  parentId: string | null;
  title: string;
  notes: string;
  status: BeatStatus;
}

const STORAGE_KEY = 'whiskerwatch:beats';

const seedBeats: Beat[] = [
  {
    id: crypto.randomUUID(),
    parentId: null,
    title: 'The granary raid',
    notes: 'The Gnawing Court is tunnelling under Old Miller’s granary. The warband needs to get in, find out how far the tunnels reach, and decide what to do about it.',
    status: 'active',
  },
];

const list = createPersistedList<Beat>(STORAGE_KEY, seedBeats);

export function getBeats(): Beat[] {
  return list.items;
}

export function addBeat(input: Omit<Beat, 'id'>): void {
  list.add({ ...input, id: crypto.randomUUID() });
}

export function updateBeat(id: string, patch: Partial<Omit<Beat, 'id'>>): void {
  list.update(id, patch);
}

function collectDescendantIds(id: string): string[] {
  const children = list.items.filter((b) => b.parentId === id);
  return children.flatMap((c) => [c.id, ...collectDescendantIds(c.id)]);
}

export function getDescendantCount(id: string): number {
  return collectDescendantIds(id).length;
}

export function removeBeat(id: string): void {
  const ids = new Set([id, ...collectDescendantIds(id)]);
  list.replaceAll(list.items.filter((b) => !ids.has(b.id)));
}

export function replaceBeats(beats: Beat[]): void {
  list.replaceAll(beats);
}
