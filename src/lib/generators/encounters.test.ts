import { describe, expect, it, vi, afterEach } from 'vitest';
import { generateEncounterFor, weightedPick } from './encounters';
import type { BestiaryEntry } from '../stores/bestiary.svelte';
import type { HexNode } from '../stores/hexmap.svelte';

function entry(id: string, name = id): BestiaryEntry {
  return { id, name, category: 'Vermin', hd: 1, hp: 2, armor: 0, attacks: [], special: '', notes: '' };
}

function hex(overrides: Partial<HexNode> = {}): HexNode {
  return {
    id: 'h1',
    q: 0,
    r: 0,
    terrain: 'meadow',
    name: 'Home',
    notes: '',
    discovered: true,
    encounters: [],
    controlledBy: null,
    contestedBy: [],
    ...overrides,
  };
}

describe('weightedPick', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('picks the entry whose cumulative weight range contains the roll', () => {
    const a = entry('a');
    const b = entry('b');
    const bestiary = [a, b];
    const encounters = [
      { bestiaryId: 'a', weight: 1 },
      { bestiaryId: 'b', weight: 3 },
    ];

    vi.spyOn(Math, 'random').mockReturnValue(0); // roll 0 -> first bucket (a)
    expect(weightedPick(encounters, bestiary)).toBe(a);

    vi.spyOn(Math, 'random').mockReturnValue(0.99); // roll near total (4) -> lands in b's bucket
    expect(weightedPick(encounters, bestiary)).toBe(b);
  });

  it('skips dangling bestiary ids that no longer resolve', () => {
    const a = entry('a');
    const bestiary = [a];
    const encounters = [
      { bestiaryId: 'ghost', weight: 5 },
      { bestiaryId: 'a', weight: 1 },
    ];

    expect(weightedPick(encounters, bestiary)).toBe(a);
  });

  it('returns null when nothing resolves', () => {
    expect(weightedPick([{ bestiaryId: 'ghost', weight: 1 }], [])).toBeNull();
    expect(weightedPick([], [entry('a')])).toBeNull();
  });

  it('never picks a zero-or-negative-weight link', () => {
    const a = entry('a');
    const b = entry('b');
    expect(
      weightedPick(
        [
          { bestiaryId: 'a', weight: 0 },
          { bestiaryId: 'b', weight: 2 },
        ],
        [a, b],
      ),
    ).toBe(b);
  });
});

describe('generateEncounterFor', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns null when the bestiary is empty, regardless of hex', () => {
    expect(generateEncounterFor('any', [], [])).toBeNull();
    expect(generateEncounterFor('h1', [hex()], [])).toBeNull();
  });

  it('"any" picks uniformly across the whole bestiary', () => {
    const a = entry('a');
    const b = entry('b');
    vi.spyOn(Math, 'random').mockReturnValue(0.6); // 0.6 * 2 = 1.2 -> second entry
    expect(generateEncounterFor('any', [hex()], [a, b])).toBe(b);
  });

  it('falls back to the whole bestiary when the resolved hex has no encounters configured', () => {
    const a = entry('a');
    const b = entry('b');
    vi.spyOn(Math, 'random').mockReturnValue(0);
    expect(generateEncounterFor('h1', [hex({ encounters: [] })], [a, b])).toBe(a);
  });

  it('falls back to the whole bestiary when the hex id does not resolve', () => {
    const a = entry('a');
    vi.spyOn(Math, 'random').mockReturnValue(0);
    expect(generateEncounterFor('missing', [hex()], [a])).toBe(a);
  });

  it('uses the hex-specific weighted encounter list when present', () => {
    const a = entry('a');
    const b = entry('b');
    const h = hex({ encounters: [{ bestiaryId: 'b', weight: 1 }] });
    vi.spyOn(Math, 'random').mockReturnValue(0);
    expect(generateEncounterFor('h1', [h], [a, b])).toBe(b);
  });

  it('degrades gracefully when a hex links a dangling bestiary id', () => {
    const a = entry('a');
    const h = hex({ encounters: [{ bestiaryId: 'ghost', weight: 1 }] });
    expect(generateEncounterFor('h1', [h], [a])).toBeNull();
  });
});
