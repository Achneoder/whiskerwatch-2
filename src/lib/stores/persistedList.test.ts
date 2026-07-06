import { describe, expect, it, beforeEach } from 'vitest';
import { createPersistedList } from './persistedList.svelte';

interface Thing {
  id: string;
  label: string;
}

describe('createPersistedList', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('seeds from the provided default when nothing is persisted', () => {
    const list = createPersistedList<Thing>('test:things', [{ id: '1', label: 'seed' }]);
    expect(list.items).toEqual([{ id: '1', label: 'seed' }]);
  });

  it('adds items and persists them', () => {
    const list = createPersistedList<Thing>('test:add', []);
    list.add({ id: '1', label: 'a' });

    expect(list.items).toEqual([{ id: '1', label: 'a' }]);
    expect(JSON.parse(localStorage.getItem('test:add')!)).toEqual([{ id: '1', label: 'a' }]);
  });

  it('updates an item by id', () => {
    const list = createPersistedList<Thing>('test:update', [{ id: '1', label: 'a' }]);
    list.update('1', { label: 'b' });

    expect(list.items[0]?.label).toBe('b');
  });

  it('ignores updates to a missing id', () => {
    const list = createPersistedList<Thing>('test:update-missing', [{ id: '1', label: 'a' }]);
    list.update('missing', { label: 'b' });

    expect(list.items).toEqual([{ id: '1', label: 'a' }]);
  });

  it('removes an item by id', () => {
    const list = createPersistedList<Thing>('test:remove', [
      { id: '1', label: 'a' },
      { id: '2', label: 'b' },
    ]);
    list.remove('1');

    expect(list.items).toEqual([{ id: '2', label: 'b' }]);
  });

  it('replaces the whole list', () => {
    const list = createPersistedList<Thing>('test:replace', [{ id: '1', label: 'a' }]);
    list.replaceAll([
      { id: '2', label: 'b' },
      { id: '3', label: 'c' },
    ]);

    expect(list.items).toEqual([
      { id: '2', label: 'b' },
      { id: '3', label: 'c' },
    ]);
  });

  it('assigns fresh ids to records persisted by a pre-id schema instead of crashing', () => {
    localStorage.setItem('test:legacy', JSON.stringify([{ label: 'a' }, { label: 'b' }]));

    const list = createPersistedList<Thing>('test:legacy', []);

    expect(list.items).toHaveLength(2);
    expect(list.items[0]!.id).toBeTruthy();
    expect(list.items[1]!.id).toBeTruthy();
    expect(list.items[0]!.id).not.toBe(list.items[1]!.id);
  });

  it('de-duplicates records that share the same id', () => {
    localStorage.setItem(
      'test:dupes',
      JSON.stringify([
        { id: 'x', label: 'a' },
        { id: 'x', label: 'b' },
      ]),
    );

    const list = createPersistedList<Thing>('test:dupes', []);

    expect(list.items[0]!.id).not.toBe(list.items[1]!.id);
  });

  it('falls back to the seed when the persisted value is not an array', () => {
    localStorage.setItem('test:malformed', JSON.stringify({ oops: true }));

    const list = createPersistedList<Thing>('test:malformed', [{ id: '1', label: 'seed' }]);

    expect(list.items).toEqual([{ id: '1', label: 'seed' }]);
  });

  it('persists the repaired shape so it does not need repairing again', () => {
    localStorage.setItem('test:persist-fix', JSON.stringify([{ label: 'a' }]));
    createPersistedList<Thing>('test:persist-fix', []);

    const stored = JSON.parse(localStorage.getItem('test:persist-fix')!);
    expect(stored[0].id).toBeTruthy();
  });
});
