import { createPersistedList } from './persistedList.svelte';

export type BeatStatus = 'planned' | 'active' | 'done';

export interface Beat {
  id: string;
  parentId: string | null;
  title: string;
  notes: string;
  status: BeatStatus;
  /** Hex this beat plays out at/around, if any — set from the Beat form, surfaced read-only on Hex Map. */
  hexNodeId: string | null;
  /** Factions this beat touches, if any — set from the Beat form, surfaced read-only on Factions. */
  factionIds: string[];
}

/** Fields callers may omit when adding a beat; defaulted below so downstream code never needs optional-chaining. */
export type BeatInput = Omit<Beat, 'id' | 'hexNodeId' | 'factionIds'> & {
  hexNodeId?: string | null;
  factionIds?: string[];
};

const STORAGE_KEY = 'whiskerwatch:beats';

const seedBeats: Beat[] = [
  {
    id: crypto.randomUUID(),
    parentId: null,
    title: 'The granary raid',
    notes: 'The Gnawing Court is tunnelling under Old Miller’s granary. The warband needs to get in, find out how far the tunnels reach, and decide what to do about it.',
    status: 'active',
    hexNodeId: null,
    factionIds: [],
  },
];

const list = createPersistedList<Beat>(STORAGE_KEY, seedBeats);

// Backfill legacy records (saved before hexNodeId/factionIds existed) so
// downstream code can rely on both fields always being present.
if (list.items.some((b) => b.hexNodeId === undefined || !Array.isArray(b.factionIds))) {
  list.replaceAll(
    list.items.map((b) => ({
      ...b,
      hexNodeId: b.hexNodeId ?? null,
      factionIds: Array.isArray(b.factionIds) ? b.factionIds : [],
    }))
  );
}

export function getBeats(): Beat[] {
  return list.items;
}

export function addBeat(input: BeatInput): void {
  list.add({
    ...input,
    hexNodeId: input.hexNodeId ?? null,
    factionIds: input.factionIds ?? [],
    id: crypto.randomUUID(),
  });
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

/** Nulls out `hexNodeId` on any beat referencing it — call when a hex node is removed. */
export function clearHexNodeFromBeats(hexNodeId: string): void {
  list.items.filter((b) => b.hexNodeId === hexNodeId).forEach((b) => list.update(b.id, { hexNodeId: null }));
}

/** Drops a faction id from every beat's `factionIds` — call when a faction is removed. */
export function removeFactionFromBeats(factionId: string): void {
  list.items
    .filter((b) => b.factionIds.includes(factionId))
    .forEach((b) => list.update(b.id, { factionIds: b.factionIds.filter((id) => id !== factionId) }));
}
