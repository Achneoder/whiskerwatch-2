<script lang="ts">
  import { Dice5, Plus } from 'lucide-svelte';
  import { _ } from 'svelte-i18n';
  import Button from '../ui/Button.svelte';
  import Card from '../ui/Card.svelte';
  import HpBar from '../ui/HpBar.svelte';
  import StatusPill from '../ui/StatusPill.svelte';
  import Tag from '../ui/Tag.svelte';
  import Icon from '../ui/Icon.svelte';
  import AppSidebar, { type NavScreen } from '../layout/AppSidebar.svelte';
  import { getParty } from '../../lib/stores/party.svelte';
  import { getLastSession, getNextSessionNumber } from '../../lib/stores/sessions.svelte';
  import { getFactions, dispositionTagTone } from '../../lib/stores/factions.svelte';
  import { CONDITIONS } from '../../lib/conditions';
  import { daysSince } from '../../lib/date';

  interface Props {
    onstartsession?: () => void;
    onnavigate: (screen: NavScreen) => void;
  }

  let { onstartsession, onnavigate }: Props = $props();

  const party = getParty();
  const wounded = $derived(party.filter((m) => m.hp < m.max).length);
  const pipsTotal = $derived(party.reduce((sum, m) => sum + m.pips, 0));

  const nextSessionNumber = $derived(getNextSessionNumber());
  const lastSession = $derived(getLastSession());

  const factions = getFactions();
  const activeClocks = $derived(factions.length);
  const nearFull = $derived(factions.filter((f) => f.of > 0 && f.clock >= f.of - 1).length);
</script>

<div class="flex flex-col md:flex-row min-h-screen bg-[var(--bg)] text-[var(--text)]">
  <AppSidebar active="overview" {onnavigate} {onstartsession} />

  <!-- Main -->
  <main class="flex-1 p-[var(--sp-6)] max-w-[var(--content-max)] flex flex-col gap-[var(--sp-5)]">
    <header class="flex items-end justify-between gap-[var(--sp-4)] flex-wrap">
      <div>
        <div class="ww-label text-[var(--accent)]">{$_('dashboard.prepMode')}</div>
        <h1 class="text-[length:var(--text-h1)] mt-1">{$_('dashboard.title')}</h1>
        <p class="mt-1 text-[var(--text-muted)] text-[length:var(--text-body)]">
          {#if lastSession}
            {$_('dashboard.sessionSummary', { values: { session: nextSessionNumber, days: daysSince(lastSession.date) } })}
          {:else}
            {$_('dashboard.sessionSummaryEmpty', { values: { session: nextSessionNumber } })}
          {/if}
        </p>
      </div>
      <div class="flex gap-[var(--gap-inline)]">
        <Button variant="ghost" size="sm">
          {#snippet icon()}
            <Icon icon={Dice5} />
          {/snippet}
          {$_('dashboard.roll')}
        </Button>
        <Button variant="secondary" size="sm" onclick={() => onnavigate('factions')}>
          {#snippet icon()}
            <Icon icon={Plus} />
          {/snippet}
          {$_('dashboard.newFaction')}
        </Button>
      </div>
    </header>

    <section class="grid grid-cols-2 sm:grid-cols-4 gap-[var(--sp-3)]">
      <Card class="!rounded-[var(--radius-md)]">
        <div class="ww-label mb-1.5">{$_('dashboard.stats.warband')}</div>
        <div class="ww-num font-bold text-[length:var(--stat-md)] leading-none">
          {$_('dashboard.stats.mice', { values: { count: party.length } })}
        </div>
        <div class="text-[length:var(--text-sm)] text-[var(--text-muted)] mt-1">
          {$_('dashboard.stats.wounded', { values: { count: wounded } })}
        </div>
      </Card>
      <Card class="!rounded-[var(--radius-md)]">
        <div class="ww-label mb-1.5">{$_('dashboard.stats.pipsBanked')}</div>
        <div class="ww-num font-bold text-[length:var(--stat-md)] leading-none text-[var(--accent)]">
          {pipsTotal.toLocaleString()}
        </div>
        <div class="text-[length:var(--text-sm)] text-[var(--text-muted)] mt-1">{$_('dashboard.stats.sharedPurse')}</div>
      </Card>
      <Card class="!rounded-[var(--radius-md)]">
        <div class="ww-label mb-1.5">{$_('dashboard.stats.activeClocks')}</div>
        <div class="ww-num font-bold text-[length:var(--stat-md)] leading-none text-[var(--warning)]">
          {activeClocks}
        </div>
        <div class="text-[length:var(--text-sm)] text-[var(--text-muted)] mt-1">
          {$_('dashboard.stats.nearFull', { values: { count: nearFull } })}
        </div>
      </Card>
      <Card interactive class="!rounded-[var(--radius-md)]" onclick={() => onnavigate('sessions')}>
        <div class="ww-label mb-1.5">{$_('dashboard.stats.session')}</div>
        <div class="ww-num font-bold text-[length:var(--stat-md)] leading-none">#{nextSessionNumber}</div>
        <div class="text-[length:var(--text-sm)] text-[var(--text-muted)] mt-1">
          {lastSession ? lastSession.title : $_('dashboard.stats.noSessions')}
        </div>
      </Card>
    </section>

    <div class="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-[var(--sp-5)] items-start">
      <!-- Warband -->
      <Card eyebrow={$_('dashboard.warbandCard.eyebrow')} title={$_('dashboard.warbandCard.title')}>
        {#snippet actions()}
          <Button variant="ghost" size="sm" onclick={() => onnavigate('warband')}>{$_('dashboard.warbandCard.manage')}</Button>
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
              <div class="flex-1 min-w-35">
                <HpBar value={member.hp} max={member.max} label={$_('dashboard.warbandCard.hp')} size="sm" />
              </div>
              <div class="flex gap-1.5 shrink-0">
                {#each member.conditions as cond (cond)}
                  <StatusPill tone={CONDITIONS[cond].tone} size="sm">{CONDITIONS[cond].label}</StatusPill>
                {/each}
              </div>
            </div>
          {/each}
        </div>
      </Card>

      <!-- Factions -->
      <div class="flex flex-col gap-[var(--sp-4)]">
        <div class="ww-label">{$_('dashboard.factionsCard.heading')}</div>
        {#each factions as faction (faction.id)}
          <Card interactive class="!rounded-[var(--radius-md)]" onclick={() => onnavigate('factions')}>
            {#snippet footer()}
              <div class="flex items-center justify-between gap-[var(--sp-3)] flex-wrap">
                <StatusPill tone="clock" count={faction.clock} of={faction.of}
                  >{$_('dashboard.factionsCard.clock')}</StatusPill
                >
                <div class="flex gap-1.5 flex-wrap">
                  {#each faction.tags as tag (tag)}
                    <Tag tone={dispositionTagTone[faction.disposition]}>{tag}</Tag>
                  {/each}
                </div>
              </div>
            {/snippet}
            <div class="font-[family-name:var(--font-display)] font-bold text-[length:var(--text-title)]">
              {faction.name}
            </div>
            <p class="mt-1 text-[var(--text-secondary)] text-[length:var(--text-body)]">{faction.note}</p>
          </Card>
        {/each}
        {#if factions.length === 0}
          <p class="text-[var(--text-muted)] text-[length:var(--text-sm)]">{$_('factions.empty')}</p>
        {/if}
      </div>
    </div>
  </main>
</div>
