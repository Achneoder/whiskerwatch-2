<script lang="ts">
  import { Swords } from 'lucide-svelte';
  import { _ } from 'svelte-i18n';
  import Card from '../ui/Card.svelte';
  import Button from '../ui/Button.svelte';
  import Icon from '../ui/Icon.svelte';
  import StatBlock from '../ui/StatBlock.svelte';
  import ReactionResult from '../ui/ReactionResult.svelte';
  import type { BestiaryEntry } from '../../lib/stores/bestiary.svelte';
  import type { ReactionRollResult } from '../../lib/generators/reaction';

  interface Props {
    hexName: string;
    hasBestiary: boolean;
    encounterResult: BestiaryEntry | null;
    reactionResult: ReactionRollResult | null;
    onrollencounter: () => void;
    onrollreaction: () => void;
  }

  let { hexName, hasBestiary, encounterResult, reactionResult, onrollencounter, onrollreaction }: Props = $props();
</script>

<Card eyebrow={$_('liveSession.encounter.eyebrow')} title={hexName}>
  <div class="flex flex-col gap-[var(--sp-3)]">
    {#if !hasBestiary}
      <p class="text-[length:var(--text-sm)] text-[var(--text-muted)]">{$_('generators.encounter.noBestiary')}</p>
    {:else}
      <Button variant="secondary" size="live" onclick={onrollencounter}>
        {#snippet icon()}
          <Icon icon={Swords} />
        {/snippet}
        {$_('liveSession.encounter.roll')}
      </Button>
      {#if encounterResult}
        <div class="bg-[var(--surface-sunk)] rounded-[var(--radius-md)] p-[var(--sp-3)] flex flex-col gap-[var(--sp-3)]">
          <StatBlock entry={encounterResult} statGap="var(--sp-3)" />
          <Button variant="primary" size="live" onclick={onrollreaction}>
            {$_('liveSession.reaction.roll')}
          </Button>
          {#if reactionResult}
            <ReactionResult result={reactionResult} size="live" />
          {/if}
        </div>
      {/if}
    {/if}
  </div>
</Card>
