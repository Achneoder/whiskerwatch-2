<script lang="ts">
  import { Plus, Pencil, Trash2, Download, Upload } from 'lucide-svelte';
  import { _ } from 'svelte-i18n';
  import AppSidebar, { type NavScreen } from '../layout/AppSidebar.svelte';
  import Button from '../ui/Button.svelte';
  import Card from '../ui/Card.svelte';
  import HpBar from '../ui/HpBar.svelte';
  import StatusPill from '../ui/StatusPill.svelte';
  import Tag from '../ui/Tag.svelte';
  import Modal from '../ui/Modal.svelte';
  import ConfirmDialog from '../ui/ConfirmDialog.svelte';
  import Icon from '../ui/Icon.svelte';
  import PartyForm from '../forms/PartyForm.svelte';
  import HirelingForm from '../forms/HirelingForm.svelte';
  import { getParty, addMember, updateMember, removeMember, type PartyMember } from '../../lib/stores/party.svelte';
  import {
    getHirelings,
    addHireling,
    updateHireling,
    removeHireling,
    type Hireling,
  } from '../../lib/stores/hirelings.svelte';
  import { CONDITIONS } from '../../lib/conditions';
  import { exportCampaign, importCampaign } from '../../lib/campaignExport';

  interface Props {
    onnavigate: (screen: NavScreen) => void;
    onstartsession?: () => void;
  }

  let { onnavigate, onstartsession }: Props = $props();

  const party = getParty();
  const hirelings = getHirelings();

  let memberModal = $state<{ mode: 'add' } | { mode: 'edit'; member: PartyMember } | null>(null);
  let hirelingModal = $state<{ mode: 'add' } | { mode: 'edit'; hireling: Hireling } | null>(null);
  let deleteMemberTarget = $state<PartyMember | null>(null);
  let deleteHirelingTarget = $state<Hireling | null>(null);
  let importError = $state<string | null>(null);
  let fileInput = $state<HTMLInputElement | undefined>(undefined);

  function saveMember(data: Omit<PartyMember, 'id'>) {
    if (memberModal?.mode === 'edit') updateMember(memberModal.member.id, data);
    else addMember(data);
    memberModal = null;
  }

  function saveHireling(data: Omit<Hireling, 'id'>) {
    if (hirelingModal?.mode === 'edit') updateHireling(hirelingModal.hireling.id, data);
    else addHireling(data);
    hirelingModal = null;
  }

  function confirmDeleteMember() {
    if (!deleteMemberTarget) return;
    removeMember(deleteMemberTarget.id);
    deleteMemberTarget = null;
  }

  function confirmDeleteHireling() {
    if (!deleteHirelingTarget) return;
    removeHireling(deleteHirelingTarget.id);
    deleteHirelingTarget = null;
  }

  function triggerImport() {
    importError = null;
    fileInput?.click();
  }

  async function handleImportFile(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    try {
      await importCampaign(file);
      importError = null;
    } catch (error) {
      importError = error instanceof Error ? error.message : String(error);
    }
  }
</script>

<div class="flex flex-col md:flex-row min-h-screen bg-[var(--bg)] text-[var(--text)]">
  <AppSidebar active="warband" {onnavigate} {onstartsession} />

  <main class="flex-1 p-[var(--sp-6)] max-w-[var(--content-max)] flex flex-col gap-[var(--sp-5)]">
    <header class="flex items-end justify-between gap-[var(--sp-4)] flex-wrap">
      <div>
        <div class="ww-label text-[var(--accent)]">{$_('roster.eyebrow')}</div>
        <h1 class="text-[length:var(--text-h1)] mt-1">{$_('roster.title')}</h1>
      </div>
      <div class="flex gap-[var(--gap-inline)]">
        <Button variant="secondary" size="sm" onclick={exportCampaign}>
          {#snippet icon()}
            <Icon icon={Download} />
          {/snippet}
          {$_('roster.export')}
        </Button>
        <Button variant="secondary" size="sm" onclick={triggerImport}>
          {#snippet icon()}
            <Icon icon={Upload} />
          {/snippet}
          {$_('roster.import')}
        </Button>
        <input bind:this={fileInput} type="file" accept="application/json" class="hidden" onchange={handleImportFile} />
      </div>
    </header>

    {#if importError}
      <div
        class="rounded-[var(--radius-md)] border border-[var(--danger)] bg-[var(--danger-tint)] text-[var(--danger-hover)] px-[var(--sp-4)] py-[var(--sp-3)] text-[length:var(--text-body)]"
      >
        {importError}
      </div>
    {/if}

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-[var(--sp-5)] items-start">
      <!-- Warband -->
      <Card eyebrow={$_('roster.warband.eyebrow')} title={$_('roster.warband.title')}>
        {#snippet actions()}
          <Button variant="secondary" size="sm" onclick={() => (memberModal = { mode: 'add' })}>
            {#snippet icon()}
              <Icon icon={Plus} />
            {/snippet}
            {$_('roster.warband.add')}
          </Button>
        {/snippet}
        <div class="flex flex-col gap-[var(--sp-3)]">
          {#each party as member (member.id)}
            <div class="flex flex-wrap items-center gap-x-[var(--sp-4)] gap-y-2 py-2 border-b border-[var(--border)]">
              <div class="min-w-23">
                <div class="font-[family-name:var(--font-display)] font-bold text-[length:var(--text-title)]">
                  {member.name}
                </div>
                <div class="text-[length:var(--text-sm)] text-[var(--text-muted)]">{member.role}</div>
              </div>
              <div class="flex-1 min-w-35"><HpBar value={member.hp} max={member.max} label={$_('roster.form.hp')} size="sm" /></div>
              <div class="flex gap-1.5 shrink-0">
                {#each member.conditions as cond (cond)}
                  <StatusPill tone={CONDITIONS[cond].tone} size="sm">{CONDITIONS[cond].label}</StatusPill>
                {/each}
              </div>
              <div class="flex gap-1 shrink-0">
                <button
                  type="button"
                  aria-label={$_('roster.edit')}
                  onclick={() => (memberModal = { mode: 'edit', member })}
                  class="grid place-items-center w-8 h-8 rounded-[var(--radius-md)] text-[var(--text-muted)] hover:bg-[var(--surface-sunk)] cursor-pointer"
                >
                  <Icon icon={Pencil} />
                </button>
                <button
                  type="button"
                  aria-label={$_('roster.delete')}
                  onclick={() => (deleteMemberTarget = member)}
                  class="grid place-items-center w-8 h-8 rounded-[var(--radius-md)] text-[var(--danger)] hover:bg-[var(--danger-tint)] cursor-pointer"
                >
                  <Icon icon={Trash2} />
                </button>
              </div>
            </div>
          {/each}
          {#if party.length === 0}
            <p class="text-[var(--text-muted)] text-[length:var(--text-body)]">{$_('roster.warband.empty')}</p>
          {/if}
        </div>
      </Card>

      <!-- Hirelings -->
      <Card eyebrow={$_('roster.hirelings.eyebrow')} title={$_('roster.hirelings.title')}>
        {#snippet actions()}
          <Button variant="secondary" size="sm" onclick={() => (hirelingModal = { mode: 'add' })}>
            {#snippet icon()}
              <Icon icon={Plus} />
            {/snippet}
            {$_('roster.hirelings.add')}
          </Button>
        {/snippet}
        <div class="flex flex-col gap-[var(--sp-3)]">
          {#each hirelings as hireling (hireling.id)}
            <div class="flex flex-wrap items-center gap-x-[var(--sp-4)] gap-y-2 py-2 border-b border-[var(--border)]">
              <div class="min-w-23">
                <div class="font-[family-name:var(--font-display)] font-bold text-[length:var(--text-title)]">
                  {hireling.name}
                </div>
                <div class="flex items-center gap-1.5 text-[length:var(--text-sm)] text-[var(--text-muted)]">
                  <span>{hireling.role}</span>
                  {#if hireling.wage > 0}
                    <Tag size="sm">{hireling.wage}p/day</Tag>
                  {/if}
                </div>
              </div>
              <div class="flex-1 min-w-35"><HpBar value={hireling.hp} max={hireling.max} label={$_('roster.form.hp')} size="sm" /></div>
              <div class="shrink-0">
                <StatusPill tone="accent" size="sm" count={hireling.loyalty}>{$_('roster.form.loyalty')}</StatusPill>
              </div>
              <div class="flex gap-1 shrink-0">
                <button
                  type="button"
                  aria-label={$_('roster.edit')}
                  onclick={() => (hirelingModal = { mode: 'edit', hireling })}
                  class="grid place-items-center w-8 h-8 rounded-[var(--radius-md)] text-[var(--text-muted)] hover:bg-[var(--surface-sunk)] cursor-pointer"
                >
                  <Icon icon={Pencil} />
                </button>
                <button
                  type="button"
                  aria-label={$_('roster.delete')}
                  onclick={() => (deleteHirelingTarget = hireling)}
                  class="grid place-items-center w-8 h-8 rounded-[var(--radius-md)] text-[var(--danger)] hover:bg-[var(--danger-tint)] cursor-pointer"
                >
                  <Icon icon={Trash2} />
                </button>
              </div>
            </div>
          {/each}
          {#if hirelings.length === 0}
            <p class="text-[var(--text-muted)] text-[length:var(--text-body)]">{$_('roster.hirelings.empty')}</p>
          {/if}
        </div>
      </Card>
    </div>
  </main>
</div>

<Modal
  open={memberModal !== null}
  title={memberModal?.mode === 'edit' ? $_('roster.warband.editTitle') : $_('roster.warband.addTitle')}
  onclose={() => (memberModal = null)}
>
  {#if memberModal}
    <PartyForm
      initial={memberModal.mode === 'edit' ? memberModal.member : undefined}
      onsave={saveMember}
      oncancel={() => (memberModal = null)}
    />
  {/if}
</Modal>

<Modal
  open={hirelingModal !== null}
  title={hirelingModal?.mode === 'edit' ? $_('roster.hirelings.editTitle') : $_('roster.hirelings.addTitle')}
  onclose={() => (hirelingModal = null)}
>
  {#if hirelingModal}
    <HirelingForm
      initial={hirelingModal.mode === 'edit' ? hirelingModal.hireling : undefined}
      onsave={saveHireling}
      oncancel={() => (hirelingModal = null)}
    />
  {/if}
</Modal>

<ConfirmDialog
  open={deleteMemberTarget !== null}
  title={$_('roster.warband.deleteTitle')}
  message={$_('roster.warband.deleteMessage', { values: { name: deleteMemberTarget?.name ?? '' } })}
  confirmLabel={$_('roster.delete')}
  cancelLabel={$_('roster.form.cancel')}
  danger
  onconfirm={confirmDeleteMember}
  oncancel={() => (deleteMemberTarget = null)}
/>

<ConfirmDialog
  open={deleteHirelingTarget !== null}
  title={$_('roster.hirelings.deleteTitle')}
  message={$_('roster.hirelings.deleteMessage', { values: { name: deleteHirelingTarget?.name ?? '' } })}
  confirmLabel={$_('roster.delete')}
  cancelLabel={$_('roster.form.cancel')}
  danger
  onconfirm={confirmDeleteHireling}
  oncancel={() => (deleteHirelingTarget = null)}
/>
