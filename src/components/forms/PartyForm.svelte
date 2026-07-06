<script lang="ts">
  import { _ } from 'svelte-i18n';
  import Input from '../ui/Input.svelte';
  import Stepper from '../ui/Stepper.svelte';
  import Button from '../ui/Button.svelte';
  import StatusPill from '../ui/StatusPill.svelte';
  import type { PartyMember } from '../../lib/stores/party.svelte';

  interface Props {
    initial?: PartyMember | undefined;
    onsave: (data: Omit<PartyMember, 'id'>) => void;
    oncancel: () => void;
  }

  let { initial, onsave, oncancel }: Props = $props();

  let name = $state(initial?.name ?? '');
  let role = $state(initial?.role ?? '');
  let hp = $state(initial?.hp ?? 6);
  let max = $state(initial?.max ?? 6);
  let pips = $state(initial?.pips ?? 0);
  let conditions = $state<{ tone: 'danger' | 'warning'; label: string }[]>(
    initial ? initial.conditions.map((c) => ({ ...c })) : [],
  );
  let newCondition = $state('');
  let newConditionTone = $state<'danger' | 'warning'>('danger');

  $effect(() => {
    if (hp > max) hp = max;
  });

  function addCondition() {
    const label = newCondition.trim();
    if (!label) return;
    conditions.push({ tone: newConditionTone, label });
    newCondition = '';
  }

  function removeCondition(index: number) {
    conditions.splice(index, 1);
  }

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    onsave({ name: name.trim(), role: role.trim(), hp, max, pips, conditions });
  }
</script>

<form onsubmit={handleSubmit} class="flex flex-col gap-[var(--sp-4)]">
  <Input label={$_('roster.form.name')} bind:value={name} required />
  <Input label={$_('roster.form.role')} bind:value={role} />

  <div class="flex gap-[var(--sp-5)] flex-wrap">
    <Stepper label={$_('roster.form.hp')} value={hp} min={0} max={max} size="md" onchange={(v) => (hp = v)} />
    <Stepper label={$_('roster.form.maxHp')} value={max} min={1} max={12} size="md" onchange={(v) => (max = v)} />
    <Stepper label={$_('roster.form.pips')} value={pips} min={0} max={9999} step={5} size="md" onchange={(v) => (pips = v)} />
  </div>

  <div class="flex flex-col gap-2">
    <span class="ww-label">{$_('roster.form.conditions')}</span>
    {#if conditions.length > 0}
      <div class="flex gap-2 flex-wrap">
        {#each conditions as cond, i (cond.label + i)}
          <StatusPill tone={cond.tone} size="sm" onclick={() => removeCondition(i)}>{cond.label} ×</StatusPill>
        {/each}
      </div>
    {/if}
    <div class="flex gap-2 items-center flex-wrap">
      <select
        bind:value={newConditionTone}
        class="h-[var(--tap)] rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface-raised)] px-2 text-[length:var(--text-sm)] shrink-0"
      >
        <option value="danger">{$_('roster.form.toneDanger')}</option>
        <option value="warning">{$_('roster.form.toneWarning')}</option>
      </select>
      <div class="flex-1 min-w-32">
        <Input bind:value={newCondition} size="sm" placeholder={$_('roster.form.conditionPlaceholder')} />
      </div>
      <Button type="button" variant="secondary" size="sm" onclick={addCondition}>{$_('roster.form.addCondition')}</Button>
    </div>
  </div>

  <div class="flex justify-end gap-[var(--gap-inline)] pt-[var(--sp-2)]">
    <Button type="button" variant="ghost" onclick={oncancel}>{$_('roster.form.cancel')}</Button>
    <Button type="submit" variant="primary">{$_('roster.form.save')}</Button>
  </div>
</form>
