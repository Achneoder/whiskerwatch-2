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

  // Write an empty array rather than removing the key: if the key is
  // absent, createPersistedList's readJSON falls back to each store's
  // built-in seed/demo data, so a removed key silently un-resets itself.
  campaignKeys.forEach((key) => {
    localStorage.setItem(key, '[]');
  });

  // Reload the page so all stores reinitialize from the now-empty state
  window.location.reload();
}
