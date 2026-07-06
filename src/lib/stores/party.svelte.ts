import { readJSON, writeJSON } from '../storage';

export interface PartyMember {
  name: string;
  role: string;
  hp: number;
  max: number;
  pips: number;
  conditions: { tone: 'danger' | 'warning'; label: string }[];
}

const STORAGE_KEY = 'whiskerwatch:party';

const seedParty: PartyMember[] = [
  { name: 'Pip', role: 'Scout', hp: 4, max: 6, pips: 320, conditions: [] },
  {
    name: 'Wren',
    role: 'Tinker',
    hp: 2,
    max: 6,
    pips: 95,
    conditions: [{ tone: 'danger', label: 'Frightened' }],
  },
  {
    name: 'Bram',
    role: 'Warden',
    hp: 6,
    max: 6,
    pips: 610,
    conditions: [{ tone: 'warning', label: 'Hungry' }],
  },
  { name: 'Sedge', role: 'Sage', hp: 3, max: 6, pips: 140, conditions: [] },
];

const party = $state<PartyMember[]>(readJSON(STORAGE_KEY, seedParty));

function persist() {
  writeJSON(STORAGE_KEY, party);
}

export function getParty(): PartyMember[] {
  return party;
}

export function setHp(index: number, value: number): void {
  const member = party[index];
  if (!member) return;
  member.hp = Math.max(0, Math.min(member.max, value));
  persist();
}
