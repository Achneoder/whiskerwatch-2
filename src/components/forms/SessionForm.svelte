<script lang="ts">
  import { _ } from 'svelte-i18n';
  import Input from '../ui/Input.svelte';
  import Textarea from '../ui/Textarea.svelte';
  import Stepper from '../ui/Stepper.svelte';
  import Button from '../ui/Button.svelte';
  import type { Session } from '../../lib/stores/sessions.svelte';
  import { today } from '../../lib/date';

  interface Props {
    initial?: Session | undefined;
    defaultNumber: number;
    onsave: (data: Omit<Session, 'id'>) => void;
    oncancel: () => void;
  }

  let { initial, defaultNumber, onsave, oncancel }: Props = $props();

  let number = $state(initial?.number ?? defaultNumber);
  let date = $state(initial?.date ?? today());
  let title = $state(initial?.title ?? '');
  let summary = $state(initial?.summary ?? '');

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    onsave({ number, date, title: title.trim(), summary: summary.trim() });
  }
</script>

<form onsubmit={handleSubmit} class="flex flex-col gap-[var(--sp-4)]">
  <div class="flex gap-[var(--sp-5)] items-end flex-wrap">
    <Stepper label={$_('sessions.form.number')} value={number} min={1} max={999} size="md" onchange={(v) => (number = v)} />
    <Input label={$_('sessions.form.date')} type="date" bind:value={date} />
  </div>
  <Input label={$_('sessions.form.title')} bind:value={title} required />
  <Textarea label={$_('sessions.form.summary')} bind:value={summary} rows={5} placeholder={$_('sessions.form.summaryPlaceholder')} />

  <div class="flex justify-end gap-[var(--gap-inline)] pt-[var(--sp-2)]">
    <Button type="button" variant="ghost" onclick={oncancel}>{$_('roster.form.cancel')}</Button>
    <Button type="submit" variant="primary">{$_('roster.form.save')}</Button>
  </div>
</form>
