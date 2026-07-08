<script lang="ts">
  import { ChevronLeft, BookOpen } from 'lucide-svelte';
  import { _ } from 'svelte-i18n';
  import Icon from '../ui/Icon.svelte';

  interface Props {
    sessionNumber: number | null;
    sessionTitle: string | null;
    beatTitle: string | null;
    onexit?: (() => void) | undefined;
    /** Opens the shared `RulesDrawer` quick-reference panel. */
    onopenrules?: (() => void) | undefined;
    /** Opens the end-of-session recap review (`SessionRecapReview`) — a separate step from `onexit`, which just backs out to Prep with no recap. */
    onendsession?: (() => void) | undefined;
  }

  let { sessionNumber, sessionTitle, beatTitle, onexit, onopenrules, onendsession }: Props = $props();
</script>

<header
  class="sticky top-0 z-5 flex items-center justify-between gap-[var(--sp-3)] py-[var(--sp-4)] px-[var(--sp-5)] bg-[var(--surface)] border-b border-[var(--border)]"
>
  <button
    onclick={onexit}
    aria-label={$_('liveSession.exitAriaLabel')}
    class="inline-flex items-center gap-2 min-h-[var(--tap)] shrink-0 bg-none border-none text-[var(--text-muted)] cursor-pointer text-[length:var(--text-body)] font-[family-name:var(--font-body)]"
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
  <div class="flex items-center gap-[var(--sp-2)] shrink-0">
    <button
      onclick={onopenrules}
      aria-label={$_('liveSession.rulesAriaLabel')}
      class="inline-flex items-center justify-center min-h-[var(--tap)] min-w-[var(--tap)] bg-none border-none text-[var(--text-muted)] cursor-pointer"
    >
      <Icon icon={BookOpen} size="live" />
    </button>
    <button
      onclick={onendsession}
      aria-label={$_('liveSession.endSessionAriaLabel')}
      class="inline-flex items-center justify-center min-h-[var(--tap)] px-[var(--sp-3)] rounded-[var(--radius-md)] bg-[var(--danger-tint)] border border-[var(--danger)] text-[var(--danger-hover)] cursor-pointer text-[length:var(--text-sm)] font-[family-name:var(--font-display)] font-bold whitespace-nowrap"
    >
      {$_('liveSession.endSession')}
    </button>
  </div>
</header>
