import { describe, expect, it, beforeEach } from 'vitest';
import { createPersistedList } from './persistedList.svelte';
import { idbGetAll, idbReplaceAll } from '../idb';

interface Thing {
  id: string;
  label: string;
}

describe('createPersistedList', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('seeds from the provided default when nothing is persisted', async () => {
    const list = createPersistedList<Thing>('test:things', [{ id: '1', label: 'seed' }]);
    await list.ready;

    expect(list.items).toEqual([{ id: '1', label: 'seed' }]);
  });

  it('adds items and persists them', async () => {
    const list = createPersistedList<Thing>('test:add', []);
    await list.ready;

    list.add({ id: '1', label: 'a' });
    await list.flush();

    expect(list.items).toEqual([{ id: '1', label: 'a' }]);
    expect(await idbGetAll<Thing>('test:add')).toEqual([{ id: '1', label: 'a' }]);
  });

  it('updates an item by id', async () => {
    const list = createPersistedList<Thing>('test:update', [{ id: '1', label: 'a' }]);
    await list.ready;

    list.update('1', { label: 'b' });
    await list.flush();

    expect(list.items[0]?.label).toBe('b');
    expect(await idbGetAll<Thing>('test:update')).toEqual([{ id: '1', label: 'b' }]);
  });

  it('ignores updates to a missing id', async () => {
    const list = createPersistedList<Thing>('test:update-missing', [{ id: '1', label: 'a' }]);
    await list.ready;

    list.update('missing', { label: 'b' });

    expect(list.items).toEqual([{ id: '1', label: 'a' }]);
  });

  it('removes an item by id', async () => {
    const list = createPersistedList<Thing>('test:remove', [
      { id: '1', label: 'a' },
      { id: '2', label: 'b' },
    ]);
    await list.ready;

    list.remove('1');
    await list.flush();

    expect(list.items).toEqual([{ id: '2', label: 'b' }]);
    expect(await idbGetAll<Thing>('test:remove')).toEqual([{ id: '2', label: 'b' }]);
  });

  it('replaces the whole list', async () => {
    const list = createPersistedList<Thing>('test:replace', [{ id: '1', label: 'a' }]);
    await list.ready;

    list.replaceAll([
      { id: '2', label: 'b' },
      { id: '3', label: 'c' },
    ]);
    await list.flush();

    expect(list.items).toEqual([
      { id: '2', label: 'b' },
      { id: '3', label: 'c' },
    ]);
    expect(await idbGetAll<Thing>('test:replace')).toEqual([
      { id: '2', label: 'b' },
      { id: '3', label: 'c' },
    ]);
  });

  it('assigns fresh ids to records persisted by a pre-id schema instead of crashing', async () => {
    localStorage.setItem('test:legacy', JSON.stringify([{ label: 'a' }, { label: 'b' }]));

    const list = createPersistedList<Thing>('test:legacy', []);
    await list.ready;

    expect(list.items).toHaveLength(2);
    expect(list.items[0]!.id).toBeTruthy();
    expect(list.items[1]!.id).toBeTruthy();
    expect(list.items[0]!.id).not.toBe(list.items[1]!.id);
  });

  it('de-duplicates records that share the same id', async () => {
    localStorage.setItem(
      'test:dupes',
      JSON.stringify([
        { id: 'x', label: 'a' },
        { id: 'x', label: 'b' },
      ]),
    );

    const list = createPersistedList<Thing>('test:dupes', []);
    await list.ready;

    expect(list.items[0]!.id).not.toBe(list.items[1]!.id);
  });

  it('falls back to the seed when the persisted value is not an array', async () => {
    localStorage.setItem('test:malformed', JSON.stringify({ oops: true }));

    const list = createPersistedList<Thing>('test:malformed', [{ id: '1', label: 'seed' }]);
    await list.ready;

    expect(list.items).toEqual([{ id: '1', label: 'seed' }]);
  });

  it('persists the repaired shape so it does not need repairing again', async () => {
    localStorage.setItem('test:persist-fix', JSON.stringify([{ label: 'a' }]));
    const list = createPersistedList<Thing>('test:persist-fix', []);
    await list.ready;

    const stored = await idbGetAll<Thing>('test:persist-fix');
    expect(stored[0]?.id).toBeTruthy();
    // The legacy localStorage key is retired once migrated into IndexedDB.
    expect(localStorage.getItem('test:persist-fix')).toBeNull();
  });

  it('migrates a legacy localStorage key into IndexedDB exactly once, and stays IndexedDB-backed after', async () => {
    localStorage.setItem('test:migrate', JSON.stringify([{ id: '1', label: 'from-localstorage' }]));

    const first = createPersistedList<Thing>('test:migrate', []);
    await first.ready;
    expect(first.items).toEqual([{ id: '1', label: 'from-localstorage' }]);
    expect(localStorage.getItem('test:migrate')).toBeNull();

    // Simulate a later mutation happening entirely at the IndexedDB layer
    // (e.g. a different tab/session), then re-hydrate from scratch.
    await idbReplaceAll('test:migrate', [{ id: '1', label: 'from-indexeddb' }]);

    const second = createPersistedList<Thing>('test:migrate', [{ id: 'seed', label: 'unused' }]);
    await second.ready;

    // A second "boot" must read whatever IndexedDB actually holds, not
    // re-run the (now-gone) localStorage migration or fall back to the seed.
    expect(second.items).toEqual([{ id: '1', label: 'from-indexeddb' }]);
  });
});
