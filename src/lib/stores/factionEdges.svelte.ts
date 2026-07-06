import { createPersistedList } from './persistedList.svelte';
import { seedFactionEdges } from './factionSeed';

export type FactionRelationType = 'ally' | 'enemy' | 'rival';

export interface FactionEdge {
  id: string;
  sourceId: string;
  targetId: string;
  type: FactionRelationType;
}

/** How each relationship type is drawn in the graph (units are viewBox-relative). */
export const relationEdgeStyle: Record<FactionRelationType, { color: string; width: number; dash: string }> = {
  ally: { color: 'var(--success)', width: 1.2, dash: '' },
  enemy: { color: 'var(--danger)', width: 1.8, dash: '' },
  rival: { color: 'var(--warning)', width: 1.2, dash: '3 2' },
};

const STORAGE_KEY = 'whiskerwatch:factionEdges';

const list = createPersistedList<FactionEdge>(STORAGE_KEY, seedFactionEdges);

export function getFactionEdges(): FactionEdge[] {
  return list.items;
}

export function addFactionEdge(input: Omit<FactionEdge, 'id'>): void {
  list.add({ ...input, id: crypto.randomUUID() });
}

export function updateFactionEdge(id: string, patch: Partial<Omit<FactionEdge, 'id'>>): void {
  list.update(id, patch);
}

export function removeFactionEdge(id: string): void {
  list.remove(id);
}

/** Removes every edge touching a faction, on either end — used when a faction is deleted. */
export function removeEdgesForFaction(factionId: string): void {
  list.replaceAll(list.items.filter((e) => e.sourceId !== factionId && e.targetId !== factionId));
}

export function replaceFactionEdges(edges: FactionEdge[]): void {
  list.replaceAll(edges);
}
