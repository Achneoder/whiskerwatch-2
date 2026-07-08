import { createPersistedList } from './persistedList.svelte';

export interface SessionHistoryEntry {
  id: string;
  type: 'session';
  timestamp: string;
  sessionId: string;
  number: number;
  title: string;
}

export interface BeatCompletedHistoryEntry {
  id: string;
  type: 'beatCompleted';
  timestamp: string;
  beatId: string;
  title: string;
  hexNodeId?: string | null;
  factionIds?: string[];
}

export interface ClockChangedHistoryEntry {
  id: string;
  type: 'clockChanged';
  timestamp: string;
  factionId: string;
  factionName: string;
  from: number;
  to: number;
  max: number;
}

export interface DeathHistoryEntry {
  id: string;
  type: 'death';
  timestamp: string;
  memberId: string;
  name: string;
  role: string;
  source: 'party' | 'hireling';
  cause?: string;
  sessionNumber?: number;
  level?: number;
}

export type CampaignHistoryEntry =
  | SessionHistoryEntry
  | BeatCompletedHistoryEntry
  | ClockChangedHistoryEntry
  | DeathHistoryEntry;

const STORAGE_KEY = 'whiskerwatch:campaignHistory';

const list = createPersistedList<CampaignHistoryEntry>(STORAGE_KEY, []);

export function getCampaignHistory(): CampaignHistoryEntry[] {
  return list.items;
}

export function logSession(input: Omit<SessionHistoryEntry, 'id' | 'type'>): void {
  list.add({ ...input, id: crypto.randomUUID(), type: 'session' });
}

export function logBeatCompleted(input: Omit<BeatCompletedHistoryEntry, 'id' | 'type'>): void {
  list.add({ ...input, id: crypto.randomUUID(), type: 'beatCompleted' });
}

export function logClockChanged(input: Omit<ClockChangedHistoryEntry, 'id' | 'type'>): void {
  list.add({ ...input, id: crypto.randomUUID(), type: 'clockChanged' });
}

export function logDeath(input: Omit<DeathHistoryEntry, 'id' | 'type'>): void {
  list.add({ ...input, id: crypto.randomUUID(), type: 'death' });
}

export function replaceCampaignHistory(entries: CampaignHistoryEntry[]): void {
  list.replaceAll(entries);
}
