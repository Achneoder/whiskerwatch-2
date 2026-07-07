import { describe, expect, it, beforeEach } from 'vitest';
import {
  getHexNodes,
  getHexNodeAt,
  addHexNode,
  updateHexNode,
  removeHexNode,
  replaceHexNodes,
} from './hexmap.svelte';
import { getBeats, addBeat, replaceBeats } from './beats.svelte';

function seedOne() {
  addHexNode({ q: 0, r: 0, terrain: 'meadow', name: 'Home', notes: '', discovered: false });
  return getHexNodes()[0]!.id;
}

describe('hexmap store', () => {
  beforeEach(() => {
    replaceHexNodes([]);
  });

  it('adds a hex node', () => {
    seedOne();
    expect(getHexNodes()).toHaveLength(1);
    expect(getHexNodes()[0]?.name).toBe('Home');
  });

  it('updates a hex node', () => {
    const id = seedOne();
    updateHexNode(id, { discovered: true, terrain: 'ruins' });
    expect(getHexNodes()[0]?.discovered).toBe(true);
    expect(getHexNodes()[0]?.terrain).toBe('ruins');
  });

  it('removes a hex node', () => {
    const id = seedOne();
    removeHexNode(id);
    expect(getHexNodes()).toHaveLength(0);
  });

  it('finds a node by coordinate and returns undefined elsewhere', () => {
    addHexNode({ q: 2, r: -1, terrain: 'hills', name: 'Ridge', notes: '', discovered: false });
    expect(getHexNodeAt(2, -1)?.name).toBe('Ridge');
    expect(getHexNodeAt(0, 0)).toBeUndefined();
  });

  it('cascades to beats referencing a removed hex node', () => {
    replaceBeats([]);
    const id = seedOne();
    addBeat({ parentId: null, title: 'Raid', notes: '', status: 'planned', hexNodeId: id });

    removeHexNode(id);

    expect(getBeats()[0]?.hexNodeId).toBeNull();
  });
});
