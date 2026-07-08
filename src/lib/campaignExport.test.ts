import { describe, expect, it, beforeEach } from 'vitest';
import { buildCampaignExport, parseCampaignExport, importCampaign } from './campaignExport';
import { getCampaignName, setCampaignName, DEFAULT_CAMPAIGN_NAME } from './stores/campaign.svelte';
import { getParty } from './stores/party.svelte';
import { getHirelings } from './stores/hirelings.svelte';
import { getBeats } from './stores/beats.svelte';
import { getSessions } from './stores/sessions.svelte';
import { getBestiary } from './stores/bestiary.svelte';
import { getFactions } from './stores/factions.svelte';
import { getFactionEdges } from './stores/factionEdges.svelte';
import { getHexNodes } from './stores/hexmap.svelte';

describe('campaignExport', () => {
  beforeEach(() => {
    localStorage.clear();
    setCampaignName(DEFAULT_CAMPAIGN_NAME);
  });

  it('builds an export containing the current party, hirelings, beats, sessions, bestiary, factions and hexes', () => {
    const data = buildCampaignExport();

    expect(data.version).toBe(1);
    expect(data.campaignName).toBe(DEFAULT_CAMPAIGN_NAME);
    expect(data.party).toEqual(getParty());
    expect(data.hirelings).toEqual(getHirelings());
    expect(data.beats).toEqual(getBeats());
    expect(data.sessions).toEqual(getSessions());
    expect(data.bestiary).toEqual(getBestiary());
    expect(data.factions).toEqual(getFactions());
    expect(data.factionEdges).toEqual(getFactionEdges());
    expect(data.hexNodes).toEqual(getHexNodes());
    expect(typeof data.exportedAt).toBe('string');
  });

  it('round-trips through JSON', () => {
    setCampaignName('The Gnawing Court Rises');
    const data = buildCampaignExport();
    const parsed = parseCampaignExport(JSON.stringify(data));

    expect(parsed.campaignName).toBe('The Gnawing Court Rises');
    expect(parsed.party).toEqual(data.party);
    expect(parsed.hirelings).toEqual(data.hirelings);
    expect(parsed.beats).toEqual(data.beats);
    expect(parsed.sessions).toEqual(data.sessions);
    expect(parsed.bestiary).toEqual(data.bestiary);
    expect(parsed.factions).toEqual(data.factions);
    expect(parsed.factionEdges).toEqual(data.factionEdges);
    expect(parsed.hexNodes).toEqual(data.hexNodes);
  });

  it('treats missing collections as empty arrays for backward compatibility with older exports', () => {
    const legacy = JSON.stringify({ version: 1, exportedAt: '2026-01-01T00:00:00.000Z', party: [], hirelings: [] });
    const parsed = parseCampaignExport(legacy);

    expect(parsed.beats).toEqual([]);
    expect(parsed.sessions).toEqual([]);
    expect(parsed.bestiary).toEqual([]);
    expect(parsed.factions).toEqual([]);
    expect(parsed.factionEdges).toEqual([]);
    expect(parsed.hexNodes).toEqual([]);
    expect(parsed.campaignName).toBeUndefined();
  });

  it('imports an older export without a campaignName by keeping the current campaign name', async () => {
    setCampaignName('My Ongoing Campaign');
    const legacy = new File(
      [JSON.stringify({ version: 1, exportedAt: '2026-01-01T00:00:00.000Z', party: [], hirelings: [] })],
      'legacy.json',
      { type: 'application/json' },
    );

    await importCampaign(legacy);

    expect(getCampaignName()).toBe('My Ongoing Campaign');
  });

  it('imports a campaign name from a newer export', async () => {
    setCampaignName('Old Name');
    const file = new File(
      [
        JSON.stringify({
          version: 1,
          exportedAt: '2026-01-01T00:00:00.000Z',
          campaignName: 'The Salt Marsh Expedition',
          party: [],
          hirelings: [],
        }),
      ],
      'export.json',
      { type: 'application/json' },
    );

    await importCampaign(file);

    expect(getCampaignName()).toBe('The Salt Marsh Expedition');
  });

  it('rejects a faction entry missing required fields', () => {
    const bad = JSON.stringify({ party: [], hirelings: [], factions: [{ id: '1' }] });
    expect(() => parseCampaignExport(bad)).toThrow(/does not look like/);
  });

  it('rejects a hex node missing required fields', () => {
    const bad = JSON.stringify({ party: [], hirelings: [], hexNodes: [{ id: '1' }] });
    expect(() => parseCampaignExport(bad)).toThrow(/does not look like/);
  });

  it('rejects a bestiary entry missing required fields', () => {
    const bad = JSON.stringify({ party: [], hirelings: [], beats: [], sessions: [], bestiary: [{ id: '1' }] });
    expect(() => parseCampaignExport(bad)).toThrow(/does not look like/);
  });

  it('rejects a beat entry missing required fields', () => {
    const bad = JSON.stringify({ party: [], hirelings: [], beats: [{ id: '1' }], sessions: [] });
    expect(() => parseCampaignExport(bad)).toThrow(/does not look like/);
  });

  it('rejects a beat entry with a malformed factionIds field', () => {
    const bad = JSON.stringify({
      party: [],
      hirelings: [],
      beats: [{ id: '1', parentId: null, title: 'Beat', status: 'planned', factionIds: 'not-an-array' }],
      sessions: [],
    });
    expect(() => parseCampaignExport(bad)).toThrow(/does not look like/);
  });

  it('accepts a beat entry with hexNodeId and factionIds', () => {
    const ok = JSON.stringify({
      party: [],
      hirelings: [],
      beats: [{ id: '1', parentId: null, title: 'Beat', status: 'planned', hexNodeId: 'hex-1', factionIds: ['fac-1'] }],
      sessions: [],
    });
    const parsed = parseCampaignExport(ok);
    expect(parsed.beats).toHaveLength(1);
  });

  it('rejects a session entry missing required fields', () => {
    const bad = JSON.stringify({ party: [], hirelings: [], beats: [], sessions: [{ id: '1' }] });
    expect(() => parseCampaignExport(bad)).toThrow(/does not look like/);
  });

  it('rejects invalid JSON', () => {
    expect(() => parseCampaignExport('not json')).toThrow(/not valid JSON/);
  });

  it('rejects JSON that is not a campaign export', () => {
    expect(() => parseCampaignExport(JSON.stringify({ hello: 'world' }))).toThrow(/does not look like/);
  });

  it('rejects a party entry missing required fields', () => {
    const bad = JSON.stringify({ party: [{ id: '1' }], hirelings: [] });
    expect(() => parseCampaignExport(bad)).toThrow(/does not look like/);
  });
});
