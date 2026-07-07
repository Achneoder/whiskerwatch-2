import { getParty, replaceParty, type PartyMember } from './stores/party.svelte';
import { getHirelings, replaceHirelings, type Hireling } from './stores/hirelings.svelte';
import { getBeats, replaceBeats, type Beat } from './stores/beats.svelte';
import { getSessions, replaceSessions, type Session } from './stores/sessions.svelte';
import { getBestiary, replaceBestiary, type BestiaryEntry } from './stores/bestiary.svelte';
import { getFactions, replaceFactions, type Faction } from './stores/factions.svelte';
import { getFactionEdges, replaceFactionEdges, type FactionEdge } from './stores/factionEdges.svelte';
import { getHexNodes, replaceHexNodes, type HexNode } from './stores/hexmap.svelte';

export const CAMPAIGN_EXPORT_VERSION = 1;

export interface CampaignExport {
  version: typeof CAMPAIGN_EXPORT_VERSION;
  exportedAt: string;
  party: PartyMember[];
  hirelings: Hireling[];
  beats: Beat[];
  sessions: Session[];
  bestiary: BestiaryEntry[];
  factions: Faction[];
  factionEdges: FactionEdge[];
  hexNodes: HexNode[];
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
    factions: getFactions(),
    factionEdges: getFactionEdges(),
    hexNodes: getHexNodes(),
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
    typeof v.status === 'string' &&
    (v.hexNodeId === undefined || v.hexNodeId === null || typeof v.hexNodeId === 'string') &&
    (v.factionIds === undefined || (Array.isArray(v.factionIds) && v.factionIds.every((id) => typeof id === 'string')))
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

function isFaction(value: unknown): value is Faction {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    typeof v.name === 'string' &&
    typeof v.disposition === 'string' &&
    typeof v.clock === 'number' &&
    typeof v.of === 'number' &&
    Array.isArray(v.tags)
  );
}

function isFactionEdge(value: unknown): value is FactionEdge {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    typeof v.sourceId === 'string' &&
    typeof v.targetId === 'string' &&
    typeof v.type === 'string'
  );
}

function isHexNode(value: unknown): value is HexNode {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    typeof v.q === 'number' &&
    typeof v.r === 'number' &&
    typeof v.terrain === 'string' &&
    typeof v.name === 'string' &&
    typeof v.notes === 'string' &&
    typeof v.discovered === 'boolean'
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
  if (candidate.factions !== undefined && (!Array.isArray(candidate.factions) || !candidate.factions.every(isFaction))) {
    throw new Error('That file does not look like a Whiskerwatch campaign export.');
  }
  if (
    candidate.factionEdges !== undefined &&
    (!Array.isArray(candidate.factionEdges) || !candidate.factionEdges.every(isFactionEdge))
  ) {
    throw new Error('That file does not look like a Whiskerwatch campaign export.');
  }
  if (candidate.hexNodes !== undefined && (!Array.isArray(candidate.hexNodes) || !candidate.hexNodes.every(isHexNode))) {
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
    factions: Array.isArray(candidate.factions) ? candidate.factions : [],
    factionEdges: Array.isArray(candidate.factionEdges) ? candidate.factionEdges : [],
    hexNodes: Array.isArray(candidate.hexNodes) ? candidate.hexNodes : [],
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
  replaceFactions(data.factions);
  replaceFactionEdges(data.factionEdges);
  replaceHexNodes(data.hexNodes);
}
