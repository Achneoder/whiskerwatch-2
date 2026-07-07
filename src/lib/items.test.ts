import { describe, expect, it } from 'vitest';
import { tickCharge, splitSections, type Item } from './items';

function makeItem(overrides: Partial<Item> = {}): Item {
  return {
    id: 'i1',
    name: 'Torch',
    slots: 1,
    charges: null,
    maxCharges: null,
    notes: '',
    ...overrides,
  };
}

describe('tickCharge', () => {
  it('decrements charges by 1', () => {
    const items = [makeItem({ id: 'a', charges: 3, maxCharges: 6 })];

    const result = tickCharge(items, 'a');

    expect(result[0]?.charges).toBe(2);
  });

  it('floors at 0 rather than going negative', () => {
    const items = [makeItem({ id: 'a', charges: 0, maxCharges: 6 })];

    const result = tickCharge(items, 'a');

    expect(result[0]?.charges).toBe(0);
  });

  it('is a no-op for a non-chargeable item (charges/maxCharges null)', () => {
    const items = [makeItem({ id: 'a', charges: null, maxCharges: null })];

    const result = tickCharge(items, 'a');

    expect(result[0]?.charges).toBeNull();
  });

  it('is a no-op when the item id is not found', () => {
    const items = [makeItem({ id: 'a', charges: 3, maxCharges: 6 })];

    const result = tickCharge(items, 'missing');

    expect(result).toEqual(items);
    expect(result).not.toBe(items[0]);
  });

  it('does not mutate the original array or item', () => {
    const original = makeItem({ id: 'a', charges: 3, maxCharges: 6 });
    const items = [original];

    const result = tickCharge(items, 'a');

    expect(original.charges).toBe(3);
    expect(result).not.toBe(items);
  });

  it('only touches the matching item, leaving others untouched', () => {
    const items = [
      makeItem({ id: 'a', charges: 3, maxCharges: 6 }),
      makeItem({ id: 'b', charges: 5, maxCharges: 6 }),
    ];

    const result = tickCharge(items, 'b');

    expect(result[0]?.charges).toBe(3);
    expect(result[1]?.charges).toBe(4);
  });
});

describe('splitSections', () => {
  it('packs items into paws up to its 4-slot budget, then overflows to body', () => {
    const items = [
      makeItem({ id: 'a', slots: 2 }),
      makeItem({ id: 'b', slots: 2 }),
      makeItem({ id: 'c', slots: 1 }),
    ];

    const { paws, body } = splitSections(items);

    expect(paws.map((i) => i.id)).toEqual(['a', 'b']);
    expect(body.map((i) => i.id)).toEqual(['c']);
  });

  it('never splits a 2-slot item across sections', () => {
    // 3 slots already used in paws, so a 2-slot item wouldn't fit (budget is 4)
    // and should go entirely to body rather than partially filling paws.
    const items = [
      makeItem({ id: 'a', slots: 1 }),
      makeItem({ id: 'b', slots: 2 }),
      makeItem({ id: 'c', slots: 2 }),
    ];

    const { paws, body } = splitSections(items);

    expect(paws.map((i) => i.id)).toEqual(['a', 'b']);
    expect(body.map((i) => i.id)).toEqual(['c']);
  });

  it('returns empty sections for an empty list', () => {
    expect(splitSections([])).toEqual({ paws: [], body: [] });
  });
});
