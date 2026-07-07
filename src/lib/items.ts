/**
 * The item/slot-inventory model shared between `PartyMember` and
 * `Hireling`. Both use one flat list of items and the same fixed 10-slot
 * cap (6 "body" + 4 "paws" is a UI/fiction convention over this single
 * array — hirelings are not reduced). This module is deliberately narrow,
 * mirroring `combat.ts`: pure types + pure list-transform helpers, no
 * top-level rune state. The per-store `addMemberItem`/`addHirelingItem`
 * (etc.) wrappers in `party.svelte.ts`/`hirelings.svelte.ts` call these
 * and persist the result.
 */
export interface Item {
  id: string;
  name: string;
  /** Bulky items (heavy armor, two-handed weapons, big treasure) take 2. A
   * rare few (worn clothes, natural claws/teeth) take 0 — allowed, but not
   * special-cased anywhere. */
  slots: 1 | 2;
  /** Current charges on a 6-pip wear track, or `null` for non-chargeable items. */
  charges: number | null;
  /** Max charges on the wear track, or `null` for non-chargeable items. */
  maxCharges: number | null;
  /** Free-text field for damage dice, armor rating, or any other flavor/rules note. */
  notes: string;
}

/** Fixed Mausritter slot cap: 6 body + 4 paws, identical for every mouse (player or hireling). */
export const MAX_SLOTS = 10;

/** Sum of `slots` across every item carried — the number the cap is checked against. */
export function usedSlots(items: Item[]): number {
  return items.reduce((total, item) => total + item.slots, 0);
}

/**
 * Whether this list exceeds `MAX_SLOTS`. This is purely informational
 * (a UI warning banner) — Mausritter's "overburdened" is not a status
 * effect/condition, and nothing in this module or its callers should ever
 * use this to block adding an item.
 */
export function isOverCapacity(items: Item[]): boolean {
  return usedSlots(items) > MAX_SLOTS;
}

export function addItem(items: Item[], input: Omit<Item, 'id'>): Item[] {
  return [...items, { ...input, id: crypto.randomUUID() }];
}

export function removeItem(items: Item[], itemId: string): Item[] {
  return items.filter((item) => item.id !== itemId);
}

export function updateItem(items: Item[], itemId: string, patch: Partial<Omit<Item, 'id'>>): Item[] {
  return items.map((item) => (item.id === itemId ? { ...item, ...patch } : item));
}
