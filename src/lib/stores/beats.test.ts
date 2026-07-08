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
} from './beats.svelte';
import { getCampaignHistory, replaceCampaignHistory } from './campaignHistory.svelte';

describe('beats store', () => {
  beforeEach(() => {
    replaceBeats([]);
    replaceCampaignHistory([]);
  });

  it('adds a root beat', () => {
    addBeat({ parentId: null, title: 'Find the tunnel', notes: '', status: 'planned' });

    expect(getBeats()).toHaveLength(1);
    expect(getBeats()[0]?.title).toBe('Find the tunnel');
  });

  it('updates a beat', () => {
    addBeat({ parentId: null, title: 'Find the tunnel', notes: '', status: 'planned' });
    const id = getBeats()[0]!.id;

    updateBeat(id, { status: 'active' });

    expect(getBeats()[0]?.status).toBe('active');
  });

  it('counts descendants of a beat', () => {
    addBeat({ parentId: null, title: 'Root', notes: '', status: 'planned' });
    const rootId = getBeats()[0]!.id;
    addBeat({ parentId: rootId, title: 'Child A', notes: '', status: 'planned' });
    addBeat({ parentId: rootId, title: 'Child B', notes: '', status: 'planned' });
    const childAId = getBeats().find((b) => b.title === 'Child A')!.id;
    addBeat({ parentId: childAId, title: 'Grandchild', notes: '', status: 'planned' });

    expect(getDescendantCount(rootId)).toBe(3);
  });

  it('removes a beat and its whole subtree', () => {
    addBeat({ parentId: null, title: 'Root', notes: '', status: 'planned' });
    const rootId = getBeats()[0]!.id;
    addBeat({ parentId: rootId, title: 'Child', notes: '', status: 'planned' });
    addBeat({ parentId: null, title: 'Unrelated', notes: '', status: 'planned' });

    removeBeat(rootId);

    expect(getBeats()).toHaveLength(1);
    expect(getBeats()[0]?.title).toBe('Unrelated');
  });

  it('defaults hexNodeId and factionIds when omitted', () => {
    addBeat({ parentId: null, title: 'Find the tunnel', notes: '', status: 'planned' });

    expect(getBeats()[0]?.hexNodeId).toBeNull();
    expect(getBeats()[0]?.factionIds).toEqual([]);
  });

  it('accepts an explicit hexNodeId and factionIds', () => {
    addBeat({ parentId: null, title: 'Raid', notes: '', status: 'planned', hexNodeId: 'hex-1', factionIds: ['fac-1'] });

    expect(getBeats()[0]?.hexNodeId).toBe('hex-1');
    expect(getBeats()[0]?.factionIds).toEqual(['fac-1']);
  });

  it('clears hexNodeId from beats referencing a removed hex', () => {
    addBeat({ parentId: null, title: 'Raid', notes: '', status: 'planned', hexNodeId: 'hex-1' });
    addBeat({ parentId: null, title: 'Elsewhere', notes: '', status: 'planned', hexNodeId: 'hex-2' });

    clearHexNodeFromBeats('hex-1');

    expect(getBeats().find((b) => b.title === 'Raid')?.hexNodeId).toBeNull();
    expect(getBeats().find((b) => b.title === 'Elsewhere')?.hexNodeId).toBe('hex-2');
  });

  it('removes a faction id from every beat that referenced it', () => {
    addBeat({ parentId: null, title: 'Raid', notes: '', status: 'planned', factionIds: ['fac-1', 'fac-2'] });
    addBeat({ parentId: null, title: 'Unrelated', notes: '', status: 'planned', factionIds: ['fac-2'] });

    removeFactionFromBeats('fac-1');

    expect(getBeats().find((b) => b.title === 'Raid')?.factionIds).toEqual(['fac-2']);
    expect(getBeats().find((b) => b.title === 'Unrelated')?.factionIds).toEqual(['fac-2']);
  });

  it('logs a campaign history entry when a beat transitions to done', () => {
    addBeat({ parentId: null, title: 'Raid', notes: '', status: 'active', hexNodeId: 'hex-1', factionIds: ['fac-1'] });
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
    addBeat({ parentId: null, title: 'Raid', notes: '', status: 'done' });
    const id = getBeats()[0]!.id;

    updateBeat(id, { status: 'done' });

    expect(getCampaignHistory()).toHaveLength(0);
  });

  it('does not log when a beat status change is not to done', () => {
    addBeat({ parentId: null, title: 'Raid', notes: '', status: 'planned' });
    const id = getBeats()[0]!.id;

    updateBeat(id, { status: 'active' });

    expect(getCampaignHistory()).toHaveLength(0);
  });
});
