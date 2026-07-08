<script lang="ts">
  import { X } from 'lucide-svelte';
  import { _ } from 'svelte-i18n';
  import StatusPill from '../ui/StatusPill.svelte';
  import HpBar from '../ui/HpBar.svelte';
  import Button from '../ui/Button.svelte';
  import Icon from '../ui/Icon.svelte';
  import HurtHealDrawer from '../ui/HurtHealDrawer.svelte';

  /**
   * A single tracked HP pool for a rolled encounter creature — see
   * docs/design/phase-13-encounter-tracker-and-item-handoff.md. Transient,
   * screen-scoped state owned by `LiveSession.svelte`; never persisted.
   */
  export interface EncounterInstance {
    id: string;
    label: string;
    hp: number;
    maxHp: number;
  }

  interface Props {
    instance: EncounterInstance;
    drawerOpen: boolean;
    ontoggledrawer: (id: string) => void;
    onhurt: (id: string, amount: number) => void;
    onheal: (id: string, amount: number) => void;
    onremove: (id: string) => void;
  }

  let { instance, drawerOpen, ontoggledrawer, onhurt, onheal, onremove }: Props = $props();

  const defeated = $derived(instance.hp === 0);
  const chips = [1, 2, 3, 4, 5, 6];

  // Local to this row, same as `LiveSessionCard`'s own mode/customOpen/
  // customAmount — an instance's hurt/heal drawer state has no reason to
  // live any higher up than the row itself.
  let mode = $state<'hurt' | 'heal'>('hurt');
  let customOpen = $state(false);
  let customAmount = $state(7);

  function applyChip(amount: number) {
    if (mode === 'hurt') onhurt(instance.id, amount);
    else onheal(instance.id, amount);
  }

  function applyCustom() {
    applyChip(customAmount);
  }
</script>

<!--
  `data-testid` is the same deliberate, minimal concession `LiveSessionCard`
  uses: multiple structurally-identical instance rows can be on screen at
  once (a whole group of Ratlings), and this is the only stable hook to
  scope interactions to the right one without fragile DOM traversal. Keyed
  on the label since it's already guaranteed unique per row.
-->
<div
  data-testid={`encounter-instance-${instance.label}`}
  class="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-sunk)] p-[var(--sp-3)] flex flex-col gap-2"
>
  <div class="flex items-center justify-between gap-2">
    <span
      class="font-bold text-[length:var(--text-body)] {defeated ? 'line-through text-[var(--text-faint)]' : ''}"
    >
      {instance.label}
    </span>
    {#if defeated}
      <StatusPill tone="danger" size="sm">{$_('liveSession.encounter.defeated')}</StatusPill>
    {:else}
      <!--
        Always-available, separate from the "Remove" action that appears once
        `hp === 0` — a creature can flee, or the GM can tap "+ Add another"
        once too many, well before it's actually defeated.
      -->
      <button
        type="button"
        onclick={() => onremove(instance.id)}
        aria-label={$_('liveSession.encounter.removeAria', { values: { label: instance.label } })}
        class="min-w-[var(--tap)] min-h-[var(--tap)] grid place-items-center rounded-[var(--radius-md)] text-[var(--text-faint)] cursor-pointer bg-transparent border-none"
      >
        <Icon icon={X} />
      </button>
    {/if}
  </div>

  {#if !defeated}
    <HpBar value={instance.hp} max={instance.maxHp} size="md" tone="hp" label={$_('liveSession.hp')} />
    <Button variant="danger" size="sm" onclick={() => ontoggledrawer(instance.id)}>
      {$_('liveSession.hurt')}
    </Button>
    {#if drawerOpen}
      <div class="border-t border-[var(--border)] pt-3">
        <HurtHealDrawer
          {mode}
          {chips}
          {customOpen}
          bind:customAmount
          onmode={(m) => (mode = m)}
          onchip={applyChip}
          oncustomtoggle={() => (customOpen = true)}
          onapplycustom={applyCustom}
        />
      </div>
    {/if}
  {:else}
    <Button variant="secondary" size="sm" block onclick={() => onremove(instance.id)}>
      {$_('liveSession.encounter.remove')}
    </Button>
  {/if}
</div>
