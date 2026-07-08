<script lang="ts">
  import { ChevronLeft, BookOpen, ChevronDown, Check } from 'lucide-svelte';
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
    /**
     * Only passed (non-empty) when 2+ adventures have an active beat.
     * Omitted or empty ⇒ no picker renders at all — see
     * docs/design/phase-12-live-session-adventure-picker.md.
     *
     * Deviation from the spec's literal `{ id, title }[]` prop type: each
     * option also carries `beatTitle` so the expanded list can show the
     * adventure's active beat as a muted subtitle, per the spec's own "each
     * row shows adventure title + beat title" requirement — the beat title
     * isn't otherwise available inside this presentational component.
     */
    adventureOptions?: { id: string; title: string; beatTitle: string }[] | undefined;
    /** The currently effective selection — always one of `adventureOptions`' ids when that list is non-empty. */
    selectedAdventureId?: string | null | undefined;
    onselectadventure?: ((id: string) => void) | undefined;
  }

  let {
    sessionNumber,
    sessionTitle,
    beatTitle,
    onexit,
    onopenrules,
    onendsession,
    adventureOptions,
    selectedAdventureId,
    onselectadventure,
  }: Props = $props();

  let pickerOpen = $state(false);

  const showPicker = $derived(!!adventureOptions && adventureOptions.length > 1);
  const selectedAdventure = $derived(adventureOptions?.find((o) => o.id === selectedAdventureId) ?? null);

  function togglePicker() {
    pickerOpen = !pickerOpen;
  }

  function choose(id: string) {
    onselectadventure?.(id);
    pickerOpen = false;
  }
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
    {#if showPicker && adventureOptions}
      <div class="relative flex justify-center">
        <button
          type="button"
          onclick={togglePicker}
          aria-haspopup="listbox"
          aria-expanded={pickerOpen}
          aria-label={$_('liveSession.adventurePicker.ariaLabel', {
            values: { adventure: selectedAdventure?.title ?? '' },
          })}
          class="inline-flex items-center gap-1 min-h-[var(--tap)] px-[var(--sp-3)] rounded-full bg-[var(--accent-tint)] border border-[color-mix(in_srgb,var(--accent)_30%,transparent)] text-[var(--accent)] cursor-pointer text-[length:var(--text-sm)] font-[family-name:var(--font-body)] max-w-full"
        >
          <span class="truncate max-w-40">{selectedAdventure?.title ?? ''}</span>
          <Icon
            icon={ChevronDown}
            class={`shrink-0 transition-transform duration-[calc(var(--dur-fast)*1ms)] ease-[var(--ease)] ${pickerOpen ? 'rotate-180' : ''}`}
          />
        </button>
        {#if pickerOpen}
          <div
            role="listbox"
            aria-label={$_('liveSession.adventurePicker.listAriaLabel')}
            class="absolute left-1/2 top-full mt-1 -translate-x-1/2 z-10 w-max min-w-[220px] max-w-[85vw] flex flex-col gap-1 p-1.5 bg-[var(--surface-raised)] border border-[var(--border-strong)] rounded-[var(--radius-md)] shadow-[var(--shadow-modal)]"
          >
            {#each adventureOptions as option (option.id)}
              <button
                type="button"
                role="option"
                aria-selected={option.id === selectedAdventureId}
                onclick={() => choose(option.id)}
                class={`flex flex-col items-start text-left min-h-[var(--tap)] px-[var(--sp-3)] py-1.5 rounded-[var(--radius-sm)] cursor-pointer ${
                  option.id === selectedAdventureId
                    ? 'bg-[var(--accent-tint)] text-[var(--accent)]'
                    : 'text-[var(--text)] hover:bg-[var(--surface-sunk)]'
                }`}
              >
                <span class="font-[family-name:var(--font-display)] font-bold text-[length:var(--text-body)] flex items-center gap-1.5">
                  {#if option.id === selectedAdventureId}<Icon icon={Check} />{/if}
                  {option.title}
                </span>
                <span class="text-[length:var(--text-caption)] text-[var(--text-muted)] truncate max-w-full">
                  {option.beatTitle}
                </span>
              </button>
            {/each}
          </div>
        {/if}
      </div>
    {/if}
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
