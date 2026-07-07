<script lang="ts">
  import { Plus, Pencil, Trash2 } from 'lucide-svelte';
  import { _ } from 'svelte-i18n';
  import StatusPill from '../ui/StatusPill.svelte';
  import Tag from '../ui/Tag.svelte';
  import Icon from '../ui/Icon.svelte';
  import BeatTree from './BeatTree.svelte';
  import type { Beat, BeatStatus } from '../../lib/stores/beats.svelte';
  import type { HexNode } from '../../lib/stores/hexmap.svelte';
  import type { Faction } from '../../lib/stores/factions.svelte';
  import { hexLabel } from '../../lib/hex';

  interface Props {
    beats: Beat[];
    hexNodes?: HexNode[];
    factions?: Faction[];
    parentId: string | null;
    depth?: number;
    onedit: (beat: Beat) => void;
    ondelete: (beat: Beat) => void;
    onaddchild: (parentId: string) => void;
    onstatuschange: (beat: Beat, status: BeatStatus) => void;
  }

  let { beats, hexNodes = [], factions = [], parentId, depth = 0, onedit, ondelete, onaddchild, onstatuschange }: Props = $props();

  const children = $derived(beats.filter((b) => b.parentId === parentId));

  function hexTagFor(beat: Beat): string | null {
    if (!beat.hexNodeId) return null;
    const node = hexNodes.find((h) => h.id === beat.hexNodeId);
    return node ? hexLabel(node.q, node.r) : null;
  }

  function factionTagsFor(beat: Beat): string[] {
    return beat.factionIds.map((id) => factions.find((f) => f.id === id)?.name).filter((name): name is string => !!name);
  }

  const nextStatus: Record<BeatStatus, BeatStatus> = {
    planned: 'active',
    active: 'done',
    done: 'planned',
  };

  const statusTone: Record<BeatStatus, 'neutral' | 'accent' | 'success'> = {
    planned: 'neutral',
    active: 'accent',
    done: 'success',
  };
</script>

{#each children as beat (beat.id)}
  <div style:margin-left="{depth * 24}px" class="flex flex-col gap-[var(--sp-2)]">
    <div class="flex items-center gap-[var(--sp-3)] py-2 border-b border-[var(--border)]">
      <button type="button" onclick={() => onstatuschange(beat, nextStatus[beat.status])} class="shrink-0">
        <StatusPill tone={statusTone[beat.status]} size="sm">{$_(`adventure.status.${beat.status}`)}</StatusPill>
      </button>
      <div class="flex-1 min-w-0">
        <div class="font-[family-name:var(--font-display)] font-bold text-[length:var(--text-title)]">{beat.title}</div>
        {#if beat.notes}
          <p class="text-[length:var(--text-sm)] text-[var(--text-muted)] mt-0.5 line-clamp-2">{beat.notes}</p>
        {/if}
        {#if hexTagFor(beat) || factionTagsFor(beat).length > 0}
          <div class="flex gap-1 flex-wrap mt-1">
            {#if hexTagFor(beat)}
              <Tag size="sm">{hexTagFor(beat)}</Tag>
            {/if}
            {#each factionTagsFor(beat) as name (name)}
              <Tag size="sm" tone="accent">{name}</Tag>
            {/each}
          </div>
        {/if}
      </div>
      <div class="flex gap-1 shrink-0">
        <button
          type="button"
          aria-label={$_('adventure.addSubBeat')}
          onclick={() => onaddchild(beat.id)}
          class="grid place-items-center w-8 h-8 rounded-[var(--radius-md)] text-[var(--accent)] hover:bg-[var(--accent-tint)] cursor-pointer"
        >
          <Icon icon={Plus} />
        </button>
        <button
          type="button"
          aria-label={$_('roster.edit')}
          onclick={() => onedit(beat)}
          class="grid place-items-center w-8 h-8 rounded-[var(--radius-md)] text-[var(--text-muted)] hover:bg-[var(--surface-sunk)] cursor-pointer"
        >
          <Icon icon={Pencil} />
        </button>
        <button
          type="button"
          aria-label={$_('roster.delete')}
          onclick={() => ondelete(beat)}
          class="grid place-items-center w-8 h-8 rounded-[var(--radius-md)] text-[var(--danger)] hover:bg-[var(--danger-tint)] cursor-pointer"
        >
          <Icon icon={Trash2} />
        </button>
      </div>
    </div>
    <BeatTree
      {beats}
      {hexNodes}
      {factions}
      parentId={beat.id}
      depth={depth + 1}
      {onedit}
      {ondelete}
      {onaddchild}
      {onstatuschange}
    />
  </div>
{/each}
