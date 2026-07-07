<script lang="ts">
  import { _ } from 'svelte-i18n';
  import Icon from '../ui/Icon.svelte';
  import Button from '../ui/Button.svelte';
  import { ChevronLeft } from 'lucide-svelte';
  import {
    describeEvent,
    groupForEvent,
    type LiveSessionEvent,
  } from '../../lib/stores/liveSessionLog.svelte';
  import { today } from '../../lib/date';
  import type { Session } from '../../lib/stores/sessions.svelte';

  interface Props {
    events: LiveSessionEvent[];
    defaultNumber: number;
    onback: () => void;
    ondraft: (draft: Omit<Session, 'id'>) => void;
  }

  let { events, defaultNumber, onback, ondraft }: Props = $props();

  // Groups rendered in this fixed order regardless of when events were
  // logged — "display order" for the compiled bullets (below) follows this
  // section order, not raw chronological logging order.
  const GROUP_ORDER = ['beats', 'factions', 'party', 'hirelings'] as const;
  const GROUP_LABELS: Record<(typeof GROUP_ORDER)[number], string> = {
    beats: $_('recap.beats'),
    factions: $_('recap.factions'),
    party: $_('recap.party'),
    hirelings: $_('recap.hirelings'),
  };

  const sections = $derived(
    GROUP_ORDER.map((group) => ({
      group,
      label: GROUP_LABELS[group],
      events: events.filter((e) => groupForEvent(e) === group),
    })).filter((section) => section.events.length > 0),
  );

  // Every event starts checked — the recap draft is opt-out, not opt-in,
  // since the whole point is to save the GM from re-typing things that
  // already happened.
  let checked = $state<Record<string, boolean>>(
    Object.fromEntries(events.map((e) => [e.id, true])),
  );

  function toggle(id: string) {
    checked[id] = !checked[id];
  }

  function draft() {
    const bullets = sections
      .flatMap((section) => section.events)
      .filter((e) => checked[e.id])
      .map((e) => `• ${describeEvent(e)}`);
    const summary = bullets.length > 0 ? `${bullets.join('\n')}\n` : '';
    ondraft({ number: defaultNumber, date: today(), title: '', summary });
  }
</script>

<div class="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col">
  <header
    class="sticky top-0 z-5 flex items-center gap-[var(--sp-3)] py-[var(--sp-4)] px-[var(--sp-5)] bg-[var(--surface)] border-b border-[var(--border)]"
  >
    <button
      onclick={onback}
      aria-label={$_('recap.back')}
      class="inline-flex items-center gap-2 min-h-[var(--tap)] shrink-0 bg-none border-none text-[var(--text-muted)] cursor-pointer text-[length:var(--text-body)] font-[family-name:var(--font-body)]"
    >
      <Icon icon={ChevronLeft} size="live" />{$_('recap.back')}
    </button>
    <div class="flex-1 text-center min-w-0">
      <div class="ww-label text-[var(--accent)]">{$_('recap.eyebrow')}</div>
      <div class="font-[family-name:var(--font-display)] font-bold text-[length:var(--text-title)] truncate">
        {$_('recap.title')}
      </div>
    </div>
    <span class="w-[var(--tap)] shrink-0" aria-hidden="true"></span>
  </header>

  <main class="flex-1 w-full max-w-160 mx-auto p-[var(--sp-5)] pb-[calc(var(--sp-6)*2)] flex flex-col gap-[var(--sp-5)]">
    <p class="text-[var(--text-secondary)] text-[length:var(--text-body)]">{$_('recap.intro')}</p>

    {#if sections.length === 0}
      <p class="text-[var(--text-muted)] text-[length:var(--text-body)]">{$_('recap.empty')}</p>
    {/if}

    {#each sections as section (section.group)}
      <section class="flex flex-col gap-[var(--sp-2)]">
        <h2 class="ww-label text-[var(--text-muted)]">{section.label}</h2>
        <div class="flex flex-col rounded-[var(--radius-md)] border border-[var(--border)] overflow-hidden divide-y divide-[var(--border)]">
          {#each section.events as event (event.id)}
            <label
              class="flex items-center gap-[var(--sp-3)] min-h-11 py-[var(--sp-3)] px-[var(--sp-4)] bg-[var(--surface)] cursor-pointer"
            >
              <input
                type="checkbox"
                checked={checked[event.id]}
                onchange={() => toggle(event.id)}
                class="w-5 h-5 shrink-0 accent-[var(--accent)]"
              />
              <span class="text-[length:var(--text-body)] text-[var(--text)]">{describeEvent(event)}</span>
            </label>
          {/each}
        </div>
      </section>
    {/each}
  </main>

  <div
    class="sticky bottom-0 p-[var(--sp-4)] bg-[var(--surface)] border-t border-[var(--border)]"
    style:padding-bottom="max(var(--sp-4), env(safe-area-inset-bottom))"
  >
    <div class="max-w-160 mx-auto">
      <Button variant="primary" size="live" block onclick={draft}>{$_('recap.draftRecap')}</Button>
    </div>
  </div>
</div>
