import { createPersistedList } from './persistedList.svelte';
import { logSession } from './campaignHistory.svelte';

export interface Session {
  id: string;
  number: number;
  date: string;
  title: string;
  summary: string;
}

const STORAGE_KEY = 'whiskerwatch:sessions';

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

const seedSessions: Session[] = [
  {
    id: crypto.randomUUID(),
    number: 4,
    date: daysAgo(6),
    title: 'Into the sewers',
    summary: 'The warband tracked the Gnawing Court’s scouts down into the sewers beneath the granary and found the first tunnel entrance.',
  },
];

const list = createPersistedList<Session>(STORAGE_KEY, seedSessions);

export function getSessions(): Session[] {
  return list.items;
}

/** Converts a session's `YYYY-MM-DD` date field into an ISO timestamp for the timeline, so the
 *  entry sorts by when the session was actually played rather than when it was logged. Falls
 *  back to "now" if the date is malformed, so a bad record can't crash the timeline sort. */
function sessionDateToTimestamp(date: string): string {
  // Parsed as UTC midnight (not local time) so the resulting ISO timestamp's date
  // portion always matches the `YYYY-MM-DD` the GM entered, regardless of the
  // browser's timezone offset.
  const parsed = new Date(`${date}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

export function addSession(input: Omit<Session, 'id'>): void {
  const id = crypto.randomUUID();
  list.add({ ...input, id });
  logSession({
    timestamp: sessionDateToTimestamp(input.date),
    sessionId: id,
    number: input.number,
    title: input.title,
  });
}

export function updateSession(id: string, patch: Partial<Omit<Session, 'id'>>): void {
  list.update(id, patch);
}

export function removeSession(id: string): void {
  list.remove(id);
}

export function replaceSessions(sessions: Session[]): void {
  list.replaceAll(sessions);
}

export function getLastSession(): Session | null {
  return list.items.reduce<Session | null>((latest, s) => (!latest || s.number > latest.number ? s : latest), null);
}

export function getNextSessionNumber(): number {
  const last = getLastSession();
  return (last?.number ?? 0) + 1;
}
