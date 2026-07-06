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
  import SessionForm from '../forms/SessionForm.svelte';
  import {
    getSessions,
    addSession,
    updateSession,
    removeSession,
    getNextSessionNumber,
    type Session,
  } from '../../lib/stores/sessions.svelte';

  interface Props {
    onnavigate: (screen: NavScreen) => void;
    onstartsession?: () => void;
  }

  let { onnavigate, onstartsession }: Props = $props();

  const sessions = getSessions();
  const sorted = $derived([...sessions].sort((a, b) => b.number - a.number));

  let sessionModal = $state<{ mode: 'add' } | { mode: 'edit'; session: Session } | null>(null);
  let deleteTarget = $state<Session | null>(null);

  function saveSession(data: Omit<Session, 'id'>) {
    if (sessionModal?.mode === 'edit') updateSession(sessionModal.session.id, data);
    else addSession(data);
    sessionModal = null;
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    removeSession(deleteTarget.id);
    deleteTarget = null;
  }
</script>

<div class="flex min-h-screen bg-[var(--bg)] text-[var(--text)]">
  <AppSidebar active="sessions" {onnavigate} {onstartsession} />

  <main class="flex-1 p-[var(--sp-6)] max-w-[var(--content-max)] flex flex-col gap-[var(--sp-5)]">
    <header class="flex items-end justify-between gap-[var(--sp-4)] flex-wrap">
      <div>
        <div class="ww-label text-[var(--accent)]">{$_('sessions.eyebrow')}</div>
        <h1 class="text-[length:var(--text-h1)] mt-1">{$_('sessions.title')}</h1>
      </div>
      <Button variant="secondary" size="sm" onclick={() => (sessionModal = { mode: 'add' })}>
        {#snippet icon()}
          <Icon icon={Plus} />
        {/snippet}
        {$_('sessions.log')}
      </Button>
    </header>

    <div class="flex flex-col gap-[var(--sp-4)]">
      {#each sorted as session (session.id)}
        <Card>
          {#snippet actions()}
            <div class="flex gap-1 shrink-0">
              <button
                type="button"
                aria-label={$_('roster.edit')}
                onclick={() => (sessionModal = { mode: 'edit', session })}
                class="grid place-items-center w-8 h-8 rounded-[var(--radius-md)] text-[var(--text-muted)] hover:bg-[var(--surface-sunk)] cursor-pointer"
              >
                <Icon icon={Pencil} />
              </button>
              <button
                type="button"
                aria-label={$_('roster.delete')}
                onclick={() => (deleteTarget = session)}
                class="grid place-items-center w-8 h-8 rounded-[var(--radius-md)] text-[var(--danger)] hover:bg-[var(--danger-tint)] cursor-pointer"
              >
                <Icon icon={Trash2} />
              </button>
            </div>
          {/snippet}
          <div class="flex items-center gap-[var(--sp-3)] flex-wrap">
            <Tag tone="accent">#{session.number}</Tag>
            <span class="text-[length:var(--text-sm)] text-[var(--text-muted)]">{session.date}</span>
          </div>
          <div class="font-[family-name:var(--font-display)] font-bold text-[length:var(--text-title)] mt-1">
            {session.title}
          </div>
          {#if session.summary}
            <p class="mt-1 text-[var(--text-secondary)] text-[length:var(--text-body)]">{session.summary}</p>
          {/if}
        </Card>
      {/each}
      {#if sorted.length === 0}
        <p class="text-[var(--text-muted)] text-[length:var(--text-body)]">{$_('sessions.empty')}</p>
      {/if}
    </div>
  </main>
</div>

<Modal
  open={sessionModal !== null}
  title={sessionModal?.mode === 'edit' ? $_('sessions.editTitle') : $_('sessions.addTitle')}
  onclose={() => (sessionModal = null)}
>
  {#if sessionModal}
    <SessionForm
      initial={sessionModal.mode === 'edit' ? sessionModal.session : undefined}
      defaultNumber={getNextSessionNumber()}
      onsave={saveSession}
      oncancel={() => (sessionModal = null)}
    />
  {/if}
</Modal>

<ConfirmDialog
  open={deleteTarget !== null}
  title={$_('sessions.deleteTitle')}
  message={$_('sessions.deleteMessage', { values: { title: deleteTarget?.title ?? '' } })}
  confirmLabel={$_('roster.delete')}
  cancelLabel={$_('roster.form.cancel')}
  danger
  onconfirm={confirmDelete}
  oncancel={() => (deleteTarget = null)}
/>
