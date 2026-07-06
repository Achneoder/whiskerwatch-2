import { createPersistedList } from './persistedList.svelte';

export interface PartyMember {
  id: string;
  name: string;
  role: string;
  hp: number;
  max: number;
  pips: number;
  conditions: { tone: 'danger' | 'warning'; label: string }[];
}

const STORAGE_KEY = 'whiskerwatch:party';

const seedParty: PartyMember[] = [
  { id: crypto.randomUUID(), name: 'Pip', role: 'Scout', hp: 4, max: 6, pips: 320, conditions: [] },
  {
    id: crypto.randomUUID(),
    name: 'Wren',
    role: 'Tinker',
    hp: 2,
    max: 6,
    pips: 95,
    conditions: [{ tone: 'danger', label: 'Frightened' }],
  },
  {
    id: crypto.randomUUID(),
    name: 'Bram',
    role: 'Warden',
    hp: 6,
    max: 6,
    pips: 610,
    conditions: [{ tone: 'warning', label: 'Hungry' }],
  },
  { id: crypto.randomUUID(), name: 'Sedge', role: 'Sage', hp: 3, max: 6, pips: 140, conditions: [] },
];

const list = createPersistedList<PartyMember>(STORAGE_KEY, seedParty);

export function getParty(): PartyMember[] {
  return list.items;
}

export function addMember(input: Omit<PartyMember, 'id'>): void {
  list.add({ ...input, id: crypto.randomUUID() });
}

export function updateMember(id: string, patch: Partial<Omit<PartyMember, 'id'>>): void {
  list.update(id, patch);
}

export function removeMember(id: string): void {
  list.remove(id);
}

export function replaceParty(members: PartyMember[]): void {
  list.replaceAll(members);
}

export function setHp(id: string, value: number): void {
  const member = list.items.find((m) => m.id === id);
  if (!member) return;
  list.update(id, { hp: Math.max(0, Math.min(member.max, value)) });
}
