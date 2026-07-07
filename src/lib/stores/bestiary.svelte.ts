import { createPersistedList } from './persistedList.svelte';
import { removeBestiaryEntryFromHexNodes } from './hexmap.svelte';

export type BestiaryCategory = 'Vermin' | 'Beast' | 'Bird of Prey' | 'Humanoid' | 'Aberration';

export interface BestiaryAttack {
  name: string;
  damage: string;
}

export interface BestiaryEntry {
  id: string;
  name: string;
  category: BestiaryCategory;
  hd: number;
  hp: number;
  armor: number;
  attacks: BestiaryAttack[];
  special: string;
  notes: string;
}

const STORAGE_KEY = 'whiskerwatch:bestiary';

const seedBestiary: BestiaryEntry[] = [
  {
    id: crypto.randomUUID(),
    name: 'Gnawing Court Ratling',
    category: 'Vermin',
    hd: 2,
    hp: 4,
    armor: 1,
    attacks: [{ name: 'Rusty blade', damage: 'd6' }],
    special: 'Pack tactics: +1 to hit when two or more ratlings attack the same target.',
    notes: 'Cowardly alone, bold in numbers.',
  },
  {
    id: crypto.randomUUID(),
    name: 'Tunnel Widow',
    category: 'Beast',
    hd: 3,
    hp: 6,
    armor: 0,
    attacks: [{ name: 'Venomous bite', damage: 'd6' }],
    special: 'On a hit, the target must pass a STR save or become Weakened (-1 to STR checks) until they next rest.',
    notes: 'Waits motionless in web-choked side tunnels.',
  },
  {
    id: crypto.randomUUID(),
    name: 'Rat Court Enforcer',
    category: 'Vermin',
    hd: 4,
    hp: 8,
    armor: 2,
    attacks: [{ name: 'Cleaver', damage: 'd8' }],
    special: 'Once per fight, can push a mouse back two squares on a hit.',
    notes: "Reports directly to the Gnawing Court's leadership.",
  },
  {
    id: crypto.randomUUID(),
    name: 'Sewer Owl',
    category: 'Bird of Prey',
    hd: 3,
    hp: 6,
    armor: 0,
    attacks: [{ name: 'Talons', damage: 'd6+1' }],
    special: "Silent flight: the owl's first attack in a fight is a critical hit (double damage) if it went unseen.",
    notes: 'More interested in tribute than territory — see Owl Bridge Toll.',
  },
  {
    id: crypto.randomUUID(),
    name: 'The Granary Rot',
    category: 'Aberration',
    hd: 5,
    hp: 10,
    armor: 1,
    attacks: [{ name: 'Rotting slam', damage: 'd6' }],
    special: 'Spores: anyone ending their turn adjacent must pass a STR save or gain a level of Exhausted.',
    notes: "Grows larger the longer the Gnawing Court's tunnels go unchecked.",
  },
];

const list = createPersistedList<BestiaryEntry>(STORAGE_KEY, seedBestiary);

export function getBestiary(): BestiaryEntry[] {
  return list.items;
}

/** Returns the generated id so callers (e.g. "save generated NPC") can offer an undo. */
export function addBestiaryEntry(input: Omit<BestiaryEntry, 'id'>): string {
  const id = crypto.randomUUID();
  list.add({ ...input, id });
  return id;
}

export function updateBestiaryEntry(id: string, patch: Partial<Omit<BestiaryEntry, 'id'>>): void {
  list.update(id, patch);
}

/** Removes a bestiary entry and cascades to any hex encounter lists that referenced it. */
export function removeBestiaryEntry(id: string): void {
  list.remove(id);
  removeBestiaryEntryFromHexNodes(id);
}

export function replaceBestiary(entries: BestiaryEntry[]): void {
  list.replaceAll(entries);
}
