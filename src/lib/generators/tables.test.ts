import { describe, expect, it } from 'vitest';
import { ENCOUNTER_TABLE, ITEM_TABLE, NPC_NAMES, NPC_ROLES, NPC_QUIRKS, NPC_WANTS, generateFrom, generateNpc } from './tables';

describe('generator tables', () => {
  it('generateFrom returns an entry that belongs to the given table', () => {
    const result = generateFrom(ENCOUNTER_TABLE);
    expect(ENCOUNTER_TABLE).toContain(result);
  });

  it('generateFrom works for the item table too', () => {
    const result = generateFrom(ITEM_TABLE);
    expect(ITEM_TABLE).toContain(result);
  });

  it('generateNpc returns one value from each category', () => {
    const npc = generateNpc();

    expect(NPC_NAMES).toContain(npc.name);
    expect(NPC_ROLES).toContain(npc.role);
    expect(NPC_QUIRKS).toContain(npc.quirk);
    expect(NPC_WANTS).toContain(npc.want);
  });
});
