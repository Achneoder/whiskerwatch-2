<script lang="ts">
  // Shown for the brief window between the app opening and every campaign
  // store finishing hydration from IndexedDB (see `main.ts` and
  // `stores/allStoresReady.ts`). Deliberately minimal — this should resolve
  // in well under a second for realistic data volumes.
</script>

<div class="flex h-screen w-screen items-center justify-center bg-[var(--bg)] text-[var(--text)]">
  <div class="flex flex-col items-center gap-[var(--sp-3)]">
    <div
      class="h-8 w-8 animate-spin rounded-full border-4 border-[var(--accent)] border-t-transparent"
      role="status"
      aria-label="Loading your campaign"
    ></div>
    <p class="text-[length:var(--text-body)] text-[var(--text-secondary)]">Loading your campaign…</p>
  </div>
</div>
