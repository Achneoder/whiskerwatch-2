import { ready as partyReady } from './party.svelte';
import { ready as hirelingsReady } from './hirelings.svelte';
import { ready as beatsReady } from './beats.svelte';
import { ready as sessionsReady } from './sessions.svelte';
import { ready as bestiaryReady } from './bestiary.svelte';
import { ready as factionsReady } from './factions.svelte';
import { ready as factionEdgesReady } from './factionEdges.svelte';
import { ready as hexmapReady } from './hexmap.svelte';
import { ready as campaignHistoryReady } from './campaignHistory.svelte';

/**
 * Resolves once every IndexedDB-backed persisted-list store has finished
 * hydrating. `main.ts` awaits this before mounting `App.svelte` — see
 * `persistedList.svelte.ts` for why this is the pattern that keeps every
 * existing synchronous call site (`getParty()`, `getHirelings()`, etc.)
 * working unchanged after boot.
 *
 * Also reused by test setup (`src/test/setup.ts`) to await hydration before
 * each test runs, since ~450 existing unit tests import stores directly and
 * expect immediately-populated data.
 */
export const allStoresReady: Promise<void> = Promise.all([
  partyReady,
  hirelingsReady,
  beatsReady,
  sessionsReady,
  bestiaryReady,
  factionsReady,
  factionEdgesReady,
  hexmapReady,
  campaignHistoryReady,
]).then(() => undefined);
