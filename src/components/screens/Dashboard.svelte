<script lang="ts">
  import { LayoutDashboard, Users, Swords, Map, ScrollText, Moon, Sun, Play, Dice5, Plus, Languages } from 'lucide-svelte';
  import { _ } from 'svelte-i18n';
  import Button from '../ui/Button.svelte';
  import Card from '../ui/Card.svelte';
  import HpBar from '../ui/HpBar.svelte';
  import StatusPill from '../ui/StatusPill.svelte';
  import Tag from '../ui/Tag.svelte';
  import Icon from '../ui/Icon.svelte';
  import { getParty } from '../../lib/stores/party.svelte';
  import { getTheme, toggleTheme, initTheme } from '../../lib/stores/theme.svelte';
  import { locale, setLocale, type SupportedLocale } from '../../lib/i18n';

  interface Props {
    onstartsession?: () => void;
  }

  let { onstartsession }: Props = $props();

  $effect(() => {
    initTheme();
  });

  const party = getParty();
  const wounded = $derived(party.filter((m) => m.hp < m.max).length);
  const pipsTotal = $derived(party.reduce((sum, m) => sum + m.pips, 0));

  const factions = [
    {
      name: 'The Gnawing Court',
      tone: 'danger' as const,
      clock: 3,
      of: 6,
      note: 'Rats tunnelling beneath the granary.',
      tags: ['Hostile', 'Sewers'],
    },
    {
      name: 'Owl Bridge Toll',
      tone: 'clock' as const,
      clock: 1,
      of: 4,
      note: 'A barn owl demands a cut of all passage.',
      tags: ['Neutral'],
    },
    {
      name: 'The Seed-Keepers',
      tone: 'success' as const,
      clock: 5,
      of: 6,
      note: 'Field mice hoarding winter stores. Allied.',
      tags: ['Ally', 'Meadow'],
    },
  ];

  const activeClocks = factions.length;

  const nav = [
    { icon: LayoutDashboard, key: 'nav.overview', active: true },
    { icon: Users, key: 'nav.warband', active: false },
    { icon: Swords, key: 'nav.factions', active: false },
    { icon: Map, key: 'nav.hexMap', active: false },
    { icon: ScrollText, key: 'nav.sessions', active: false },
  ];

  function toggleLocale() {
    const next: SupportedLocale = $locale === 'en' ? 'de' : 'en';
    setLocale(next);
  }
</script>

<div class="flex min-h-screen bg-[var(--bg)] text-[var(--text)]">
  <!-- Sidebar -->
  <aside
    class="w-[var(--sidebar-w)] shrink-0 border-r border-[var(--border)] bg-[var(--surface)] py-[var(--sp-5)] px-[var(--sp-4)] flex flex-col gap-[var(--sp-5)]"
  >
    <div class="font-[family-name:var(--font-display)] font-extrabold text-[22px] tracking-[-0.02em]">
      Whisker<span class="text-[var(--accent)]">watch</span>
    </div>
    <nav class="flex flex-col gap-0.5">
      {#each nav as item (item.key)}
        <span
          class="flex items-center gap-2.5 py-2 px-2.5 rounded-[var(--radius-md)] text-[length:var(--text-body)] {item.active
            ? 'font-bold text-[var(--accent)] bg-[var(--accent-tint)] cursor-default'
            : 'font-medium text-[var(--text-secondary)] cursor-not-allowed opacity-60'}"
          title={item.active ? undefined : $_('nav.comingSoon')}
        >
          <Icon icon={item.icon} />
          {$_(item.key)}
        </span>
      {/each}
    </nav>
    <div class="mt-auto flex flex-col gap-2.5">
      <Button variant="secondary" size="sm" block onclick={toggleLocale}>
        {#snippet icon()}
          <Icon icon={Languages} />
        {/snippet}
        {$_('locale.label')}: {$locale === 'en' ? 'EN' : 'DE'}
      </Button>
      <Button variant="secondary" size="sm" block onclick={toggleTheme}>
        {#snippet icon()}
          <Icon icon={getTheme() === 'light' ? Moon : Sun} />
        {/snippet}
        {getTheme() === 'light' ? $_('theme.dark') : $_('theme.light')}
      </Button>
      <Button variant="primary" block onclick={onstartsession}>
        {#snippet icon()}
          <Icon icon={Play} />
        {/snippet}
        {$_('dashboard.startSession')}
      </Button>
    </div>
  </aside>

  <!-- Main -->
  <main class="flex-1 p-[var(--sp-6)] max-w-[var(--content-max)] flex flex-col gap-[var(--sp-5)]">
    <header class="flex items-end justify-between gap-[var(--sp-4)] flex-wrap">
      <div>
        <div class="ww-label text-[var(--accent)]">{$_('dashboard.prepMode')}</div>
        <h1 class="text-[length:var(--text-h1)] mt-1">Grey Meadow Campaign</h1>
        <p class="mt-1 text-[var(--text-muted)] text-[length:var(--text-body)]">
          {$_('dashboard.sessionSummary', { values: { session: 5, days: 6 } })}
        </p>
      </div>
      <div class="flex gap-[var(--gap-inline)]">
        <Button variant="ghost" size="sm">
          {#snippet icon()}
            <Icon icon={Dice5} />
          {/snippet}
          {$_('dashboard.roll')}
        </Button>
        <Button variant="secondary" size="sm">
          {#snippet icon()}
            <Icon icon={Plus} />
          {/snippet}
          {$_('dashboard.newFaction')}
        </Button>
      </div>
    </header>

    <section class="grid grid-cols-4 gap-[var(--sp-3)]">
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
          {$_('dashboard.stats.nearFull', { values: { count: 1 } })}
        </div>
      </Card>
      <Card class="!rounded-[var(--radius-md)]">
        <div class="ww-label mb-1.5">{$_('dashboard.stats.session')}</div>
        <div class="ww-num font-bold text-[length:var(--stat-md)] leading-none">#5</div>
        <div class="text-[length:var(--text-sm)] text-[var(--text-muted)] mt-1">The granary raid</div>
      </Card>
    </section>

    <div class="grid grid-cols-[1.1fr_1fr] gap-[var(--sp-5)] items-start">
      <!-- Warband -->
      <Card eyebrow={$_('dashboard.warbandCard.eyebrow')} title="Grey Meadow four">
        {#snippet actions()}
          <Button variant="ghost" size="sm">{$_('dashboard.warbandCard.manage')}</Button>
        {/snippet}
        <div class="flex flex-col gap-[var(--sp-3)]">
          {#each party as member (member.name)}
            <div class="flex items-center gap-[var(--sp-4)] py-2 border-b border-[var(--border)]">
              <div class="min-w-23">
                <div class="font-[family-name:var(--font-display)] font-bold text-[length:var(--text-title)]">
                  {member.name}
                </div>
                <div class="text-[length:var(--text-sm)] text-[var(--text-muted)]">{member.role}</div>
              </div>
              <div class="flex-1 min-w-0">
                <HpBar value={member.hp} max={member.max} label={$_('dashboard.warbandCard.hp')} size="sm" />
              </div>
              <div class="flex gap-1.5 shrink-0">
                {#each member.conditions as cond (cond.label)}
                  <StatusPill tone={cond.tone} size="sm">{cond.label}</StatusPill>
                {/each}
              </div>
            </div>
          {/each}
        </div>
      </Card>

      <!-- Factions -->
      <div class="flex flex-col gap-[var(--sp-4)]">
        <div class="ww-label">{$_('dashboard.factionsCard.heading')}</div>
        {#each factions as faction (faction.name)}
          <Card interactive class="!rounded-[var(--radius-md)]">
            {#snippet footer()}
              <div class="flex items-center justify-between">
                <StatusPill tone={faction.tone} count={faction.clock} of={faction.of}
                  >{$_('dashboard.factionsCard.clock')}</StatusPill
                >
                <div class="flex gap-1.5">
                  {#each faction.tags as tag (tag)}
                    <Tag tone={faction.tone === 'success' ? 'success' : 'default'}>{tag}</Tag>
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
      </div>
    </div>
  </main>
</div>
