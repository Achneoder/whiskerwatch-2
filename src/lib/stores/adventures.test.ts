import { describe, expect, it, beforeEach } from 'vitest';
import { getAdventures, addAdventure, updateAdventure, removeAdventure, replaceAdventures } from './adventures.svelte';

describe('adventures store', () => {
  beforeEach(() => {
    replaceAdventures([]);
  });

  it('adds an adventure', () => {
    addAdventure({ title: 'The granary raid', description: 'Tunnels under the granary.', status: 'active' });

    expect(getAdventures()).toHaveLength(1);
    expect(getAdventures()[0]?.title).toBe('The granary raid');
    expect(getAdventures()[0]?.status).toBe('active');
  });

  it('updates an adventure', () => {
    addAdventure({ title: 'The granary raid', description: '', status: 'planned' });
    const id = getAdventures()[0]!.id;

    updateAdventure(id, { status: 'completed', title: 'The granary raid (resolved)' });

    expect(getAdventures()[0]?.status).toBe('completed');
    expect(getAdventures()[0]?.title).toBe('The granary raid (resolved)');
  });

  it('removes an adventure', () => {
    addAdventure({ title: 'The granary raid', description: '', status: 'planned' });
    const id = getAdventures()[0]!.id;

    removeAdventure(id);

    expect(getAdventures()).toHaveLength(0);
  });

  it('replaces the whole list', () => {
    addAdventure({ title: 'A', description: '', status: 'planned' });
    addAdventure({ title: 'B', description: '', status: 'planned' });

    replaceAdventures([{ id: 'x', title: 'Replacement', description: '', status: 'active' }]);

    expect(getAdventures()).toHaveLength(1);
    expect(getAdventures()[0]?.title).toBe('Replacement');
  });
});
