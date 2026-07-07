<script lang="ts">
  import { _ } from 'svelte-i18n';
  import Tag from './Tag.svelte';
  import type { BestiaryEntry } from '../../lib/stores/bestiary.svelte';

  interface Props {
    entry: BestiaryEntry;
    statGap?: string;
  }

  let { entry, statGap = 'var(--sp-4)' }: Props = $props();
</script>

<div>
  <div class="flex items-center gap-2 flex-wrap">
    <div class="font-[family-name:var(--font-display)] font-bold text-[length:var(--text-title)]">{entry.name}</div>
    <Tag tone="default">{$_(`bestiary.category.${entry.category}`)}</Tag>
  </div>
  <div class="ww-num flex mt-2 text-[length:var(--text-sm)]" style:gap={statGap}>
    <span><span class="ww-label">{$_('bestiary.form.hd')}</span> {entry.hd}</span>
    <span><span class="ww-label">{$_('bestiary.form.hp')}</span> {entry.hp}</span>
    <span><span class="ww-label">{$_('bestiary.form.armor')}</span> {entry.armor}</span>
  </div>
  {#if entry.attacks.length > 0}
    <p class="mt-2 text-[length:var(--text-body)] text-[var(--text-secondary)]">
      {#each entry.attacks as attack, i (attack.name + i)}<strong class="font-semibold">{attack.name}</strong> ({attack.damage}){i <
        entry.attacks.length - 1
          ? ', '
          : ''}{/each}
    </p>
  {/if}
  {#if entry.special}
    <p class="mt-1 text-[length:var(--text-sm)] text-[var(--text-muted)]">{entry.special}</p>
  {/if}
  {#if entry.notes}
    <p class="mt-1 text-[length:var(--text-sm)] text-[var(--text-faint)] italic">{entry.notes}</p>
  {/if}
</div>
