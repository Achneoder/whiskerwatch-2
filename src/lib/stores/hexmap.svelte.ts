import { createPersistedList } from './persistedList.svelte';
import { clearHexNodeFromBeats } from './beats.svelte';

export type HexTerrain = 'meadow' | 'hedgerow' | 'forest' | 'water' | 'hills' | 'ruins' | 'settlement';

export interface HexEncounter {
  bestiaryId: string;
  weight: number;
}

export interface HexNode {
  id: string;
  q: number;
  r: number;
  terrain: HexTerrain;
  name: string;
  notes: string;
  discovered: boolean;
  /** Bestiary entries (with roll weight) that can be encountered here — set from the Hex form, read by Generators. */
  encounters: HexEncounter[];
  /** Faction that controls this hex, if any — set from the Hex form, drawn as a ring on the canvas. */
  controlledBy: string | null;
  /** Factions contesting this hex, if any — set from the Hex form, drawn as rings on the canvas. */
  contestedBy: string[];
}

export const TERRAINS: HexTerrain[] = ['meadow', 'hedgerow', 'forest', 'water', 'hills', 'ruins', 'settlement'];

/** Terrain → hex fill (token-based; two greens differ in depth so they read apart). */
export const terrainFill: Record<HexTerrain, string> = {
  meadow: 'var(--surface-sunk)',
  hedgerow: 'var(--success-tint)',
  forest: 'color-mix(in srgb, var(--success) 32%, var(--surface-raised))',
  water: 'var(--terrain-water-tint)',
  hills: 'var(--warning-tint)',
  ruins: 'var(--danger-tint)',
  settlement: 'var(--accent-tint)',
};

const STORAGE_KEY = 'whiskerwatch:hexmap';

const seedHexNodes: HexNode[] = [
  {
    id: crypto.randomUUID(),
    q: 0,
    r: 0,
    terrain: 'settlement',
    name: 'Bramblewatch',
    notes: "Home warren & market on stilts; the Reeve's Granary feeds the valley, but something gnaws the support beams at night.",
    discovered: true,
    encounters: [],
    controlledBy: null,
    contestedBy: [],
  },
  {
    id: crypto.randomUUID(),
    q: 1,
    r: 0,
    terrain: 'ruins',
    name: 'The Gnawgate',
    notes: "A collapsed silo hides the Gnawing Court's tunnel entrance; bored Ratling sentries watch in shifts.",
    discovered: false,
    encounters: [],
    controlledBy: null,
    contestedBy: [],
  },
  {
    id: crypto.randomUUID(),
    q: 0,
    r: 1,
    terrain: 'water',
    name: 'Owl Bridge',
    notes: 'A single-plank crossing over Millrace Creek; a barn owl roosts in the rafters and demands a toll pip.',
    discovered: true,
    encounters: [],
    controlledBy: null,
    contestedBy: [],
  },
  {
    id: crypto.randomUUID(),
    q: -1,
    r: 0,
    terrain: 'meadow',
    name: 'Sunwarp Meadow',
    notes: "The Seed-Keepers' storage burrows hide beneath a fallen log at the meadow's heart.",
    discovered: false,
    encounters: [],
    controlledBy: null,
    contestedBy: [],
  },
  {
    id: crypto.randomUUID(),
    q: -1,
    r: 1,
    terrain: 'hedgerow',
    name: '',
    notes: '',
    discovered: false,
    encounters: [],
    controlledBy: null,
    contestedBy: [],
  },
  {
    id: crypto.randomUUID(),
    q: 0,
    r: -1,
    terrain: 'forest',
    name: 'Thistlewood Edge',
    notes: 'A screened clearing where the Bramblewatch Militia drills, away from prying eyes.',
    discovered: false,
    encounters: [],
    controlledBy: null,
    contestedBy: [],
  },
  {
    id: crypto.randomUUID(),
    q: 1,
    r: -1,
    terrain: 'hills',
    name: '',
    notes: '',
    discovered: false,
    encounters: [],
    controlledBy: null,
    contestedBy: [],
  },
  {
    id: crypto.randomUUID(),
    q: 2,
    r: 0,
    terrain: 'ruins',
    name: 'The Drowned Barrow',
    notes: "A half-sunk mouse-lord's barrow; legend says a cursed hoard still glitters inside — and something guards it.",
    discovered: false,
    encounters: [],
    controlledBy: null,
    contestedBy: [],
  },
];

const list = createPersistedList<HexNode>(STORAGE_KEY, seedHexNodes);

/**
 * Resolves once this store's data has been hydrated from IndexedDB (see
 * `persistedList.svelte.ts`) and backfilled for legacy records saved before
 * `encounters`/`controlledBy`/`contestedBy` existed, so downstream code can
 * rely on all three fields always being present. App boot awaits this
 * (alongside every other store) before mounting `App.svelte`.
 */
export const ready: Promise<void> = list.ready.then(() => {
  // Backfill legacy records (saved before encounters existed) so downstream
  // code can rely on the field always being present.
  if (list.items.some((h) => !Array.isArray(h.encounters))) {
    list.replaceAll(list.items.map((h) => ({ ...h, encounters: Array.isArray(h.encounters) ? h.encounters : [] })));
  }

  // Backfill legacy records (saved before controlledBy/contestedBy existed) so
  // downstream code can rely on both fields always being present.
  if (list.items.some((h) => h.controlledBy === undefined || !Array.isArray(h.contestedBy))) {
    list.replaceAll(
      list.items.map((h) => ({
        ...h,
        controlledBy: h.controlledBy ?? null,
        contestedBy: Array.isArray(h.contestedBy) ? h.contestedBy : [],
      }))
    );
  }
});

/** See `PersistedList.flush` — awaited by `campaignExport.ts` after `replaceHexNodes` to guarantee an import is durably saved. */
export const flush: () => Promise<void> = () => list.flush();

export function getHexNodes(): HexNode[] {
  return list.items;
}

export function getHexNodeAt(q: number, r: number): HexNode | undefined {
  return list.items.find((h) => h.q === q && h.r === r);
}

export function addHexNode(input: Omit<HexNode, 'id'>): void {
  list.add({ ...input, id: crypto.randomUUID() });
}

export function updateHexNode(id: string, patch: Partial<Omit<HexNode, 'id'>>): void {
  list.update(id, patch);
}

/** Removes a hex node and cascades to any beats that referenced it. */
export function removeHexNode(id: string): void {
  list.remove(id);
  clearHexNodeFromBeats(id);
}

export function replaceHexNodes(nodes: HexNode[]): void {
  list.replaceAll(nodes);
}

/** Drops a bestiary id from every hex's `encounters` list — call when a bestiary entry is removed. */
export function removeBestiaryEntryFromHexNodes(bestiaryId: string): void {
  list.items
    .filter((h) => h.encounters.some((e) => e.bestiaryId === bestiaryId))
    .forEach((h) => list.update(h.id, { encounters: h.encounters.filter((e) => e.bestiaryId !== bestiaryId) }));
}

/** Clears a faction id from every hex's `controlledBy`/`contestedBy` — call when a faction is removed. */
export function removeFactionFromHexNodes(factionId: string): void {
  list.items
    .filter((h) => h.controlledBy === factionId || h.contestedBy.includes(factionId))
    .forEach((h) =>
      list.update(h.id, {
        controlledBy: h.controlledBy === factionId ? null : h.controlledBy,
        contestedBy: h.contestedBy.filter((id) => id !== factionId),
      })
    );
}
