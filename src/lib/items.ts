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

/**
 * Ticks one charge off a chargeable item's wear track, floored at 0. A
 * no-op (returns the same `charges` value) if the item isn't found, isn't
 * chargeable (`charges`/`maxCharges` is `null`), or is already at 0 — the
 * caller (Live Session) is responsible for telling the GM "already empty"
 * in that last case rather than this function signaling it.
 */
export function tickCharge(items: Item[], itemId: string): Item[] {
  return items.map((item) => {
    if (item.id !== itemId) return item;
    if (item.charges === null || item.maxCharges === null) return item;
    return { ...item, charges: Math.max(0, item.charges - 1) };
  });
}

/** Fixed split of the one shared `MAX_SLOTS` cap — 4 quick-access "paws" slots, 6 "body" slots. */
export const PAWS_SLOTS = 4;
export const BODY_SLOTS = MAX_SLOTS - PAWS_SLOTS;

/**
 * Splits the one flat `items` array into the two visual sections shared by
 * `ItemSlotGrid` (roster prep editor) and `LiveSessionInventoryModal` (live
 * table view) — one source of truth for the packing rule so both stay in
 * sync. Items are walked in order and packed into "paws" (4-slot budget)
 * until they no longer fit, then everything else renders in "body" (6-slot
 * budget). A 2-slot item is never split across sections. If the mouse is
 * overburdened, the overflow just renders as extra filled body cells beyond
 * its nominal 6 — nothing is ever hidden or dropped.
 */
export function splitSections(items: Item[]): { paws: Item[]; body: Item[] } {
  const paws: Item[] = [];
  const body: Item[] = [];
  let runningPawsSlots = 0;
  for (const item of items) {
    if (runningPawsSlots + item.slots <= PAWS_SLOTS) {
      paws.push(item);
      runningPawsSlots += item.slots;
    } else {
      body.push(item);
    }
  }
  return { paws, body };
}
