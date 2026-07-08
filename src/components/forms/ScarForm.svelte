<script lang="ts">
  import { _ } from 'svelte-i18n';
  import Input from '../ui/Input.svelte';
  import Textarea from '../ui/Textarea.svelte';
  import Tag from '../ui/Tag.svelte';
  import Button from '../ui/Button.svelte';
  import type { Scar } from '../../lib/conditions';

  interface Props {
    onsave: (scar: Scar) => void;
    oncancel: () => void;
  }

  let { onsave, oncancel }: Props = $props();

  // GM-narrated free text only, per the ruling — these are just a starting
  // point to tap and edit, never rolled or auto-applied.
  const suggestions = [
    'Lost an eye',
    'Walks with a limp',
    'Tremor in the paw',
    'Jumpy around fire',
    'Missing whiskers',
    'Old wound aches',
  ];

  let label = $state('');
  let note = $state('');

  function pickSuggestion(text: string) {
    label = text;
  }

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    if (!label.trim()) return;
    onsave({ label: label.trim(), note: note.trim() });
  }
</script>

<form onsubmit={handleSubmit} class="flex flex-col gap-[var(--sp-4)]">
  <div class="flex flex-col gap-2">
    <span class="ww-label">{$_('roster.scars.suggestions')}</span>
    <div class="flex flex-wrap gap-2">
      {#each suggestions as suggestion (suggestion)}
        <button
          type="button"
          onclick={() => pickSuggestion(suggestion)}
          class="min-h-11 inline-flex items-center rounded-[var(--radius-pill)] cursor-pointer"
        >
          <Tag>{suggestion}</Tag>
        </button>
      {/each}
    </div>
  </div>

  <Input label={$_('roster.scars.labelField')} bind:value={label} required />
  <Textarea
    label={$_('roster.scars.noteField')}
    bind:value={note}
    rows={2}
    placeholder={$_('roster.scars.notePlaceholder')}
  />

  <div class="flex justify-end gap-[var(--gap-inline)] pt-[var(--sp-2)]">
    <Button type="button" variant="ghost" onclick={oncancel}>{$_('roster.form.cancel')}</Button>
    <Button type="submit" variant="primary" disabled={!label.trim()}>{$_('roster.scars.submit')}</Button>
  </div>
</form>
