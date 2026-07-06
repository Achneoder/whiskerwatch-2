import { describe, expect, it, beforeEach } from 'vitest';
import { getBeats, addBeat, updateBeat, removeBeat, getDescendantCount, replaceBeats } from './beats.svelte';

describe('beats store', () => {
  beforeEach(() => {
    replaceBeats([]);
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
});
