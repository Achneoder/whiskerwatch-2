import { describe, expect, it, beforeEach } from 'vitest';
import { getBestiary, addBestiaryEntry, updateBestiaryEntry, removeBestiaryEntry, replaceBestiary } from './bestiary.svelte';

describe('bestiary store', () => {
  beforeEach(() => {
    replaceBestiary([]);
  });

  it('adds an entry', () => {
    addBestiaryEntry({
      name: 'Ratling',
      category: 'Vermin',
      hd: 2,
      hp: 4,
      armor: 1,
      attacks: [{ name: 'Blade', damage: 'd6' }],
      special: '',
      notes: '',
    });

    expect(getBestiary()).toHaveLength(1);
    expect(getBestiary()[0]?.name).toBe('Ratling');
  });

  it('updates an entry', () => {
    addBestiaryEntry({
      name: 'Ratling',
      category: 'Vermin',
      hd: 2,
      hp: 4,
      armor: 1,
      attacks: [],
      special: '',
      notes: '',
    });
    const id = getBestiary()[0]!.id;

    updateBestiaryEntry(id, { hp: 6 });

    expect(getBestiary()[0]?.hp).toBe(6);
  });

  it('removes an entry', () => {
    addBestiaryEntry({
      name: 'Ratling',
      category: 'Vermin',
      hd: 2,
      hp: 4,
      armor: 1,
      attacks: [],
      special: '',
      notes: '',
    });
    const id = getBestiary()[0]!.id;

    removeBestiaryEntry(id);

    expect(getBestiary()).toHaveLength(0);
  });
});
