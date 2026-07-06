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

describe('sessions store', () => {
  beforeEach(() => {
    replaceSessions([]);
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
});
