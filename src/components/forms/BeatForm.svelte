<script lang="ts">
  import { X } from 'lucide-svelte';
  import { _ } from 'svelte-i18n';
  import Input from '../ui/Input.svelte';
  import Textarea from '../ui/Textarea.svelte';
  import Button from '../ui/Button.svelte';
  import Icon from '../ui/Icon.svelte';
  import type { Beat, BeatStatus } from '../../lib/stores/beats.svelte';
  import type { HexNode } from '../../lib/stores/hexmap.svelte';
  import type { Faction } from '../../lib/stores/factions.svelte';
  import { hexLabel } from '../../lib/hex';

  interface Props {
    initial?: Beat | undefined;
    hexNodes?: HexNode[];
    factions?: Faction[];
    onsave: (data: { title: string; notes: string; status: BeatStatus; hexNodeId: string | null; factionIds: string[] }) => void;
    oncancel: () => void;
  }

  let { initial, hexNodes = [], factions = [], onsave, oncancel }: Props = $props();

  let title = $state(initial?.title ?? '');
  let notes = $state(initial?.notes ?? '');
  let status = $state<BeatStatus>(initial?.status ?? 'planned');
  let hexNodeId = $state<string | null>(initial?.hexNodeId ?? null);
  let factionIds = $state<string[]>(initial ? [...initial.factionIds] : []);
  let newFactionId = $state('');

  function hexOptionLabel(node: HexNode): string {
    const label = hexLabel(node.q, node.r);
    return node.name ? `${label} · ${node.name}` : label;
  }

  const linkedFactions = $derived(factions.filter((f) => factionIds.includes(f.id)));
  const availableFactions = $derived(factions.filter((f) => !factionIds.includes(f.id)));

  function addFactionLink() {
    if (!newFactionId) return;
    factionIds.push(newFactionId);
    newFactionId = '';
  }

  function removeFactionLink(id: string) {
    factionIds = factionIds.filter((f) => f !== id);
  }

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    onsave({ title: title.trim(), notes: notes.trim(), status, hexNodeId, factionIds });
  }
</script>

<form onsubmit={handleSubmit} class="flex flex-col gap-[var(--sp-4)]">
  <Input label={$_('adventure.form.title')} bind:value={title} required />
  <Textarea label={$_('adventure.form.notes')} bind:value={notes} rows={4} />

  <div class="flex flex-col gap-1.5">
    <span class="ww-label">{$_('adventure.form.status')}</span>
    <select
      bind:value={status}
      class="h-[var(--tap)] rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface-raised)] px-[var(--pad-control-x)] text-[length:var(--text-body)] w-fit"
    >
      <option value="planned">{$_('adventure.status.planned')}</option>
      <option value="active">{$_('adventure.status.active')}</option>
      <option value="done">{$_('adventure.status.done')}</option>
    </select>
  </div>

  <div class="flex flex-col gap-1.5">
    <span class="ww-label">{$_('adventure.form.hexLink')}</span>
    <select
      bind:value={hexNodeId}
      aria-label={$_('adventure.form.hexLink')}
      class="h-[var(--tap)] rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface-raised)] px-[var(--pad-control-x)] text-[length:var(--text-body)] w-fit max-w-full"
    >
      <option value={null}>{$_('adventure.form.hexLinkNone')}</option>
      {#each hexNodes as node (node.id)}
        <option value={node.id}>{hexOptionLabel(node)}</option>
      {/each}
    </select>
  </div>

  <div class="flex flex-col gap-2">
    <span class="ww-label">{$_('adventure.form.factions')}</span>
    {#if linkedFactions.length > 0}
      <ul class="flex gap-1.5 flex-wrap">
        {#each linkedFactions as faction (faction.id)}
          <li
            class="flex items-center gap-1 py-1 px-2 bg-[var(--surface-sunk)] rounded-[var(--radius-sm)] text-[length:var(--text-sm)]"
          >
            {faction.name}
            <button
              type="button"
              aria-label={$_('roster.delete')}
              onclick={() => removeFactionLink(faction.id)}
              class="grid place-items-center w-5 h-5 rounded-[var(--radius-sm)] text-[var(--danger)] hover:bg-[var(--danger-tint)] cursor-pointer"
            >
              <Icon icon={X} />
            </button>
          </li>
        {/each}
      </ul>
    {/if}
    {#if availableFactions.length > 0}
      <div class="flex gap-2 flex-wrap">
        <select
          bind:value={newFactionId}
          aria-label={$_('adventure.form.factionsPlaceholder')}
          class="h-[var(--tap)] flex-1 min-w-30 rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface-raised)] px-[var(--pad-control-x)] text-[length:var(--text-body)]"
        >
          <option value="" disabled>{$_('adventure.form.factionsPlaceholder')}</option>
          {#each availableFactions as f (f.id)}
            <option value={f.id}>{f.name}</option>
          {/each}
        </select>
        <Button type="button" variant="secondary" size="sm" onclick={addFactionLink}>
          {$_('adventure.form.addFactionLink')}
        </Button>
      </div>
    {/if}
  </div>

  <div class="flex justify-end gap-[var(--gap-inline)] pt-[var(--sp-2)]">
    <Button type="button" variant="ghost" onclick={oncancel}>{$_('roster.form.cancel')}</Button>
    <Button type="submit" variant="primary">{$_('roster.form.save')}</Button>
  </div>
</form>
