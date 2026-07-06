import { getParty, replaceParty, type PartyMember } from './stores/party.svelte';
import { getHirelings, replaceHirelings, type Hireling } from './stores/hirelings.svelte';
import { getBeats, replaceBeats, type Beat } from './stores/beats.svelte';
import { getSessions, replaceSessions, type Session } from './stores/sessions.svelte';
import { getBestiary, replaceBestiary, type BestiaryEntry } from './stores/bestiary.svelte';

export const CAMPAIGN_EXPORT_VERSION = 1;

export interface CampaignExport {
  version: typeof CAMPAIGN_EXPORT_VERSION;
  exportedAt: string;
  party: PartyMember[];
  hirelings: Hireling[];
  beats: Beat[];
  sessions: Session[];
  bestiary: BestiaryEntry[];
}

export function buildCampaignExport(): CampaignExport {
  return {
    version: CAMPAIGN_EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    party: getParty(),
    hirelings: getHirelings(),
    beats: getBeats(),
    sessions: getSessions(),
    bestiary: getBestiary(),
  };
}

function hasIdAndHp(value: unknown): value is { id: string; hp: number; max: number } {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return typeof v.id === 'string' && typeof v.name === 'string' && typeof v.hp === 'number' && typeof v.max === 'number';
}

function isPartyMember(value: unknown): value is PartyMember {
  return hasIdAndHp(value);
}

function isHireling(value: unknown): value is Hireling {
  return hasIdAndHp(value);
}

function isBeat(value: unknown): value is Beat {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    (v.parentId === null || typeof v.parentId === 'string') &&
    typeof v.title === 'string' &&
    typeof v.status === 'string'
  );
}

function isSession(value: unknown): value is Session {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return typeof v.id === 'string' && typeof v.number === 'number' && typeof v.date === 'string' && typeof v.title === 'string';
}

function isBestiaryEntry(value: unknown): value is BestiaryEntry {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    typeof v.name === 'string' &&
    typeof v.category === 'string' &&
    typeof v.hd === 'number' &&
    typeof v.hp === 'number' &&
    Array.isArray(v.attacks)
  );
}

export function parseCampaignExport(text: string): CampaignExport {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('That file is not valid JSON.');
  }

  if (!data || typeof data !== 'object') {
    throw new Error('That file does not look like a Whiskerwatch campaign export.');
  }

  const candidate = data as Record<string, unknown>;
  if (!Array.isArray(candidate.party) || !candidate.party.every(isPartyMember)) {
    throw new Error('That file does not look like a Whiskerwatch campaign export.');
  }
  if (!Array.isArray(candidate.hirelings) || !candidate.hirelings.every(isHireling)) {
    throw new Error('That file does not look like a Whiskerwatch campaign export.');
  }
  if (candidate.beats !== undefined && (!Array.isArray(candidate.beats) || !candidate.beats.every(isBeat))) {
    throw new Error('That file does not look like a Whiskerwatch campaign export.');
  }
  if (candidate.sessions !== undefined && (!Array.isArray(candidate.sessions) || !candidate.sessions.every(isSession))) {
    throw new Error('That file does not look like a Whiskerwatch campaign export.');
  }
  if (candidate.bestiary !== undefined && (!Array.isArray(candidate.bestiary) || !candidate.bestiary.every(isBestiaryEntry))) {
    throw new Error('That file does not look like a Whiskerwatch campaign export.');
  }

  return {
    version: CAMPAIGN_EXPORT_VERSION,
    exportedAt: typeof candidate.exportedAt === 'string' ? candidate.exportedAt : new Date().toISOString(),
    party: candidate.party,
    hirelings: candidate.hirelings,
    beats: Array.isArray(candidate.beats) ? candidate.beats : [],
    sessions: Array.isArray(candidate.sessions) ? candidate.sessions : [],
    bestiary: Array.isArray(candidate.bestiary) ? candidate.bestiary : [],
  };
}

export function exportCampaign(): void {
  const data = buildCampaignExport();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `whiskerwatch-campaign-${data.exportedAt.slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function importCampaign(file: File): Promise<void> {
  const text = await file.text();
  const data = parseCampaignExport(text);
  replaceParty(data.party);
  replaceHirelings(data.hirelings);
  replaceBeats(data.beats);
  replaceSessions(data.sessions);
  replaceBestiary(data.bestiary);
}
