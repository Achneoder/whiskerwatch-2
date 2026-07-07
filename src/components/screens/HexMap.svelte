<script lang="ts">
  import { _ } from 'svelte-i18n';
  import AppSidebar, { type NavScreen } from '../layout/AppSidebar.svelte';
  import Button from '../ui/Button.svelte';
  import Modal from '../ui/Modal.svelte';
  import ConfirmDialog from '../ui/ConfirmDialog.svelte';
  import Tag from '../ui/Tag.svelte';
  import HexNodeForm from '../forms/HexNodeForm.svelte';
  import HexCanvas from './HexCanvas.svelte';
  import {
    getHexNodes,
    getHexNodeAt,
    addHexNode,
    updateHexNode,
    removeHexNode,
    terrainFill,
    TERRAINS,
    type HexNode,
  } from '../../lib/stores/hexmap.svelte';
  import { getBeats } from '../../lib/stores/beats.svelte';

  interface Props {
    onnavigate: (screen: NavScreen) => void;
    onstartsession?: () => void;
  }

  let { onnavigate, onstartsession }: Props = $props();

  const hexes = getHexNodes();
  const beats = getBeats();

  function beatsFor(hexNodeId: string) {
    return beats.filter((b) => b.hexNodeId === hexNodeId);
  }

  let selected = $state<{ q: number; r: number } | null>(null);
  let hexModal = $state<{ mode: 'add'; q: number; r: number } | { mode: 'edit'; node: HexNode } | null>(null);
  let deleteTarget = $state<HexNode | null>(null);

  function selectHex(q: number, r: number) {
    selected = { q, r };
    const node = getHexNodeAt(q, r);
    hexModal = node ? { mode: 'edit', node } : { mode: 'add', q, r };
  }

  function saveHex(data: Omit<HexNode, 'id' | 'q' | 'r'>) {
    if (hexModal?.mode === 'edit') {
      updateHexNode(hexModal.node.id, data);
    } else if (hexModal?.mode === 'add') {
      addHexNode({ ...data, q: hexModal.q, r: hexModal.r });
    }
    hexModal = null;
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    removeHexNode(deleteTarget.id);
    deleteTarget = null;
    selected = null;
  }
</script>

<div class="flex flex-col md:flex-row min-h-screen bg-[var(--bg)] text-[var(--text)]">
  <AppSidebar active="hexMap" {onnavigate} {onstartsession} />

  <main class="flex-1 p-[var(--sp-6)] max-w-[var(--content-max)] flex flex-col gap-[var(--sp-5)]">
    <header class="flex items-end justify-between gap-[var(--sp-4)] flex-wrap">
      <div>
        <div class="ww-label text-[var(--accent)]">{$_('hexMap.eyebrow')}</div>
        <h1 class="text-[length:var(--text-h1)] mt-1">{$_('hexMap.title')}</h1>
      </div>
    </header>

    <div class="flex flex-wrap gap-x-[var(--sp-4)] gap-y-1.5 text-[length:var(--text-caption)] text-[var(--text-muted)]">
      {#each TERRAINS as terrain (terrain)}
        <span class="inline-flex items-center gap-1.5">
          <span
            class="inline-block w-3.5 h-3.5 rounded-[3px] border border-[var(--border)]"
            style:background={terrainFill[terrain]}
          ></span>
          {$_(`hexMap.terrain.${terrain}`)}
        </span>
      {/each}
    </div>

    {#if hexes.length === 0}
      <p class="text-[var(--text-muted)] text-[length:var(--text-body)]">{$_('hexMap.empty')}</p>
    {/if}

    <HexCanvas {hexes} {selected} onselect={selectHex} />
  </main>
</div>

<Modal
  open={hexModal !== null}
  title={hexModal?.mode === 'edit' ? $_('hexMap.editTitle') : $_('hexMap.addTitle')}
  onclose={() => (hexModal = null)}
>
  {#if hexModal}
    {#if hexModal.mode === 'edit'}
      {@const node = hexModal.node}
      <div class="flex justify-end mb-[var(--sp-2)]">
        <Button
          variant="ghost"
          size="sm"
          onclick={() => {
            deleteTarget = node;
            hexModal = null;
          }}
        >
          {$_('hexMap.clear')}
        </Button>
      </div>
      {#if beatsFor(node.id).length > 0}
        <div class="flex flex-col gap-1.5 mb-[var(--sp-4)]">
          <span class="ww-label">{$_('hexMap.beatsTouching')}</span>
          <div class="flex gap-1.5 flex-wrap">
            {#each beatsFor(node.id) as beat (beat.id)}
              <Tag size="sm">{beat.title}</Tag>
            {/each}
          </div>
        </div>
      {/if}
    {/if}
    <HexNodeForm
      initial={hexModal.mode === 'edit' ? hexModal.node : undefined}
      onsave={saveHex}
      oncancel={() => (hexModal = null)}
    />
  {/if}
</Modal>

<ConfirmDialog
  open={deleteTarget !== null}
  title={$_('hexMap.deleteTitle')}
  message={$_('hexMap.deleteMessage', { values: { name: deleteTarget?.name || deleteTarget?.terrain || '' } })}
  confirmLabel={$_('hexMap.clear')}
  cancelLabel={$_('roster.form.cancel')}
  danger
  onconfirm={confirmDelete}
  oncancel={() => (deleteTarget = null)}
/>
