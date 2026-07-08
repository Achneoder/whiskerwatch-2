import { describe, expect, it, beforeEach } from 'vitest';
import {
  getHexNodes,
  getHexNodeAt,
  addHexNode,
  updateHexNode,
  removeHexNode,
  replaceHexNodes,
  removeBestiaryEntryFromHexNodes,
  removeFactionFromHexNodes,
} from './hexmap.svelte';
import { getBeats, addBeat, replaceBeats } from './beats.svelte';
import { addBestiaryEntry, getBestiary, removeBestiaryEntry, replaceBestiary } from './bestiary.svelte';
import { idbReplaceAll, idbGetAll } from '../idb';

function seedOne() {
  addHexNode({
    q: 0,
    r: 0,
    terrain: 'meadow',
    name: 'Home',
    notes: '',
    discovered: false,
    encounters: [],
    controlledBy: null,
    contestedBy: [],
  });
  return getHexNodes()[0]!.id;
}

describe('hexmap store', () => {
  beforeEach(() => {
    replaceHexNodes([]);
  });

  it('adds a hex node', () => {
    seedOne();
    expect(getHexNodes()).toHaveLength(1);
    expect(getHexNodes()[0]?.name).toBe('Home');
  });

  it('updates a hex node', () => {
    const id = seedOne();
    updateHexNode(id, { discovered: true, terrain: 'ruins' });
    expect(getHexNodes()[0]?.discovered).toBe(true);
    expect(getHexNodes()[0]?.terrain).toBe('ruins');
  });

  it('removes a hex node', () => {
    const id = seedOne();
    removeHexNode(id);
    expect(getHexNodes()).toHaveLength(0);
  });

  it('finds a node by coordinate and returns undefined elsewhere', () => {
    addHexNode({
      q: 2,
      r: -1,
      terrain: 'hills',
      name: 'Ridge',
      notes: '',
      discovered: false,
      encounters: [],
      controlledBy: null,
      contestedBy: [],
    });
    expect(getHexNodeAt(2, -1)?.name).toBe('Ridge');
    expect(getHexNodeAt(0, 0)).toBeUndefined();
  });

  it('cascades to beats referencing a removed hex node', () => {
    replaceBeats([]);
    const id = seedOne();
    addBeat({ parentId: null, title: 'Raid', notes: '', status: 'planned', hexNodeId: id, adventureId: 'adv-1' });

    removeHexNode(id);

    expect(getBeats()[0]?.hexNodeId).toBeNull();
  });

  it('cascades to hex encounters when a bestiary entry is removed', () => {
    replaceBestiary([]);
    const id = seedOne();
    addBestiaryEntry({ name: 'Ratling', category: 'Vermin', hd: 1, hp: 2, armor: 0, attacks: [], special: '', notes: '' });
    const bestiaryId = getBestiary()[0]!.id;
    updateHexNode(id, { encounters: [{ bestiaryId, weight: 2 }] });

    removeBestiaryEntry(bestiaryId);

    expect(getHexNodes()[0]?.encounters).toEqual([]);
  });

  it('removeBestiaryEntryFromHexNodes strips a dangling id directly', () => {
    const id = seedOne();
    updateHexNode(id, { encounters: [{ bestiaryId: 'ghost', weight: 1 }] });

    removeBestiaryEntryFromHexNodes('ghost');

    expect(getHexNodes()[0]?.encounters).toEqual([]);
  });

  it('sets and clears controlledBy/contestedBy via update', () => {
    const id = seedOne();
    updateHexNode(id, { controlledBy: 'fac-1', contestedBy: ['fac-1', 'fac-2'] });

    expect(getHexNodes()[0]?.controlledBy).toBe('fac-1');
    expect(getHexNodes()[0]?.contestedBy).toEqual(['fac-1', 'fac-2']);

    updateHexNode(id, { controlledBy: null, contestedBy: [] });

    expect(getHexNodes()[0]?.controlledBy).toBeNull();
    expect(getHexNodes()[0]?.contestedBy).toEqual([]);
  });

  it('removeFactionFromHexNodes clears controlledBy and strips contestedBy directly', () => {
    const id = seedOne();
    updateHexNode(id, { controlledBy: 'fac-1', contestedBy: ['fac-1', 'fac-2'] });

    removeFactionFromHexNodes('fac-1');

    expect(getHexNodes()[0]?.controlledBy).toBeNull();
    expect(getHexNodes()[0]?.contestedBy).toEqual(['fac-2']);
  });

  it('backfills legacy records missing `encounters` when the store first loads', async () => {
    // Written straight into IndexedDB (not localStorage): the top-of-file
    // import already ran this store's one-time localStorage migration, so
    // by now IndexedDB — not localStorage — is the store's source of truth
    // for a "fresh module load sees this shape" scenario.
    await idbReplaceAll('whiskerwatch:hexmap', [
      { id: 'legacy', q: 0, r: 0, terrain: 'meadow', name: 'Old', notes: '', discovered: false },
    ]);

    const modulePath = './hexmap.svelte?backfill-test';
    const fresh: typeof import('./hexmap.svelte') = await import(/* @vite-ignore */ modulePath);
    await fresh.ready;

    expect(fresh.getHexNodes()[0]?.encounters).toEqual([]);
    const stored = await idbGetAll<{ id: string; encounters: unknown[] }>('whiskerwatch:hexmap');
    expect(stored[0]?.encounters).toEqual([]);
  });

  it('backfills legacy records missing `controlledBy`/`contestedBy` when the store first loads', async () => {
    await idbReplaceAll('whiskerwatch:hexmap', [
      { id: 'legacy', q: 0, r: 0, terrain: 'meadow', name: 'Old', notes: '', discovered: false, encounters: [] },
    ]);

    const modulePath = './hexmap.svelte?territory-backfill-test';
    const fresh: typeof import('./hexmap.svelte') = await import(/* @vite-ignore */ modulePath);
    await fresh.ready;

    expect(fresh.getHexNodes()[0]?.controlledBy).toBeNull();
    expect(fresh.getHexNodes()[0]?.contestedBy).toEqual([]);
    const stored = await idbGetAll<{ id: string; controlledBy: unknown; contestedBy: unknown[] }>('whiskerwatch:hexmap');
    expect(stored[0]?.controlledBy).toBeNull();
    expect(stored[0]?.contestedBy).toEqual([]);
  });
});
