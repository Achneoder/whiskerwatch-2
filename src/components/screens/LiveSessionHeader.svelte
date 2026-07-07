<script lang="ts">
  import { ChevronLeft } from 'lucide-svelte';
  import { _ } from 'svelte-i18n';
  import Icon from '../ui/Icon.svelte';

  interface Props {
    sessionNumber: number | null;
    sessionTitle: string | null;
    beatTitle: string | null;
    onexit?: (() => void) | undefined;
  }

  let { sessionNumber, sessionTitle, beatTitle, onexit }: Props = $props();
</script>

<header
  class="sticky top-0 z-5 flex items-center justify-between gap-[var(--sp-4)] py-[var(--sp-4)] px-[var(--sp-5)] bg-[var(--surface)] border-b border-[var(--border)]"
>
  <button
    onclick={onexit}
    aria-label={$_('liveSession.exitAriaLabel')}
    class="inline-flex items-center gap-2 bg-none border-none text-[var(--text-muted)] cursor-pointer text-[length:var(--text-body)] font-[family-name:var(--font-body)]"
  >
    <Icon icon={ChevronLeft} size="live" />{$_('liveSession.exit')}
  </button>
  <div class="text-center min-w-0">
    <div class="ww-label text-[var(--accent)]">
      {$_('liveSession.eyebrow', { values: { session: sessionNumber ?? '—' } })}
    </div>
    <div class="font-[family-name:var(--font-display)] font-bold text-[length:var(--text-h3)] truncate">
      {sessionTitle ?? $_('liveSession.noSession')}
    </div>
    <div class="text-[length:var(--text-caption)] text-[var(--text-muted)] truncate">
      {beatTitle ?? $_('liveSession.noActiveBeat')}
    </div>
  </div>
  <!-- Balances the exit button so the title block stays visually centered. -->
  <span class="w-[var(--tap)] shrink-0" aria-hidden="true"></span>
</header>
