import { describe, expect, it, beforeEach } from 'vitest';
import {
  getBeats,
  addBeat,
  updateBeat,
  removeBeat,
  getDescendantCount,
  replaceBeats,
  clearHexNodeFromBeats,
  removeFactionFromBeats,
  migrateLegacyBeatsToAdventures,
  type Beat,
} from './beats.svelte';
import { getCampaignHistory, replaceCampaignHistory } from './campaignHistory.svelte';

describe('beats store', () => {
  beforeEach(() => {
    replaceBeats([]);
    replaceCampaignHistory([]);
  });

  it('adds a root beat', () => {
    addBeat({ parentId: null, title: 'Find the tunnel', notes: '', status: 'planned', adventureId: 'adv-1' });

    expect(getBeats()).toHaveLength(1);
    expect(getBeats()[0]?.title).toBe('Find the tunnel');
  });

  it('updates a beat', () => {
    addBeat({ parentId: null, title: 'Find the tunnel', notes: '', status: 'planned', adventureId: 'adv-1' });
    const id = getBeats()[0]!.id;

    updateBeat(id, { status: 'active' });

    expect(getBeats()[0]?.status).toBe('active');
  });

  it('counts descendants of a beat', () => {
    addBeat({ parentId: null, title: 'Root', notes: '', status: 'planned', adventureId: 'adv-1' });
    const rootId = getBeats()[0]!.id;
    addBeat({ parentId: rootId, title: 'Child A', notes: '', status: 'planned', adventureId: 'adv-1' });
    addBeat({ parentId: rootId, title: 'Child B', notes: '', status: 'planned', adventureId: 'adv-1' });
    const childAId = getBeats().find((b) => b.title === 'Child A')!.id;
    addBeat({ parentId: childAId, title: 'Grandchild', notes: '', status: 'planned', adventureId: 'adv-1' });

    expect(getDescendantCount(rootId)).toBe(3);
  });

  it('removes a beat and its whole subtree', () => {
    addBeat({ parentId: null, title: 'Root', notes: '', status: 'planned', adventureId: 'adv-1' });
    const rootId = getBeats()[0]!.id;
    addBeat({ parentId: rootId, title: 'Child', notes: '', status: 'planned', adventureId: 'adv-1' });
    addBeat({ parentId: null, title: 'Unrelated', notes: '', status: 'planned', adventureId: 'adv-1' });

    removeBeat(rootId);

    expect(getBeats()).toHaveLength(1);
    expect(getBeats()[0]?.title).toBe('Unrelated');
  });

  it('defaults hexNodeId and factionIds when omitted', () => {
    addBeat({ parentId: null, title: 'Find the tunnel', notes: '', status: 'planned', adventureId: 'adv-1' });

    expect(getBeats()[0]?.hexNodeId).toBeNull();
    expect(getBeats()[0]?.factionIds).toEqual([]);
  });

  it('accepts an explicit hexNodeId and factionIds', () => {
    addBeat({
      parentId: null,
      title: 'Raid',
      notes: '',
      status: 'planned',
      hexNodeId: 'hex-1',
      factionIds: ['fac-1'],
      adventureId: 'adv-1',
    });

    expect(getBeats()[0]?.hexNodeId).toBe('hex-1');
    expect(getBeats()[0]?.factionIds).toEqual(['fac-1']);
  });

  it('clears hexNodeId from beats referencing a removed hex', () => {
    addBeat({ parentId: null, title: 'Raid', notes: '', status: 'planned', hexNodeId: 'hex-1', adventureId: 'adv-1' });
    addBeat({ parentId: null, title: 'Elsewhere', notes: '', status: 'planned', hexNodeId: 'hex-2', adventureId: 'adv-1' });

    clearHexNodeFromBeats('hex-1');

    expect(getBeats().find((b) => b.title === 'Raid')?.hexNodeId).toBeNull();
    expect(getBeats().find((b) => b.title === 'Elsewhere')?.hexNodeId).toBe('hex-2');
  });

  it('removes a faction id from every beat that referenced it', () => {
    addBeat({ parentId: null, title: 'Raid', notes: '', status: 'planned', factionIds: ['fac-1', 'fac-2'], adventureId: 'adv-1' });
    addBeat({ parentId: null, title: 'Unrelated', notes: '', status: 'planned', factionIds: ['fac-2'], adventureId: 'adv-1' });

    removeFactionFromBeats('fac-1');

    expect(getBeats().find((b) => b.title === 'Raid')?.factionIds).toEqual(['fac-2']);
    expect(getBeats().find((b) => b.title === 'Unrelated')?.factionIds).toEqual(['fac-2']);
  });

  it('logs a campaign history entry when a beat transitions to done', () => {
    addBeat({
      parentId: null,
      title: 'Raid',
      notes: '',
      status: 'active',
      hexNodeId: 'hex-1',
      factionIds: ['fac-1'],
      adventureId: 'adv-1',
    });
    const id = getBeats()[0]!.id;

    updateBeat(id, { status: 'done' });

    expect(getCampaignHistory()).toHaveLength(1);
    expect(getCampaignHistory()[0]).toMatchObject({
      type: 'beatCompleted',
      beatId: id,
      title: 'Raid',
      hexNodeId: 'hex-1',
      factionIds: ['fac-1'],
    });
  });

  it('does not log again when a beat is already done', () => {
    addBeat({ parentId: null, title: 'Raid', notes: '', status: 'done', adventureId: 'adv-1' });
    const id = getBeats()[0]!.id;

    updateBeat(id, { status: 'done' });

    expect(getCampaignHistory()).toHaveLength(0);
  });

  it('does not log when a beat status change is not to done', () => {
    addBeat({ parentId: null, title: 'Raid', notes: '', status: 'planned', adventureId: 'adv-1' });
    const id = getBeats()[0]!.id;

    updateBeat(id, { status: 'active' });

    expect(getCampaignHistory()).toHaveLength(0);
  });

  describe('migrateLegacyBeatsToAdventures', () => {
    function legacyRoot(overrides: Partial<Beat> = {}): Beat {
      return {
        id: 'root',
        parentId: null,
        title: 'The granary raid',
        notes: 'Tunnels under the granary.',
        status: 'active',
        hexNodeId: null,
        factionIds: [],
        adventureId: '',
        ...overrides,
      };
    }

    it('promotes a legacy root beat with children into an Adventure, reparenting its children to root', () => {
      const child: Beat = {
        id: 'child',
        parentId: 'root',
        title: 'Find the tunnel entrance',
        notes: '',
        status: 'planned',
        hexNodeId: null,
        factionIds: [],
        adventureId: '',
      };
      const grandchild: Beat = {
        id: 'grandchild',
        parentId: 'child',
        title: 'Follow it to the granary',
        notes: '',
        status: 'planned',
        hexNodeId: null,
        factionIds: [],
        adventureId: '',
      };

      const { beats, adventures } = migrateLegacyBeatsToAdventures([legacyRoot(), child, grandchild]);

      expect(adventures).toHaveLength(1);
      expect(adventures[0]).toMatchObject({
        title: 'The granary raid',
        description: 'Tunnels under the granary.',
        status: 'active',
      });
      const adventureId = adventures[0]!.id;

      // The root beat itself is gone — its data now lives in the Adventure.
      expect(beats.find((b) => b.id === 'root')).toBeUndefined();
      expect(beats).toHaveLength(2);

      const migratedChild = beats.find((b) => b.id === 'child')!;
      expect(migratedChild.parentId).toBeNull();
      expect(migratedChild.adventureId).toBe(adventureId);

      const migratedGrandchild = beats.find((b) => b.id === 'grandchild')!;
      expect(migratedGrandchild.parentId).toBe('child');
      expect(migratedGrandchild.adventureId).toBe(adventureId);
    });

    it('replaces a childless legacy root beat with an Adventure and no beats under it', () => {
      const { beats, adventures } = migrateLegacyBeatsToAdventures([legacyRoot()]);

      expect(adventures).toHaveLength(1);
      expect(beats).toHaveLength(0);
    });

    it('leaves an already-migrated beat untouched', () => {
      const migrated: Beat = {
        id: 'already',
        parentId: null,
        title: 'Already migrated',
        notes: '',
        status: 'planned',
        hexNodeId: null,
        factionIds: [],
        adventureId: 'adv-existing',
      };

      const { beats, adventures } = migrateLegacyBeatsToAdventures([migrated]);

      expect(adventures).toHaveLength(0);
      expect(beats).toEqual([migrated]);
    });

    it('is a no-op when there is nothing to migrate', () => {
      const result = migrateLegacyBeatsToAdventures([]);
      expect(result.beats).toEqual([]);
      expect(result.adventures).toEqual([]);
    });
  });
});
