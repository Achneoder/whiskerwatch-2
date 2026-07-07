<script lang="ts">
  import { _ } from 'svelte-i18n';
  import StatusPill from '../ui/StatusPill.svelte';

  export interface FactionClockView {
    id: string;
    name: string;
    clock: number;
    of: number;
  }

  interface Notice {
    text: string;
    undo?: (() => void) | undefined;
  }

  interface Props {
    factions: FactionClockView[];
    notice: Notice | null;
    onbump: (id: string) => void;
    ondismissnotice: () => void;
  }

  let { factions, notice, onbump, ondismissnotice }: Props = $props();

  function undo() {
    notice?.undo?.();
    ondismissnotice();
  }
</script>

{#if factions.length > 0}
  <section class="flex flex-col gap-2">
    <div class="ww-label">{$_('liveSession.factionClocks')}</div>
    <div class="flex flex-wrap gap-[var(--sp-3)]">
      {#each factions as faction (faction.id)}
        <div class="min-h-[var(--tap)] flex items-center">
          <StatusPill tone="clock" size="live" count={faction.clock} of={faction.of} onclick={() => onbump(faction.id)}>
            {faction.name}
          </StatusPill>
        </div>
      {/each}
    </div>
    {#if notice}
      <div class="flex items-center gap-2">
        <span class="text-[length:var(--text-sm)] text-[var(--text-secondary)]">{notice.text}</span>
        {#if notice.undo}
          <button
            type="button"
            onclick={undo}
            class="font-bold text-[var(--accent)] text-[length:var(--text-sm)] cursor-pointer bg-none border-none"
          >
            {$_('liveSession.undo')}
          </button>
        {/if}
      </div>
    {/if}
  </section>
{/if}
