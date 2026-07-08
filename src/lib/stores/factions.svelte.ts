import { createPersistedList } from './persistedList.svelte';
import { removeEdgesForFaction } from './factionEdges.svelte';
import { removeFactionFromBeats } from './beats.svelte';
import { removeFactionFromHexNodes } from './hexmap.svelte';
import { seedFactions } from './factionSeed';
import { logClockChanged } from './campaignHistory.svelte';

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

/** Ticks a faction's clock up or down by `delta`, clamped to `[0, of]` — the tappable-pill action used at the table. */
export function bumpFactionClock(id: string, delta: number): void {
  const faction = list.items.find((f) => f.id === id);
  if (!faction) return;
  const from = faction.clock;
  const clock = Math.max(0, Math.min(faction.of, faction.clock + delta));
  list.update(id, { clock });
  if (clock !== from) {
    logClockChanged({
      timestamp: new Date().toISOString(),
      factionId: id,
      factionName: faction.name,
      from,
      to: clock,
      max: faction.of,
    });
  }
}

/** Removes a faction and cascades to any relationships that referenced it. */
export function removeFaction(id: string): void {
  list.remove(id);
  removeEdgesForFaction(id);
  removeFactionFromBeats(id);
  removeFactionFromHexNodes(id);
}

export function replaceFactions(factions: Faction[]): void {
  list.replaceAll(factions);
}
