<script lang="ts">
  import { _ } from 'svelte-i18n';
  import Input from '../ui/Input.svelte';
  import Stepper from '../ui/Stepper.svelte';
  import Button from '../ui/Button.svelte';
  import type { Hireling } from '../../lib/stores/hirelings.svelte';

  interface Props {
    initial?: Hireling | undefined;
    onsave: (data: Omit<Hireling, 'id'>) => void;
    oncancel: () => void;
  }

  let { initial, onsave, oncancel }: Props = $props();

  let name = $state(initial?.name ?? '');
  let role = $state(initial?.role ?? '');
  let hp = $state(initial?.hp ?? 3);
  let max = $state(initial?.max ?? 3);
  let loyalty = $state(initial?.loyalty ?? 4);
  let notes = $state(initial?.notes ?? '');

  $effect(() => {
    if (hp > max) hp = max;
  });

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    onsave({ name: name.trim(), role: role.trim(), hp, max, loyalty, notes: notes.trim() });
  }
</script>

<form onsubmit={handleSubmit} class="flex flex-col gap-[var(--sp-4)]">
  <Input label={$_('roster.form.name')} bind:value={name} required />
  <Input label={$_('roster.form.role')} bind:value={role} />

  <div class="flex gap-[var(--sp-5)] flex-wrap">
    <Stepper label={$_('roster.form.hp')} value={hp} min={0} max={max} size="md" onchange={(v) => (hp = v)} />
    <Stepper label={$_('roster.form.maxHp')} value={max} min={1} max={12} size="md" onchange={(v) => (max = v)} />
    <Stepper
      label={$_('roster.form.loyalty')}
      value={loyalty}
      min={0}
      max={6}
      size="md"
      onchange={(v) => (loyalty = v)}
    />
  </div>

  <Input label={$_('roster.form.notes')} bind:value={notes} placeholder={$_('roster.form.notesPlaceholder')} />

  <div class="flex justify-end gap-[var(--gap-inline)] pt-[var(--sp-2)]">
    <Button type="button" variant="ghost" onclick={oncancel}>{$_('roster.form.cancel')}</Button>
    <Button type="submit" variant="primary">{$_('roster.form.save')}</Button>
  </div>
</form>
