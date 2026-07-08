import { describe, expect, it, beforeEach } from 'vitest';
import {
  getCampaignHistory,
  logSession,
  logBeatCompleted,
  logClockChanged,
  replaceCampaignHistory,
} from './campaignHistory.svelte';

describe('campaignHistory store', () => {
  beforeEach(() => {
    replaceCampaignHistory([]);
  });

  it('starts empty', () => {
    expect(getCampaignHistory()).toHaveLength(0);
  });

  it('appends a session entry', () => {
    logSession({ timestamp: '2026-07-01T12:00:00.000Z', sessionId: 's1', number: 4, title: 'Into the sewers' });

    expect(getCampaignHistory()).toHaveLength(1);
    const [entry] = getCampaignHistory();
    expect(entry).toMatchObject({ type: 'session', sessionId: 's1', number: 4, title: 'Into the sewers' });
    expect(entry?.id).toBeTruthy();
  });

  it('appends a beatCompleted entry with optional hex/faction links', () => {
    logBeatCompleted({
      timestamp: '2026-07-01T12:00:00.000Z',
      beatId: 'b1',
      title: 'The granary raid',
      hexNodeId: 'hex-1',
      factionIds: ['fac-1'],
    });

    const [entry] = getCampaignHistory();
    expect(entry).toMatchObject({
      type: 'beatCompleted',
      beatId: 'b1',
      title: 'The granary raid',
      hexNodeId: 'hex-1',
      factionIds: ['fac-1'],
    });
  });

  it('appends a clockChanged entry', () => {
    logClockChanged({
      timestamp: '2026-07-01T12:00:00.000Z',
      factionId: 'fac-1',
      factionName: 'The Gnawing Court',
      from: 2,
      to: 3,
      max: 6,
    });

    const [entry] = getCampaignHistory();
    expect(entry).toMatchObject({
      type: 'clockChanged',
      factionId: 'fac-1',
      factionName: 'The Gnawing Court',
      from: 2,
      to: 3,
      max: 6,
    });
  });

  it('appends multiple entries in insertion order', () => {
    logSession({ timestamp: '2026-07-01T00:00:00.000Z', sessionId: 's1', number: 1, title: 'A' });
    logClockChanged({ timestamp: '2026-07-02T00:00:00.000Z', factionId: 'f1', factionName: 'F', from: 0, to: 1, max: 6 });

    expect(getCampaignHistory().map((e) => e.type)).toEqual(['session', 'clockChanged']);
  });
});
