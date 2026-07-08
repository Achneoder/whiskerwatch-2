<script lang="ts">
  import { _ } from 'svelte-i18n';
  import Input from '../ui/Input.svelte';
  import Textarea from '../ui/Textarea.svelte';
  import Button from '../ui/Button.svelte';
  import type { Adventure, AdventureStatus } from '../../lib/stores/adventures.svelte';

  interface Props {
    initial?: Adventure | undefined;
    onsave: (data: Omit<Adventure, 'id'>) => void;
    oncancel: () => void;
  }

  let { initial, onsave, oncancel }: Props = $props();

  const statuses: AdventureStatus[] = ['planned', 'active', 'completed'];

  let title = $state(initial?.title ?? '');
  let description = $state(initial?.description ?? '');
  let status = $state<AdventureStatus>(initial?.status ?? 'planned');

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    onsave({ title: title.trim(), description: description.trim(), status });
  }
</script>

<form onsubmit={handleSubmit} class="flex flex-col gap-[var(--sp-4)]">
  <Input label={$_('adventure.form.title')} bind:value={title} required />
  <Textarea label={$_('adventure.form.description')} bind:value={description} rows={4} />

  <div class="flex flex-col gap-1.5">
    <span class="ww-label">{$_('adventure.form.status')}</span>
    <select
      bind:value={status}
      class="h-[var(--tap)] rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface-raised)] px-[var(--pad-control-x)] text-[length:var(--text-body)] w-fit"
    >
      {#each statuses as s (s)}
        <option value={s}>{$_(`adventure.adventureStatus.${s}`)}</option>
      {/each}
    </select>
  </div>

  <div class="flex justify-end gap-[var(--gap-inline)] pt-[var(--sp-2)]">
    <Button type="button" variant="ghost" onclick={oncancel}>{$_('roster.form.cancel')}</Button>
    <Button type="submit" variant="primary">{$_('roster.form.save')}</Button>
  </div>
</form>
