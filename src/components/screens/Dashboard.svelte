<script lang="ts">
  import { LayoutDashboard, Users, Swords, Map, ScrollText, Moon, Sun, Play, Dice5, Plus } from 'lucide-svelte';
  import Button from '../ui/Button.svelte';
  import Card from '../ui/Card.svelte';
  import HpBar from '../ui/HpBar.svelte';
  import StatusPill from '../ui/StatusPill.svelte';
  import Tag from '../ui/Tag.svelte';
  import Icon from '../ui/Icon.svelte';
  import { getParty } from '../../lib/stores/party.svelte';
  import { getTheme, toggleTheme, initTheme } from '../../lib/stores/theme.svelte';

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
    { icon: LayoutDashboard, label: 'Overview', active: true },
    { icon: Users, label: 'Warband', active: false },
    { icon: Swords, label: 'Factions', active: false },
    { icon: Map, label: 'Hex map', active: false },
    { icon: ScrollText, label: 'Sessions', active: false },
  ];
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
      {#each nav as item (item.label)}
        <span
          class="flex items-center gap-2.5 py-2 px-2.5 rounded-[var(--radius-md)] text-[length:var(--text-body)] {item.active
            ? 'font-bold text-[var(--accent)] bg-[var(--accent-tint)] cursor-default'
            : 'font-medium text-[var(--text-secondary)] cursor-not-allowed opacity-60'}"
          title={item.active ? undefined : 'Coming soon'}
        >
          <Icon icon={item.icon} />
          {item.label}
        </span>
      {/each}
    </nav>
    <div class="mt-auto flex flex-col gap-2.5">
      <Button variant="secondary" size="sm" block onclick={toggleTheme}>
        {#snippet icon()}
          <Icon icon={getTheme() === 'light' ? Moon : Sun} />
        {/snippet}
        {getTheme() === 'light' ? 'Dark' : 'Light'} burrow
      </Button>
      <Button variant="primary" block onclick={onstartsession}>
        {#snippet icon()}
          <Icon icon={Play} />
        {/snippet}
        Start session
      </Button>
    </div>
  </aside>

  <!-- Main -->
  <main class="flex-1 p-[var(--sp-6)] max-w-[var(--content-max)] flex flex-col gap-[var(--sp-5)]">
    <header class="flex items-end justify-between gap-[var(--sp-4)] flex-wrap">
      <div>
        <div class="ww-label text-[var(--accent)]">Prep mode · laptop</div>
        <h1 class="text-[length:var(--text-h1)] mt-1">Grey Meadow Campaign</h1>
        <p class="mt-1 text-[var(--text-muted)] text-[length:var(--text-body)]">
          Session 5 prep · last played 6 days ago
        </p>
      </div>
      <div class="flex gap-[var(--gap-inline)]">
        <Button variant="ghost" size="sm">
          {#snippet icon()}
            <Icon icon={Dice5} />
          {/snippet}
          Roll
        </Button>
        <Button variant="secondary" size="sm">
          {#snippet icon()}
            <Icon icon={Plus} />
          {/snippet}
          New faction
        </Button>
      </div>
    </header>

    <section class="grid grid-cols-4 gap-[var(--sp-3)]">
      <Card class="!rounded-[var(--radius-md)]">
        <div class="ww-label mb-1.5">Warband</div>
        <div class="ww-num font-bold text-[length:var(--stat-md)] leading-none">{party.length} mice</div>
        <div class="text-[length:var(--text-sm)] text-[var(--text-muted)] mt-1">{wounded} wounded</div>
      </Card>
      <Card class="!rounded-[var(--radius-md)]">
        <div class="ww-label mb-1.5">Pips banked</div>
        <div class="ww-num font-bold text-[length:var(--stat-md)] leading-none text-[var(--accent)]">
          {pipsTotal.toLocaleString()}
        </div>
        <div class="text-[length:var(--text-sm)] text-[var(--text-muted)] mt-1">shared purse</div>
      </Card>
      <Card class="!rounded-[var(--radius-md)]">
        <div class="ww-label mb-1.5">Active clocks</div>
        <div class="ww-num font-bold text-[length:var(--stat-md)] leading-none text-[var(--warning)]">
          {activeClocks}
        </div>
        <div class="text-[length:var(--text-sm)] text-[var(--text-muted)] mt-1">1 near full</div>
      </Card>
      <Card class="!rounded-[var(--radius-md)]">
        <div class="ww-label mb-1.5">Session</div>
        <div class="ww-num font-bold text-[length:var(--stat-md)] leading-none">#5</div>
        <div class="text-[length:var(--text-sm)] text-[var(--text-muted)] mt-1">The granary raid</div>
      </Card>
    </section>

    <div class="grid grid-cols-[1.1fr_1fr] gap-[var(--sp-5)] items-start">
      <!-- Warband -->
      <Card eyebrow="Warband" title="Grey Meadow four">
        {#snippet actions()}
          <Button variant="ghost" size="sm">Manage</Button>
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
              <div class="flex-1 min-w-0"><HpBar value={member.hp} max={member.max} label="HP" size="sm" /></div>
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
        <div class="ww-label">Factions & clocks</div>
        {#each factions as faction (faction.name)}
          <Card interactive class="!rounded-[var(--radius-md)]">
            {#snippet footer()}
              <div class="flex items-center justify-between">
                <StatusPill tone={faction.tone} count={faction.clock} of={faction.of}>Clock</StatusPill>
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
