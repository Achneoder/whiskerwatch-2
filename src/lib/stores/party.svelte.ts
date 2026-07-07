import { createPersistedList } from './persistedList.svelte';
import { migrateConditions, type ConditionName, type Scar } from '../conditions';
import { applyDamage, type DamageOutcome } from '../combat';

export interface PartyMember {
  id: string;
  name: string;
  role: string;
  hp: number;
  max: number;
  /** Current STR score (3–18 range in Mausritter). Drained by damage overflow once HP hits 0. */
  str: number;
  maxStr: number;
  /** Static DEX score — no "current vs max" distinction; DEX isn't drained by damage. */
  dex: number;
  /** Static WIL score — no "current vs max" distinction. */
  wil: number;
  pips: number;
  xp: number;
  level: number;
  status: 'active' | 'deceased';
  conditions: ConditionName[];
  /** Permanent Fatal Wounds outcomes — separate from `conditions`, never auto-cleared. */
  scars: Scar[];
}

const STORAGE_KEY = 'whiskerwatch:party';

/**
 * PLACEHOLDER — Mausritter awards XP for *spending* pips during downtime
 * (carousing, gear, keepsakes), not for kills, but the exact pips-per-XP
 * rate and level-up thresholds below have NOT been verified against the
 * core rulebook. Flagging explicitly: check these two constants against the
 * real Mausritter downtime rules before relying on them for actual play.
 */
export const DOWNTIME_XP_PER_PIP = 0.1; // placeholder: 1 XP per 10 pips spent
export const XP_PER_LEVEL = 1000; // placeholder: level = 1 + floor(xp / this)

const seedParty: PartyMember[] = [
  {
    id: crypto.randomUUID(),
    name: 'Pip',
    role: 'Scout',
    hp: 4,
    max: 6,
    str: 10,
    maxStr: 10,
    dex: 13,
    wil: 9,
    pips: 320,
    xp: 0,
    level: 1,
    status: 'active',
    conditions: [],
    scars: [],
  },
  {
    id: crypto.randomUUID(),
    name: 'Wren',
    role: 'Tinker',
    hp: 2,
    max: 6,
    str: 8,
    maxStr: 8,
    dex: 10,
    wil: 12,
    pips: 95,
    xp: 0,
    level: 1,
    status: 'active',
    conditions: ['frightened'],
    scars: [],
  },
  {
    id: crypto.randomUUID(),
    name: 'Bram',
    role: 'Warden',
    hp: 6,
    max: 6,
    str: 13,
    maxStr: 13,
    dex: 9,
    wil: 8,
    pips: 610,
    xp: 0,
    level: 1,
    status: 'active',
    conditions: ['hungry-thirsty'],
    scars: [],
  },
  {
    id: crypto.randomUUID(),
    name: 'Sedge',
    role: 'Sage',
    hp: 3,
    max: 6,
    str: 8,
    maxStr: 8,
    dex: 10,
    wil: 13,
    pips: 140,
    xp: 0,
    level: 1,
    status: 'active',
    conditions: [],
    scars: [],
  },
];

function isScar(value: unknown): value is Scar {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return typeof v.label === 'string' && typeof v.note === 'string';
}

/**
 * Fills sane defaults for fields a pre-Phase-7 record won't have (missing
 * attributes/status/scars/xp/level) and migrates the old free-text
 * `{tone, label}` conditions to the fixed vocabulary, so an old
 * localStorage or campaign-export record degrades gracefully instead of
 * shipping `undefined` fields into the UI.
 */
function normalizeMember(raw: unknown): PartyMember {
  const r = (raw ?? {}) as Partial<PartyMember> & Record<string, unknown>;
  const maxStr = typeof r.maxStr === 'number' ? r.maxStr : 10;
  return {
    id: typeof r.id === 'string' && r.id.length > 0 ? r.id : crypto.randomUUID(),
    name: typeof r.name === 'string' ? r.name : 'Unnamed',
    role: typeof r.role === 'string' ? r.role : '',
    hp: typeof r.hp === 'number' ? r.hp : 6,
    max: typeof r.max === 'number' ? r.max : 6,
    str: typeof r.str === 'number' ? r.str : maxStr,
    maxStr,
    dex: typeof r.dex === 'number' ? r.dex : 10,
    wil: typeof r.wil === 'number' ? r.wil : 10,
    pips: typeof r.pips === 'number' ? r.pips : 0,
    xp: typeof r.xp === 'number' ? r.xp : 0,
    level: typeof r.level === 'number' ? r.level : 1,
    status: r.status === 'deceased' ? 'deceased' : 'active',
    conditions: migrateConditions(r.conditions),
    scars: Array.isArray(r.scars) ? r.scars.filter(isScar) : [],
  };
}

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
  // `normalizeMember` takes `unknown` deliberately: a record coming from
  // localStorage or a campaign-export JSON file may not actually match
  // `PartyMember` at runtime even though it's typed that way here, so we
  // re-validate instead of trusting the annotation.
  list.replaceAll((members as unknown[]).map(normalizeMember));
}

// Normalize whatever came out of localStorage on load (see normalizeMember
// above) so old-shape records never leak undefined fields into the app.
replaceParty(list.items);

export function setHp(id: string, value: number): void {
  const member = list.items.find((m) => m.id === id);
  if (!member) return;
  list.update(id, { hp: Math.max(0, Math.min(member.max, value)) });
}

export function healHp(id: string, amount: number): void {
  const member = list.items.find((m) => m.id === id);
  if (!member) return;
  list.update(id, { hp: Math.max(0, Math.min(member.max, member.hp + Math.max(0, amount))) });
}

/**
 * Applies damage using Mausritter's HP-then-STR overflow. Returns the
 * outcome so the caller (Live Session, stage 2) knows whether a STR save is
 * now due and whether STR hit exactly 0 — this function does not roll that
 * save or apply Injured/Incapacitated/deceased itself.
 */
export function dealDamage(id: string, amount: number): DamageOutcome | null {
  const member = list.items.find((m) => m.id === id);
  if (!member) return null;
  const outcome = applyDamage({ hp: member.hp, str: member.str }, amount);
  list.update(id, { hp: outcome.newHp, str: outcome.newStr });
  return outcome;
}

export function killMember(id: string): void {
  list.update(id, { status: 'deceased' });
}

export function addScar(id: string, scar: Scar): void {
  const member = list.items.find((m) => m.id === id);
  if (!member) return;
  list.update(id, { scars: [...member.scars, scar] });
}

export function addCondition(id: string, condition: ConditionName): void {
  const member = list.items.find((m) => m.id === id);
  if (!member || member.conditions.includes(condition)) return;
  list.update(id, { conditions: [...member.conditions, condition] });
}

export function removeCondition(id: string, condition: ConditionName): void {
  const member = list.items.find((m) => m.id === id);
  if (!member) return;
  list.update(id, { conditions: member.conditions.filter((c) => c !== condition) });
}

export interface DowntimeResult {
  xpGained: number;
  totalXp: number;
  leveledUp: boolean;
  newLevel: number;
}

/**
 * Mausritter awards XP for pips *spent* in downtime (carousing/gear/
 * keepsakes), not kills. See the `DOWNTIME_XP_PER_PIP`/`XP_PER_LEVEL`
 * placeholder comment above — verify the formula before trusting the
 * numbers this returns for real advancement.
 */
export function spendDowntime(id: string, pipsSpent: number): DowntimeResult | null {
  const member = list.items.find((m) => m.id === id);
  if (!member) return null;
  // Snapshot the previous level before `list.update` mutates the same
  // reactive object `member` points to — reading `member.level` again after
  // that call would see the *new* value, not the one we're comparing against.
  const previousLevel = member.level;
  const xpGained = Math.round(Math.max(0, pipsSpent) * DOWNTIME_XP_PER_PIP);
  const totalXp = member.xp + xpGained;
  const newLevel = Math.max(previousLevel, 1 + Math.floor(totalXp / XP_PER_LEVEL));
  list.update(id, { xp: totalXp, level: newLevel });
  return { xpGained, totalXp, leveledUp: newLevel > previousLevel, newLevel };
}
