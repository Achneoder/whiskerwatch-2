import { readJSON, writeJSON } from '../storage';

export interface CampaignSettings {
  name: string;
}

const STORAGE_KEY = 'whiskerwatch:campaign';

/** Matches the historical `dashboard.title` i18n default so existing campaigns don't see a name change on upgrade. */
export const DEFAULT_CAMPAIGN_NAME = 'My Campaign';

const state = $state<CampaignSettings>(readJSON(STORAGE_KEY, { name: DEFAULT_CAMPAIGN_NAME }));

export function getCampaignName(): string {
  return state.name;
}

export function setCampaignName(name: string): void {
  const trimmed = name.trim();
  state.name = trimmed || DEFAULT_CAMPAIGN_NAME;
  writeJSON(STORAGE_KEY, state);
}
