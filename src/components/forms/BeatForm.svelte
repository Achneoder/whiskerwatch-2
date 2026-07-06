<script lang="ts">
  import { _ } from 'svelte-i18n';
  import Input from '../ui/Input.svelte';
  import Textarea from '../ui/Textarea.svelte';
  import Button from '../ui/Button.svelte';
  import type { Beat, BeatStatus } from '../../lib/stores/beats.svelte';

  interface Props {
    initial?: Beat | undefined;
    onsave: (data: { title: string; notes: string; status: BeatStatus }) => void;
    oncancel: () => void;
  }

  let { initial, onsave, oncancel }: Props = $props();

  let title = $state(initial?.title ?? '');
  let notes = $state(initial?.notes ?? '');
  let status = $state<BeatStatus>(initial?.status ?? 'planned');

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    onsave({ title: title.trim(), notes: notes.trim(), status });
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

  <div class="flex justify-end gap-[var(--gap-inline)] pt-[var(--sp-2)]">
    <Button type="button" variant="ghost" onclick={oncancel}>{$_('roster.form.cancel')}</Button>
    <Button type="submit" variant="primary">{$_('roster.form.save')}</Button>
  </div>
</form>
