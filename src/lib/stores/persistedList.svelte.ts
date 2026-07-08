import { hydrateList, finalizeFirstBoot, persistList } from '../idb';

export interface Identified {
  id: string;
}

export interface PersistedList<T extends Identified> {
  items: T[];
  /**
   * Resolves once this list's initial data has been read from IndexedDB (and
   * migrated from a legacy localStorage key, if one existed) and `items` has
   * been populated. Callers that need to react to state set up *after*
   * construction — e.g. a store's own legacy-shape backfill — should chain
   * off this instead of assuming `items` is populated synchronously.
   *
   * Never rejects: hydration failures degrade to seed/legacy data instead.
   */
  ready: Promise<void>;
  add: (item: T) => void;
  update: (id: string, patch: Partial<Omit<T, 'id'>>) => void;
  remove: (id: string) => void;
  replaceAll: (newItems: T[]) => void;
  /**
   * Resolves once the most recently triggered background write has settled
   * (whether it succeeded or failed). Mutators are fire-and-forget by
   * design, but a caller that needs a durability guarantee before reporting
   * success to the user — e.g. campaign import — can `await` this right
   * after calling a mutator.
   */
  flush: () => Promise<void>;
}

function ensureId<T extends Identified>(item: T): T {
  if (typeof item?.id === 'string' && item.id.length > 0) return item;
  return { ...item, id: crypto.randomUUID() };
}

/**
 * Repairs data written by an older schema (e.g. entities saved before an `id`
 * field existed) instead of crashing the app: a missing/duplicate id here
 * would otherwise blow up every keyed `{#each ... (item.id)}` block downstream
 * and unmount the whole page.
 */
function sanitize<T extends Identified>(raw: unknown, seed: T[]): T[] {
  if (!Array.isArray(raw)) return seed;
  const seenIds = new Set<string>();
  return raw.map((item) => {
    const withId = ensureId(item as T);
    if (seenIds.has(withId.id)) return { ...withId, id: crypto.randomUUID() };
    seenIds.add(withId.id);
    return withId;
  });
}

/**
 * Creates an entity list whose public surface (`items`/`add`/`update`/
 * `remove`/`replaceAll`) stays synchronous, matching Svelte 5's `$state`
 * reactivity and every existing call site — but which is actually backed by
 * IndexedDB underneath. `items` starts empty and is populated once `ready`
 * resolves; app boot (`main.ts`) awaits every store's `ready` before
 * mounting `App.svelte`, so by the time any component reads `items` the data
 * is already there. Mutators update `items` synchronously first (optimistic,
 * matching the previous localStorage-backed behavior exactly), then
 * fire-and-forget an async write to IndexedDB — a failed background write is
 * logged and swallowed rather than surfaced, since this app has no
 * error-reporting infra and a stale/corrupted record should degrade
 * gracefully, not crash (see CLAUDE.md).
 */
export function createPersistedList<T extends Identified>(storageKey: string, seed: T[]): PersistedList<T> {
  const items = $state<T[]>([]);
  let pendingPersist: Promise<void> = Promise.resolve();

  function persist(): void {
    // IndexedDB's structured-clone write path can't clone Svelte 5's
    // reactive `$state` proxies (browsers vary in how forgiving they are
    // about this) — `$state.snapshot` takes a plain, non-reactive copy
    // first so what actually gets written is ordinary cloneable data.
    const snapshot = $state.snapshot(items);
    pendingPersist = persistList(storageKey, snapshot).catch((err) => {
      console.error(`Failed to persist "${storageKey}" to IndexedDB`, err);
    });
  }

  function flush(): Promise<void> {
    return pendingPersist;
  }

  const ready: Promise<void> = hydrateList<T>(storageKey, seed).then(async ({ raw, isFirstBoot }) => {
    const sanitized = sanitize(raw, seed);
    items.splice(0, items.length, ...sanitized);

    if (isFirstBoot) {
      // Only ever write already-sanitized (id-guaranteed) items to
      // IndexedDB — a raw pre-id legacy record could otherwise collide with
      // another item under the same synthetic key and silently disappear.
      try {
        await finalizeFirstBoot(storageKey, sanitized);
      } catch (err) {
        console.error(`Failed to persist initial data for "${storageKey}" to IndexedDB`, err);
      }
    } else if (JSON.stringify(raw) !== JSON.stringify(sanitized)) {
      // Loading required repairs (missing/duplicate ids, or a malformed
      // record) — persist the fix immediately so it doesn't need repairing again.
      persist();
    }
  });

  function add(item: T): void {
    items.push(item);
    persist();
  }

  function update(id: string, patch: Partial<Omit<T, 'id'>>): void {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    Object.assign(item, patch);
    persist();
  }

  function remove(id: string): void {
    const index = items.findIndex((i) => i.id === id);
    if (index === -1) return;
    items.splice(index, 1);
    persist();
  }

  function replaceAll(newItems: T[]): void {
    items.splice(0, items.length, ...newItems);
    persist();
  }

  return { items, ready, add, update, remove, replaceAll, flush };
}
