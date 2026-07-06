import { describe, expect, it, beforeEach } from 'vitest';
import { getFactions, addFaction, updateFaction, removeFaction, replaceFactions } from './factions.svelte';
import { getFactionEdges, addFactionEdge, replaceFactionEdges } from './factionEdges.svelte';

function seedOne(name = 'The Court') {
  addFaction({ name, disposition: 'hostile', clock: 3, of: 6, note: '', tags: ['Hostile'] });
  return getFactions()[0]!.id;
}

describe('factions store', () => {
  beforeEach(() => {
    replaceFactions([]);
    replaceFactionEdges([]);
  });

  it('adds a faction', () => {
    seedOne('The Court');
    expect(getFactions()).toHaveLength(1);
    expect(getFactions()[0]?.name).toBe('The Court');
  });

  it('updates a faction', () => {
    const id = seedOne();
    updateFaction(id, { clock: 5, disposition: 'ally' });
    expect(getFactions()[0]?.clock).toBe(5);
    expect(getFactions()[0]?.disposition).toBe('ally');
  });

  it('removes a faction', () => {
    const id = seedOne();
    removeFaction(id);
    expect(getFactions()).toHaveLength(0);
  });

  it('cascades to relationships when a faction is removed', () => {
    const a = seedOne('A');
    addFaction({ name: 'B', disposition: 'ally', clock: 0, of: 6, note: '', tags: [] });
    const b = getFactions().find((f) => f.name === 'B')!.id;

    addFactionEdge({ sourceId: a, targetId: b, type: 'enemy' });
    expect(getFactionEdges()).toHaveLength(1);

    removeFaction(a);

    expect(getFactionEdges()).toHaveLength(0);
  });
});
