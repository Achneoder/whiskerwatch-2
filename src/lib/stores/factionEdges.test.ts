import { describe, expect, it, beforeEach } from 'vitest';
import {
  getFactionEdges,
  addFactionEdge,
  updateFactionEdge,
  removeFactionEdge,
  removeEdgesForFaction,
  replaceFactionEdges,
} from './factionEdges.svelte';

describe('factionEdges store', () => {
  beforeEach(() => {
    replaceFactionEdges([]);
  });

  it('adds and updates an edge', () => {
    addFactionEdge({ sourceId: 'a', targetId: 'b', type: 'ally' });
    const id = getFactionEdges()[0]!.id;

    updateFactionEdge(id, { type: 'enemy' });

    expect(getFactionEdges()[0]?.type).toBe('enemy');
  });

  it('removes an edge by id', () => {
    addFactionEdge({ sourceId: 'a', targetId: 'b', type: 'ally' });
    const id = getFactionEdges()[0]!.id;

    removeFactionEdge(id);

    expect(getFactionEdges()).toHaveLength(0);
  });

  it('removes edges touching a faction on either end, leaving others', () => {
    addFactionEdge({ sourceId: 'a', targetId: 'b', type: 'ally' }); // a as source
    addFactionEdge({ sourceId: 'c', targetId: 'a', type: 'enemy' }); // a as target
    addFactionEdge({ sourceId: 'b', targetId: 'c', type: 'rival' }); // unrelated to a

    removeEdgesForFaction('a');

    const remaining = getFactionEdges();
    expect(remaining).toHaveLength(1);
    expect(remaining[0]).toMatchObject({ sourceId: 'b', targetId: 'c', type: 'rival' });
  });
});
