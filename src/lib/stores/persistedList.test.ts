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
});
