import { describe, expect, it, beforeEach } from 'vitest';
import {
  getFactions,
  addFaction,
  updateFaction,
  removeFaction,
  replaceFactions,
  bumpFactionClock,
} from './factions.svelte';
import { getFactionEdges, addFactionEdge, replaceFactionEdges } from './factionEdges.svelte';
import { getBeats, addBeat, replaceBeats } from './beats.svelte';
import { getHexNodes, addHexNode, replaceHexNodes } from './hexmap.svelte';
import { getCampaignHistory, replaceCampaignHistory } from './campaignHistory.svelte';

function seedOne(name = 'The Court') {
  addFaction({ name, disposition: 'hostile', clock: 3, of: 6, note: '', tags: ['Hostile'] });
  return getFactions()[0]!.id;
}

describe('factions store', () => {
  beforeEach(() => {
    replaceFactions([]);
    replaceFactionEdges([]);
    replaceCampaignHistory([]);
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

  describe('bumpFactionClock', () => {
    it('increments the clock', () => {
      const id = seedOne();
      bumpFactionClock(id, 1);
      expect(getFactions()[0]?.clock).toBe(4);
    });

    it('decrements the clock', () => {
      const id = seedOne();
      bumpFactionClock(id, -2);
      expect(getFactions()[0]?.clock).toBe(1);
    });

    it('clamps at the "of" ceiling', () => {
      const id = seedOne();
      bumpFactionClock(id, 10);
      expect(getFactions()[0]?.clock).toBe(6);
    });

    it('clamps at 0', () => {
      const id = seedOne();
      bumpFactionClock(id, -10);
      expect(getFactions()[0]?.clock).toBe(0);
    });

    it('does nothing for an unknown id', () => {
      seedOne();
      bumpFactionClock('missing', 1);
      expect(getFactions()[0]?.clock).toBe(3);
    });

    it('logs a campaign history entry when the clock actually changes', () => {
      const id = seedOne('The Court');
      bumpFactionClock(id, 1);

      expect(getCampaignHistory()).toHaveLength(1);
      expect(getCampaignHistory()[0]).toMatchObject({
        type: 'clockChanged',
        factionId: id,
        factionName: 'The Court',
        from: 3,
        to: 4,
        max: 6,
      });
    });

    it('does not log a history entry when clamping leaves the clock unchanged', () => {
      const id = seedOne('The Court');
      bumpFactionClock(id, 10);
      expect(getCampaignHistory()).toHaveLength(1);

      bumpFactionClock(id, 10);
      expect(getCampaignHistory()).toHaveLength(1);
    });
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

  it('cascades to beats referencing a removed faction', () => {
    replaceBeats([]);
    const a = seedOne('A');
    addBeat({ parentId: null, title: 'Raid', notes: '', status: 'planned', factionIds: [a, 'other'], adventureId: 'adv-1' });

    removeFaction(a);

    expect(getBeats()[0]?.factionIds).toEqual(['other']);
  });

  it('cascades to hex territory when a faction is removed', () => {
    replaceHexNodes([]);
    const a = seedOne('A');
    addHexNode({
      q: 0,
      r: 0,
      terrain: 'meadow',
      name: 'Home',
      notes: '',
      discovered: false,
      encounters: [],
      controlledBy: a,
      contestedBy: [a, 'other'],
    });

    removeFaction(a);

    expect(getHexNodes()[0]?.controlledBy).toBeNull();
    expect(getHexNodes()[0]?.contestedBy).toEqual(['other']);
  });
});
