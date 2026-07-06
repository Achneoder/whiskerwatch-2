<script lang="ts">
  import { _ } from 'svelte-i18n';
  import Input from '../ui/Input.svelte';
  import Textarea from '../ui/Textarea.svelte';
  import Button from '../ui/Button.svelte';
  import type { HexNode, HexTerrain } from '../../lib/stores/hexmap.svelte';

  interface Props {
    initial?: HexNode | undefined;
    onsave: (data: Omit<HexNode, 'id' | 'q' | 'r'>) => void;
    oncancel: () => void;
  }

  let { initial, onsave, oncancel }: Props = $props();

  const terrains: HexTerrain[] = ['meadow', 'hedgerow', 'forest', 'water', 'hills', 'ruins', 'settlement'];

  let terrain = $state<HexTerrain>(initial?.terrain ?? 'meadow');
  let name = $state(initial?.name ?? '');
  let notes = $state(initial?.notes ?? '');
  let discovered = $state(initial?.discovered ?? false);

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    onsave({ terrain, name: name.trim(), notes: notes.trim(), discovered });
  }
</script>

<form onsubmit={handleSubmit} class="flex flex-col gap-[var(--sp-4)]">
  <div class="flex flex-col gap-1.5">
    <span class="ww-label">{$_('hexMap.form.terrain')}</span>
    <select
      bind:value={terrain}
      class="h-[var(--tap)] rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface-raised)] px-[var(--pad-control-x)] text-[length:var(--text-body)] w-fit"
    >
      {#each terrains as t (t)}
        <option value={t}>{$_(`hexMap.terrain.${t}`)}</option>
      {/each}
    </select>
  </div>

  <Input label={$_('hexMap.form.name')} bind:value={name} placeholder={$_('hexMap.form.namePlaceholder')} />

  <Textarea label={$_('hexMap.form.notes')} bind:value={notes} rows={3} />

  <label class="flex items-center gap-2 text-[length:var(--text-body)] cursor-pointer">
    <input type="checkbox" bind:checked={discovered} class="w-4 h-4 accent-[var(--accent)]" />
    {$_('hexMap.form.discovered')}
  </label>

  <div class="flex justify-end gap-[var(--gap-inline)] pt-[var(--sp-2)]">
    <Button type="button" variant="ghost" onclick={oncancel}>{$_('roster.form.cancel')}</Button>
    <Button type="submit" variant="primary">{$_('roster.form.save')}</Button>
  </div>
</form>
