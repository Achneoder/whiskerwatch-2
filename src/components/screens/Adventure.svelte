<script lang="ts">
  import { Plus } from 'lucide-svelte';
  import { _ } from 'svelte-i18n';
  import AppSidebar, { type NavScreen } from '../layout/AppSidebar.svelte';
  import Button from '../ui/Button.svelte';
  import Icon from '../ui/Icon.svelte';
  import Modal from '../ui/Modal.svelte';
  import ConfirmDialog from '../ui/ConfirmDialog.svelte';
  import BeatForm from '../forms/BeatForm.svelte';
  import BeatTree from './BeatTree.svelte';
  import {
    getBeats,
    addBeat,
    updateBeat,
    removeBeat,
    getDescendantCount,
    flush as flushBeats,
    type Beat,
    type BeatStatus,
  } from '../../lib/stores/beats.svelte';
  import { getHexNodes } from '../../lib/stores/hexmap.svelte';
  import { getFactions } from '../../lib/stores/factions.svelte';

  interface Props {
    onnavigate: (screen: NavScreen) => void;
    onstartsession?: () => void;
  }

  let { onnavigate, onstartsession }: Props = $props();

  const beats = getBeats();
  const hexNodes = getHexNodes();
  const factions = getFactions();

  let beatModal = $state<{ mode: 'add'; parentId: string | null } | { mode: 'edit'; beat: Beat } | null>(null);
  let deleteTarget = $state<Beat | null>(null);

  // Awaits `flush()` after the mutation so a GM who refreshes right after
  // saving/deleting never loses the change — see the equivalent note in
  // Roster.svelte.
  async function saveBeat(data: { title: string; notes: string; status: BeatStatus; hexNodeId: string | null; factionIds: string[] }) {
    if (beatModal?.mode === 'edit') updateBeat(beatModal.beat.id, data);
    else if (beatModal) addBeat({ ...data, parentId: beatModal.parentId });
    await flushBeats();
    beatModal = null;
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    removeBeat(deleteTarget.id);
    await flushBeats();
    deleteTarget = null;
  }
</script>

<div class="flex flex-col md:flex-row min-h-screen bg-[var(--bg)] text-[var(--text)]">
  <AppSidebar active="adventure" {onnavigate} {onstartsession} />

  <main class="flex-1 p-[var(--sp-6)] max-w-[var(--content-max)] flex flex-col gap-[var(--sp-5)]">
    <header class="flex items-end justify-between gap-[var(--sp-4)] flex-wrap">
      <div>
        <div class="ww-label text-[var(--accent)]">{$_('adventure.eyebrow')}</div>
        <h1 class="text-[length:var(--text-h1)] mt-1">{$_('adventure.title')}</h1>
      </div>
      <Button variant="secondary" size="sm" onclick={() => (beatModal = { mode: 'add', parentId: null })}>
        {#snippet icon()}
          <Icon icon={Plus} />
        {/snippet}
        {$_('adventure.addBeat')}
      </Button>
    </header>

    <div class="bg-[var(--surface-raised)] border border-[var(--border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-md)] p-[var(--pad-card)]">
      {#if beats.length === 0}
        <p class="text-[var(--text-muted)] text-[length:var(--text-body)]">{$_('adventure.empty')}</p>
      {:else}
        <BeatTree
          {beats}
          {hexNodes}
          {factions}
          parentId={null}
          onedit={(beat) => (beatModal = { mode: 'edit', beat })}
          ondelete={(beat) => (deleteTarget = beat)}
          onaddchild={(parentId) => (beatModal = { mode: 'add', parentId })}
          onstatuschange={(beat, status) => updateBeat(beat.id, { status })}
        />
      {/if}
    </div>
  </main>
</div>

<Modal
  open={beatModal !== null}
  title={beatModal?.mode === 'edit' ? $_('adventure.editTitle') : $_('adventure.addTitle')}
  onclose={() => (beatModal = null)}
>
  {#if beatModal}
    <BeatForm
      initial={beatModal.mode === 'edit' ? beatModal.beat : undefined}
      {hexNodes}
      {factions}
      onsave={saveBeat}
      oncancel={() => (beatModal = null)}
    />
  {/if}
</Modal>

<ConfirmDialog
  open={deleteTarget !== null}
  title={$_('adventure.deleteTitle')}
  message={getDescendantCount(deleteTarget?.id ?? '') > 0
    ? $_('adventure.deleteMessageWithChildren', {
        values: { title: deleteTarget?.title ?? '', count: getDescendantCount(deleteTarget?.id ?? '') },
      })
    : $_('adventure.deleteMessage', { values: { title: deleteTarget?.title ?? '' } })}
  confirmLabel={$_('roster.delete')}
  cancelLabel={$_('roster.form.cancel')}
  danger
  onconfirm={confirmDelete}
  oncancel={() => (deleteTarget = null)}
/>
