import { describe, expect, it, beforeEach } from 'vitest';
import { getCampaignName, setCampaignName, DEFAULT_CAMPAIGN_NAME } from './campaign.svelte';

describe('campaign store', () => {
  beforeEach(() => {
    localStorage.clear();
    setCampaignName(DEFAULT_CAMPAIGN_NAME);
  });

  it('defaults to "My Campaign"', () => {
    expect(getCampaignName()).toBe('My Campaign');
  });

  it('updates the name and persists it to localStorage', () => {
    setCampaignName('The Salt Marsh Expedition');

    expect(getCampaignName()).toBe('The Salt Marsh Expedition');
    expect(JSON.parse(localStorage.getItem('whiskerwatch:campaign')!)).toEqual({
      name: 'The Salt Marsh Expedition',
    });
  });

  it('trims surrounding whitespace', () => {
    setCampaignName('  The Gnawing Court Rises  ');

    expect(getCampaignName()).toBe('The Gnawing Court Rises');
  });

  it('falls back to the default name if set to an empty/blank string', () => {
    setCampaignName('   ');

    expect(getCampaignName()).toBe(DEFAULT_CAMPAIGN_NAME);
  });
});
