<script lang="ts">
  import { Plus, Pencil, Trash2 } from 'lucide-svelte';
  import { _ } from 'svelte-i18n';
  import AppSidebar, { type NavScreen } from '../layout/AppSidebar.svelte';
  import Button from '../ui/Button.svelte';
  import Card from '../ui/Card.svelte';
  import StatusPill from '../ui/StatusPill.svelte';
  import Icon from '../ui/Icon.svelte';
  import Modal from '../ui/Modal.svelte';
  import ConfirmDialog from '../ui/ConfirmDialog.svelte';
  import AdventureForm from '../forms/AdventureForm.svelte';
  import BeatForm from '../forms/BeatForm.svelte';
  import BeatTree from './BeatTree.svelte';
  import {
    getAdventures,
    addAdventure,
    updateAdventure,
    removeAdventure,
    flush as flushAdventures,
    type Adventure,
    type AdventureStatus,
  } from '../../lib/stores/adventures.svelte';
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

  const adventures = getAdventures();
  const beats = getBeats();
  const hexNodes = getHexNodes();
  const factions = getFactions();

  let adventureModal = $state<{ mode: 'add' } | { mode: 'edit'; entry: Adventure } | null>(null);
  let deleteAdventureTarget = $state<Adventure | null>(null);

  // A beat "add" always knows which adventure it belongs to — the GM never
  // picks one explicitly (see `onAddChild` below for the sub-beat case,
  // which inherits its parent beat's adventure instead of asking again).
  let beatModal = $state<
    | { mode: 'add'; adventureId: string; parentId: string | null }
    | { mode: 'edit'; beat: Beat }
    | null
  >(null);
  let deleteBeatTarget = $state<Beat | null>(null);

  const statusTone: Record<AdventureStatus, 'neutral' | 'accent' | 'success'> = {
    planned: 'neutral',
    active: 'accent',
    completed: 'success',
  };

  function beatsFor(adventureId: string): Beat[] {
    return beats.filter((b) => b.adventureId === adventureId);
  }

  // A sub-beat inherits the adventure of the beat it's nested under, rather
  // than the GM having to pick it again.
  function onAddChild(adventureId: string, parentId: string) {
    const parentBeat = beats.find((b) => b.id === parentId);
    beatModal = { mode: 'add', adventureId: parentBeat?.adventureId ?? adventureId, parentId };
  }

  // Awaits `flush()` after the mutation so a GM who refreshes right after
  // saving/deleting never loses the change — see the equivalent note in
  // Roster.svelte.
  async function saveAdventure(data: Omit<Adventure, 'id'>) {
    if (adventureModal?.mode === 'edit') updateAdventure(adventureModal.entry.id, data);
    else addAdventure(data);
    await flushAdventures();
    adventureModal = null;
  }

  async function confirmDeleteAdventure() {
    if (!deleteAdventureTarget) return;
    const id = deleteAdventureTarget.id;
    removeAdventure(id);
    // Cascade: an adventure's beat outline can't outlive its adventure.
    beats.filter((b) => b.adventureId === id).forEach((b) => removeBeat(b.id));
    await Promise.all([flushAdventures(), flushBeats()]);
    deleteAdventureTarget = null;
  }

  async function saveBeat(data: { title: string; notes: string; status: BeatStatus; hexNodeId: string | null; factionIds: string[] }) {
    if (beatModal?.mode === 'edit') updateBeat(beatModal.beat.id, data);
    else if (beatModal) addBeat({ ...data, parentId: beatModal.parentId, adventureId: beatModal.adventureId });
    await flushBeats();
    beatModal = null;
  }

  async function confirmDeleteBeat() {
    if (!deleteBeatTarget) return;
    removeBeat(deleteBeatTarget.id);
    await flushBeats();
    deleteBeatTarget = null;
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
      <Button variant="secondary" size="sm" onclick={() => (adventureModal = { mode: 'add' })}>
        {#snippet icon()}
          <Icon icon={Plus} />
        {/snippet}
        {$_('adventure.addAdventure')}
      </Button>
    </header>

    {#if adventures.length === 0}
      <div class="bg-[var(--surface-raised)] border border-[var(--border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-md)] p-[var(--pad-card)]">
        <p class="text-[var(--text-muted)] text-[length:var(--text-body)]">{$_('adventure.emptyAdventures')}</p>
      </div>
    {:else}
      <div class="flex flex-col gap-[var(--sp-4)]">
        {#each adventures as adventure (adventure.id)}
          <Card>
            {#snippet actions()}
              <div class="flex gap-1 shrink-0">
                <button
                  type="button"
                  aria-label={$_('roster.edit')}
                  onclick={() => (adventureModal = { mode: 'edit', entry: adventure })}
                  class="grid place-items-center w-8 h-8 rounded-[var(--radius-md)] text-[var(--text-muted)] hover:bg-[var(--surface-sunk)] cursor-pointer"
                >
                  <Icon icon={Pencil} />
                </button>
                <button
                  type="button"
                  aria-label={$_('roster.delete')}
                  onclick={() => (deleteAdventureTarget = adventure)}
                  class="grid place-items-center w-8 h-8 rounded-[var(--radius-md)] text-[var(--danger)] hover:bg-[var(--danger-tint)] cursor-pointer"
                >
                  <Icon icon={Trash2} />
                </button>
              </div>
            {/snippet}

            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-[family-name:var(--font-display)] font-bold text-[length:var(--text-title)]">{adventure.title}</span>
              <StatusPill tone={statusTone[adventure.status]} size="sm">
                {$_(`adventure.adventureStatus.${adventure.status}`)}
              </StatusPill>
            </div>
            {#if adventure.description}
              <p class="mt-1 text-[var(--text-secondary)] text-[length:var(--text-body)]">{adventure.description}</p>
            {/if}

            <div class="flex items-center justify-between gap-[var(--sp-3)] mt-[var(--sp-4)] flex-wrap">
              <span class="ww-label">{$_('adventure.beatOutline')}</span>
              <Button
                variant="secondary"
                size="sm"
                onclick={() => (beatModal = { mode: 'add', adventureId: adventure.id, parentId: null })}
              >
                {#snippet icon()}
                  <Icon icon={Plus} />
                {/snippet}
                {$_('adventure.addBeat')}
              </Button>
            </div>

            {#if beatsFor(adventure.id).length === 0}
              <p class="mt-2 text-[var(--text-muted)] text-[length:var(--text-body)]">{$_('adventure.empty')}</p>
            {:else}
              <div class="mt-2">
                <BeatTree
                  beats={beatsFor(adventure.id)}
                  {hexNodes}
                  {factions}
                  parentId={null}
                  onedit={(beat) => (beatModal = { mode: 'edit', beat })}
                  ondelete={(beat) => (deleteBeatTarget = beat)}
                  onaddchild={(parentId) => onAddChild(adventure.id, parentId)}
                  onstatuschange={(beat, status) => updateBeat(beat.id, { status })}
                />
              </div>
            {/if}
          </Card>
        {/each}
      </div>
    {/if}
  </main>
</div>

<Modal
  open={adventureModal !== null}
  title={adventureModal?.mode === 'edit' ? $_('adventure.editAdventureTitle') : $_('adventure.addAdventureTitle')}
  onclose={() => (adventureModal = null)}
>
  {#if adventureModal}
    <AdventureForm
      initial={adventureModal.mode === 'edit' ? adventureModal.entry : undefined}
      onsave={saveAdventure}
      oncancel={() => (adventureModal = null)}
    />
  {/if}
</Modal>

<ConfirmDialog
  open={deleteAdventureTarget !== null}
  title={$_('adventure.deleteAdventureTitle')}
  message={$_('adventure.deleteAdventureMessage', { values: { title: deleteAdventureTarget?.title ?? '' } })}
  confirmLabel={$_('roster.delete')}
  cancelLabel={$_('roster.form.cancel')}
  danger
  onconfirm={confirmDeleteAdventure}
  oncancel={() => (deleteAdventureTarget = null)}
/>

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
  open={deleteBeatTarget !== null}
  title={$_('adventure.deleteTitle')}
  message={getDescendantCount(deleteBeatTarget?.id ?? '') > 0
    ? $_('adventure.deleteMessageWithChildren', {
        values: { title: deleteBeatTarget?.title ?? '', count: getDescendantCount(deleteBeatTarget?.id ?? '') },
      })
    : $_('adventure.deleteMessage', { values: { title: deleteBeatTarget?.title ?? '' } })}
  confirmLabel={$_('roster.delete')}
  cancelLabel={$_('roster.form.cancel')}
  danger
  onconfirm={confirmDeleteBeat}
  oncancel={() => (deleteBeatTarget = null)}
/>
