/**
 * Clears all campaign data from localStorage, resetting the app to a fresh state.
 * Preserves user preferences (theme and locale).
 */
export function resetAllCampaignData(): void {
  const campaignKeys = [
    'whiskerwatch:party',
    'whiskerwatch:beats',
    'whiskerwatch:hexmap',
    'whiskerwatch:factions',
    'whiskerwatch:hirelings',
    'whiskerwatch:sessions',
    'whiskerwatch:factionEdges',
    'whiskerwatch:bestiary',
  ];

  campaignKeys.forEach((key) => {
    localStorage.removeItem(key);
  });

  // Reload the page so all stores reinitialize with their default seed data
  window.location.reload();
}
