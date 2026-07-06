<script lang="ts">
  import { Plus, Pencil, Trash2 } from 'lucide-svelte';
  import { _ } from 'svelte-i18n';
  import AppSidebar, { type NavScreen } from '../layout/AppSidebar.svelte';
  import Button from '../ui/Button.svelte';
  import Card from '../ui/Card.svelte';
  import Tag from '../ui/Tag.svelte';
  import Icon from '../ui/Icon.svelte';
  import Modal from '../ui/Modal.svelte';
  import ConfirmDialog from '../ui/ConfirmDialog.svelte';
  import BestiaryForm from '../forms/BestiaryForm.svelte';
  import { getBestiary, addBestiaryEntry, updateBestiaryEntry, removeBestiaryEntry, type BestiaryEntry } from '../../lib/stores/bestiary.svelte';

  interface Props {
    onnavigate: (screen: NavScreen) => void;
    onstartsession?: () => void;
  }

  let { onnavigate, onstartsession }: Props = $props();

  const bestiary = getBestiary();

  let entryModal = $state<{ mode: 'add' } | { mode: 'edit'; entry: BestiaryEntry } | null>(null);
  let deleteTarget = $state<BestiaryEntry | null>(null);

  function saveEntry(data: Omit<BestiaryEntry, 'id'>) {
    if (entryModal?.mode === 'edit') updateBestiaryEntry(entryModal.entry.id, data);
    else addBestiaryEntry(data);
    entryModal = null;
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    removeBestiaryEntry(deleteTarget.id);
    deleteTarget = null;
  }
</script>

<div class="flex flex-col md:flex-row min-h-screen bg-[var(--bg)] text-[var(--text)]">
  <AppSidebar active="bestiary" {onnavigate} {onstartsession} />

  <main class="flex-1 p-[var(--sp-6)] max-w-[var(--content-max)] flex flex-col gap-[var(--sp-5)]">
    <header class="flex items-end justify-between gap-[var(--sp-4)] flex-wrap">
      <div>
        <div class="ww-label text-[var(--accent)]">{$_('bestiary.eyebrow')}</div>
        <h1 class="text-[length:var(--text-h1)] mt-1">{$_('bestiary.title')}</h1>
      </div>
      <Button variant="secondary" size="sm" onclick={() => (entryModal = { mode: 'add' })}>
        {#snippet icon()}
          <Icon icon={Plus} />
        {/snippet}
        {$_('bestiary.add')}
      </Button>
    </header>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-[var(--sp-4)]">
      {#each bestiary as entry (entry.id)}
        <Card>
          {#snippet actions()}
            <div class="flex gap-1 shrink-0">
              <button
                type="button"
                aria-label={$_('roster.edit')}
                onclick={() => (entryModal = { mode: 'edit', entry })}
                class="grid place-items-center w-8 h-8 rounded-[var(--radius-md)] text-[var(--text-muted)] hover:bg-[var(--surface-sunk)] cursor-pointer"
              >
                <Icon icon={Pencil} />
              </button>
              <button
                type="button"
                aria-label={$_('roster.delete')}
                onclick={() => (deleteTarget = entry)}
                class="grid place-items-center w-8 h-8 rounded-[var(--radius-md)] text-[var(--danger)] hover:bg-[var(--danger-tint)] cursor-pointer"
              >
                <Icon icon={Trash2} />
              </button>
            </div>
          {/snippet}
          <div class="flex items-center gap-2 flex-wrap">
            <div class="font-[family-name:var(--font-display)] font-bold text-[length:var(--text-title)]">{entry.name}</div>
            <Tag tone="default">{$_(`bestiary.category.${entry.category}`)}</Tag>
          </div>
          <div class="ww-num flex gap-[var(--sp-4)] mt-2 text-[length:var(--text-sm)]">
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
        </Card>
      {/each}
      {#if bestiary.length === 0}
        <p class="text-[var(--text-muted)] text-[length:var(--text-body)]">{$_('bestiary.empty')}</p>
      {/if}
    </div>
  </main>
</div>

<Modal
  open={entryModal !== null}
  title={entryModal?.mode === 'edit' ? $_('bestiary.editTitle') : $_('bestiary.addTitle')}
  onclose={() => (entryModal = null)}
>
  {#if entryModal}
    <BestiaryForm
      initial={entryModal.mode === 'edit' ? entryModal.entry : undefined}
      onsave={saveEntry}
      oncancel={() => (entryModal = null)}
    />
  {/if}
</Modal>

<ConfirmDialog
  open={deleteTarget !== null}
  title={$_('bestiary.deleteTitle')}
  message={$_('bestiary.deleteMessage', { values: { name: deleteTarget?.name ?? '' } })}
  confirmLabel={$_('roster.delete')}
  cancelLabel={$_('roster.form.cancel')}
  danger
  onconfirm={confirmDelete}
  oncancel={() => (deleteTarget = null)}
/>
