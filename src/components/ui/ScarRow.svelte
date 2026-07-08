<script lang="ts">
  import { Skull, Bandage } from 'lucide-svelte';
  import { _ } from 'svelte-i18n';
  import Tag from './Tag.svelte';
  import Icon from './Icon.svelte';
  import Modal from './Modal.svelte';
  import type { Scar } from '../../lib/conditions';

  interface Props {
    /** Mouse/hireling display name — used for the "Add Scar" button's aria-label and the "show all" modal's title. */
    name: string;
    scars: Scar[];
    onaddscar: () => void;
  }

  let { name, scars, onaddscar }: Props = $props();

  const MAX_INLINE = 3;
  const visible = $derived(scars.slice(0, MAX_INLINE));
  const overflowCount = $derived(Math.max(0, scars.length - MAX_INLINE));

  let showAll = $state(false);

  // Purely decorative variety between the two Fatal-Wounds-flavored icons —
  // there's no mechanical distinction between a "Skull" scar and a
  // "Bandage" scar, so this just alternates by position.
  function iconFor(index: number) {
    return index % 2 === 0 ? Skull : Bandage;
  }
</script>

<div class="flex items-center gap-1.5 flex-wrap">
  {#each visible as scar, i (scar.label + i)}
    <Tag size="sm">
      <span class="inline-flex items-center gap-1">
        <Icon icon={iconFor(i)} />
        {scar.label}
      </span>
    </Tag>
  {/each}
  {#if overflowCount > 0}
    <button
      type="button"
      onclick={() => (showAll = true)}
      aria-label={$_('roster.scars.moreAriaLabel', { values: { name } })}
      class="cursor-pointer"
    >
      <Tag size="sm">{$_('roster.scars.more', { values: { count: overflowCount } })}</Tag>
    </button>
  {/if}
  <button
    type="button"
    onclick={onaddscar}
    aria-label={$_('roster.scars.addAriaLabel', { values: { name } })}
    class="inline-flex items-center gap-1 h-8 px-2 rounded-[var(--radius-md)] text-[var(--accent)] text-[length:var(--text-sm)] font-bold hover:bg-[var(--accent-tint)] cursor-pointer"
  >
    <Icon icon={Skull} />
    {$_('roster.scars.add')}
  </button>
</div>

<Modal open={showAll} title={$_('roster.scars.allTitle', { values: { name } })} onclose={() => (showAll = false)} width={420}>
  <div class="flex flex-col gap-[var(--sp-3)] pb-[var(--sp-4)]">
    {#each scars as scar, i (scar.label + i)}
      <div class="flex flex-col gap-1">
        <div class="flex items-center gap-1.5 font-bold text-[length:var(--text-sm)]">
          <Icon icon={iconFor(i)} />
          {scar.label}
        </div>
        {#if scar.note}
          <p class="text-[length:var(--text-sm)] text-[var(--text-muted)]">{scar.note}</p>
        {/if}
      </div>
    {/each}
  </div>
</Modal>
