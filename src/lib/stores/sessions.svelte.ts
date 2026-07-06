import { createPersistedList } from './persistedList.svelte';

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

export function addSession(input: Omit<Session, 'id'>): void {
  list.add({ ...input, id: crypto.randomUUID() });
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
