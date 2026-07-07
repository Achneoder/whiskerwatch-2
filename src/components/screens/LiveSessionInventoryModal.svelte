<script lang="ts">
  import { _ } from 'svelte-i18n';
  import Modal from '../ui/Modal.svelte';
  import { MAX_SLOTS, PAWS_SLOTS, BODY_SLOTS, usedSlots, splitSections, type Item } from '../../lib/items';

  interface Notice {
    text: string;
    undo?: (() => void) | undefined;
  }

  interface Props {
    name: string;
    items: Item[];
    open: boolean;
    notice?: Notice | null;
    onburn: (itemId: string) => void;
    onclose: () => void;
    ondismissnotice?: () => void;
  }

  let { name, items, open, notice = null, onburn, onclose, ondismissnotice }: Props = $props();

  function undoNotice() {
    notice?.undo?.();
    ondismissnotice?.();
  }

  type CellEntry = { type: 'item'; item: Item } | { type: 'empty'; key: string };

  /**
   * Static counterpart to `ItemSlotGrid`'s `buildCells` — pads a section's
   * items out to its nominal slot budget with empty placeholder cells, but
   * (unlike the roster editor) never guarantees a minimum of one: this
   * modal has no add affordance, so an overburdened section with zero
   * spare capacity legitimately renders no empties at all.
   */
  function buildCells(sectionItems: Item[], sectionSlots: number, prefix: string): CellEntry[] {
    const cells: CellEntry[] = sectionItems.map((item) => ({ type: 'item', item }));
    const used = sectionItems.reduce((total, item) => total + item.slots, 0);
    const emptyCount = Math.max(0, sectionSlots - used);
    for (let i = 0; i < emptyCount; i += 1) {
      cells.push({ type: 'empty', key: `${prefix}-empty-${i}` });
    }
    return cells;
  }

  const sections = $derived(splitSections(items));
  const pawsCells = $derived(buildCells(sections.paws, PAWS_SLOTS, 'paws'));
  const bodyCells = $derived(buildCells(sections.body, BODY_SLOTS, 'body'));
  const used = $derived(usedSlots(items));

  function chargeCellAria(item: Item): string {
    return $_('liveSession.chargeCellAria', {
      values: { name: item.name, current: item.charges ?? 0, max: item.maxCharges ?? 0 },
    });
  }
</script>

{#snippet chargeDots(item: Item)}
  <span
    role="img"
    aria-label={$_('inventory.chargesAria', { values: { current: item.charges ?? 0, max: item.maxCharges ?? 0 } })}
    class="font-[family-name:var(--font-mono)] text-[length:var(--text-sm)] text-[var(--text-muted)] tracking-wide"
  >
    {#each Array(item.maxCharges ?? 0) as _pip, i (i)}{i < (item.charges ?? 0) ? '●' : '○'}{/each}
  </span>
{/snippet}

{#snippet cell(item: Item)}
  {#if item.maxCharges != null}
    <button
      type="button"
      onclick={() => onburn(item.id)}
      aria-label={chargeCellAria(item)}
      class="min-h-19 flex flex-col items-center justify-center gap-1 rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface)] cursor-pointer p-[var(--sp-2)] text-center"
    >
      <span class="text-[length:var(--text-sm)] font-bold leading-tight">{item.name}</span>
      {@render chargeDots(item)}
    </button>
  {:else}
    <div
      class="min-h-19 flex flex-col items-center justify-center gap-1 rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface)] p-[var(--sp-2)] text-center"
    >
      <span class="text-[length:var(--text-sm)] font-bold leading-tight">{item.name}</span>
    </div>
  {/if}
{/snippet}

{#snippet empty()}
  <div
    class="min-h-19 flex items-center justify-center rounded-[var(--radius-md)] border-2 border-dashed border-[var(--border-strong)] text-[var(--text-faint)] p-[var(--sp-2)]"
  ></div>
{/snippet}

<Modal {open} title={name} eyebrow={$_('inventory.heading')} {onclose}>
  <div class="flex flex-col gap-[var(--gap-stack)] pb-[var(--sp-5)]">
    <div class="font-[family-name:var(--font-mono)] text-[length:var(--text-sm)] text-[var(--text-secondary)]">
      {$_('inventory.slotsUsed', { values: { used, max: MAX_SLOTS } })}
    </div>

    <div>
      <div class="ww-label text-[length:var(--text-caption)] mb-1.5">{$_('inventory.paws')}</div>
      <div class="grid grid-cols-2 gap-2">
        {#each pawsCells as entry (entry.type === 'item' ? entry.item.id : entry.key)}
          {#if entry.type === 'item'}
            {@render cell(entry.item)}
          {:else}
            {@render empty()}
          {/if}
        {/each}
      </div>
    </div>

    <div>
      <div class="ww-label text-[length:var(--text-caption)] mb-1.5 mt-1">{$_('inventory.body')}</div>
      <div class="grid grid-cols-2 gap-2">
        {#each bodyCells as entry (entry.type === 'item' ? entry.item.id : entry.key)}
          {#if entry.type === 'item'}
            {@render cell(entry.item)}
          {:else}
            {@render empty()}
          {/if}
        {/each}
      </div>
    </div>

    {#if notice}
      <div class="flex items-center justify-between gap-2 border-t border-[var(--border)] pt-3">
        <span class="text-[length:var(--text-sm)] text-[var(--text-secondary)]">{notice.text}</span>
        {#if notice.undo}
          <button
            type="button"
            onclick={undoNotice}
            class="font-bold text-[var(--accent)] text-[length:var(--text-sm)] cursor-pointer bg-none border-none"
          >
            {$_('liveSession.undo')}
          </button>
        {/if}
      </div>
    {/if}
  </div>
</Modal>
