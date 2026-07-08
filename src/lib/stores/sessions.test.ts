import { describe, expect, it, beforeEach } from 'vitest';
import {
  getSessions,
  addSession,
  updateSession,
  removeSession,
  replaceSessions,
  getLastSession,
  getNextSessionNumber,
} from './sessions.svelte';
import { getCampaignHistory, replaceCampaignHistory } from './campaignHistory.svelte';

describe('sessions store', () => {
  beforeEach(() => {
    replaceSessions([]);
    replaceCampaignHistory([]);
  });

  it('defaults to session 1 when nothing is logged', () => {
    expect(getLastSession()).toBeNull();
    expect(getNextSessionNumber()).toBe(1);
  });

  it('tracks the highest-numbered session as the last one', () => {
    addSession({ number: 2, date: '2026-01-01', title: 'B', summary: '' });
    addSession({ number: 4, date: '2026-01-08', title: 'D', summary: '' });
    addSession({ number: 3, date: '2026-01-05', title: 'C', summary: '' });

    expect(getLastSession()?.title).toBe('D');
    expect(getNextSessionNumber()).toBe(5);
  });

  it('updates and removes sessions', () => {
    addSession({ number: 1, date: '2026-01-01', title: 'A', summary: '' });
    const id = getSessions()[0]!.id;

    updateSession(id, { title: 'A (revised)' });
    expect(getSessions()[0]?.title).toBe('A (revised)');

    removeSession(id);
    expect(getSessions()).toHaveLength(0);
  });

  it('logs a campaign history entry timestamped from the session date, not creation time', () => {
    addSession({ number: 4, date: '2026-01-08', title: 'Into the sewers', summary: '' });
    const session = getSessions()[0]!;

    expect(getCampaignHistory()).toHaveLength(1);
    const [entry] = getCampaignHistory();
    expect(entry).toMatchObject({ type: 'session', sessionId: session.id, number: 4, title: 'Into the sewers' });
    expect(entry?.timestamp.slice(0, 10)).toBe('2026-01-08');
  });
});
