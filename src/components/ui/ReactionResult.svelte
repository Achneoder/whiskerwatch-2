<script lang="ts">
  import { _ } from 'svelte-i18n';
  import DiceRoll from './DiceRoll.svelte';
  import type { ReactionRollResult } from '../../lib/generators/reaction';

  interface Props {
    result: ReactionRollResult;
    size?: 'md' | 'live';
  }

  let { result, size = 'md' }: Props = $props();

  const label = $derived($_(`reaction.band.${result.band}`));
  const guidance = $derived($_(`reaction.guidance.${result.band}`));
</script>

<div class="flex flex-col items-center gap-[var(--sp-2)]">
  <DiceRoll dice={result.dice} total={result.total} outcome={result.band} {label} {size} />
  <p class="ww-label text-center max-w-60">{guidance}</p>
</div>
