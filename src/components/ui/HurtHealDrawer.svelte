<script lang="ts">
  import { _ } from 'svelte-i18n';
  import Button from './Button.svelte';
  import Stepper from './Stepper.svelte';

  /**
   * Extracted from `LiveSessionCard.svelte` (Phase 13) so the same
   * chip-grid + hurt/heal toggle + custom-`Stepper` interaction can be
   * reused by `LiveSessionEncounterInstance.svelte` without a second copy of
   * the markup drifting out of sync — see
   * docs/design/phase-13-encounter-tracker-and-item-handoff.md.
   *
   * This component is intentionally dumb: it doesn't know whether "apply 3"
   * means damage or healing, or which entity it's being applied to. The
   * caller owns `mode`/`customOpen`/`customAmount` and decides what `onchip`/
   * `onapplycustom` actually do with the resulting amount.
   */
  interface Props {
    mode: 'hurt' | 'heal';
    chips: number[];
    customOpen: boolean;
    customAmount: number;
    onmode: (mode: 'hurt' | 'heal') => void;
    onchip: (amount: number) => void;
    oncustomtoggle: () => void;
    onapplycustom: () => void;
  }

  let {
    mode,
    chips,
    customOpen,
    customAmount = $bindable(),
    onmode,
    onchip,
    oncustomtoggle,
    onapplycustom,
  }: Props = $props();
</script>

<div class="flex flex-col gap-3">
  <div class="flex gap-2">
    <Button variant={mode === 'hurt' ? 'danger' : 'ghost'} size="sm" onclick={() => onmode('hurt')}>
      {$_('liveSession.hurt')}
    </Button>
    <Button variant={mode === 'heal' ? 'primary' : 'ghost'} size="sm" onclick={() => onmode('heal')}>
      {$_('liveSession.heal')}
    </Button>
  </div>
  <div class="grid grid-cols-3 gap-2">
    {#each chips as n (n)}
      <button
        type="button"
        onclick={() => onchip(n)}
        class="min-h-[var(--tap)] rounded-[var(--radius-md)] font-[family-name:var(--font-display)] font-bold text-[length:var(--text-title)] cursor-pointer border {mode ===
        'hurt'
          ? 'bg-[var(--danger-tint)] text-[var(--danger-hover)] border-[var(--danger)]'
          : 'bg-[var(--success-tint)] text-[var(--success)] border-[var(--success)]'}"
      >
        {n}
      </button>
    {/each}
  </div>
  {#if !customOpen}
    <Button variant="secondary" block onclick={oncustomtoggle}>{$_('liveSession.customAmount')}</Button>
  {:else}
    <div class="flex items-center justify-center gap-[var(--sp-4)] flex-wrap">
      <Stepper
        value={customAmount}
        min={1}
        max={30}
        tone={mode === 'heal' ? 'accent' : 'hp'}
        onchange={(v) => (customAmount = v)}
      />
      <Button variant={mode === 'hurt' ? 'danger' : 'primary'} onclick={onapplycustom}>{$_('liveSession.apply')}</Button>
    </div>
  {/if}
</div>
