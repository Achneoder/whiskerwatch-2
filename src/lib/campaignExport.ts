import { getParty, replaceParty, type PartyMember } from './stores/party.svelte';
import { getHirelings, replaceHirelings, type Hireling } from './stores/hirelings.svelte';

export const CAMPAIGN_EXPORT_VERSION = 1;

export interface CampaignExport {
  version: typeof CAMPAIGN_EXPORT_VERSION;
  exportedAt: string;
  party: PartyMember[];
  hirelings: Hireling[];
}

export function buildCampaignExport(): CampaignExport {
  return {
    version: CAMPAIGN_EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    party: getParty(),
    hirelings: getHirelings(),
  };
}

function isPartyMember(value: unknown): value is PartyMember {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return typeof v.id === 'string' && typeof v.name === 'string' && typeof v.hp === 'number' && typeof v.max === 'number';
}

function isHireling(value: unknown): value is Hireling {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return typeof v.id === 'string' && typeof v.name === 'string' && typeof v.hp === 'number' && typeof v.max === 'number';
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

  return {
    version: CAMPAIGN_EXPORT_VERSION,
    exportedAt: typeof candidate.exportedAt === 'string' ? candidate.exportedAt : new Date().toISOString(),
    party: candidate.party,
    hirelings: candidate.hirelings,
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
}
