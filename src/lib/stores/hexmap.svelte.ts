import { createPersistedList } from './persistedList.svelte';

export type HexTerrain = 'meadow' | 'hedgerow' | 'forest' | 'water' | 'hills' | 'ruins' | 'settlement';

export interface HexNode {
  id: string;
  q: number;
  r: number;
  terrain: HexTerrain;
  name: string;
  notes: string;
  discovered: boolean;
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
  },
  {
    id: crypto.randomUUID(),
    q: 1,
    r: 0,
    terrain: 'ruins',
    name: 'The Gnawgate',
    notes: "A collapsed silo hides the Gnawing Court's tunnel entrance; bored Ratling sentries watch in shifts.",
    discovered: false,
  },
  {
    id: crypto.randomUUID(),
    q: 0,
    r: 1,
    terrain: 'water',
    name: 'Owl Bridge',
    notes: 'A single-plank crossing over Millrace Creek; a barn owl roosts in the rafters and demands a toll pip.',
    discovered: true,
  },
  {
    id: crypto.randomUUID(),
    q: -1,
    r: 0,
    terrain: 'meadow',
    name: 'Sunwarp Meadow',
    notes: "The Seed-Keepers' storage burrows hide beneath a fallen log at the meadow's heart.",
    discovered: false,
  },
  {
    id: crypto.randomUUID(),
    q: -1,
    r: 1,
    terrain: 'hedgerow',
    name: '',
    notes: '',
    discovered: false,
  },
  {
    id: crypto.randomUUID(),
    q: 0,
    r: -1,
    terrain: 'forest',
    name: 'Thistlewood Edge',
    notes: 'A screened clearing where the Bramblewatch Militia drills, away from prying eyes.',
    discovered: false,
  },
  {
    id: crypto.randomUUID(),
    q: 1,
    r: -1,
    terrain: 'hills',
    name: '',
    notes: '',
    discovered: false,
  },
  {
    id: crypto.randomUUID(),
    q: 2,
    r: 0,
    terrain: 'ruins',
    name: 'The Drowned Barrow',
    notes: "A half-sunk mouse-lord's barrow; legend says a cursed hoard still glitters inside — and something guards it.",
    discovered: false,
  },
];

const list = createPersistedList<HexNode>(STORAGE_KEY, seedHexNodes);

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

export function removeHexNode(id: string): void {
  list.remove(id);
}

export function replaceHexNodes(nodes: HexNode[]): void {
  list.replaceAll(nodes);
}
