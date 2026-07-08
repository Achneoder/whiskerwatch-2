// Must be the very first import: installs `indexedDB`/`IDBKeyRange` as
// globals before any store module (evaluated below, transitively via
// `allStoresReady`) can reach for them.
import 'fake-indexeddb/auto';
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/svelte';
import '../lib/i18n';
import { allStoresReady } from '../lib/stores/allStoresReady';

// Every campaign store hydrates asynchronously from IndexedDB on import (see
// `stores/persistedList.svelte.ts`). Vitest isolates each test file into its
// own module registry, so this runs exactly once per file, before any test
// in it — guaranteeing every store (and any store-level backfill chained off
// its `ready` promise) has finished settling before a test's own
// `beforeEach` (e.g. `replaceParty([])`) touches it. Without this, a store's
// hydration could resolve *after* a test has already set up its own state,
// silently overwriting it.
beforeAll(async () => {
  await allStoresReady;
});

afterEach(() => {
  cleanup();
});

