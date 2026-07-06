<script lang="ts">
  import { LayoutDashboard, Users, ListTree, Swords, Map, ScrollText, Moon, Sun, Play, Languages } from 'lucide-svelte';
  import { _ } from 'svelte-i18n';
  import Button from '../ui/Button.svelte';
  import Icon from '../ui/Icon.svelte';
  import { getTheme, toggleTheme, initTheme } from '../../lib/stores/theme.svelte';
  import { locale, setLocale, type SupportedLocale } from '../../lib/i18n';

  export type NavScreen = 'overview' | 'warband' | 'adventure' | 'factions' | 'hexMap' | 'sessions';

  interface Props {
    active: NavScreen;
    onnavigate: (screen: NavScreen) => void;
    onstartsession?: (() => void) | undefined;
  }

  let { active, onnavigate, onstartsession }: Props = $props();

  $effect(() => {
    initTheme();
  });

  const nav: { screen: NavScreen; icon: typeof LayoutDashboard; key: string; enabled: boolean }[] = [
    { screen: 'overview', icon: LayoutDashboard, key: 'nav.overview', enabled: true },
    { screen: 'warband', icon: Users, key: 'nav.warband', enabled: true },
    { screen: 'adventure', icon: ListTree, key: 'nav.adventure', enabled: true },
    { screen: 'factions', icon: Swords, key: 'nav.factions', enabled: false },
    { screen: 'hexMap', icon: Map, key: 'nav.hexMap', enabled: false },
    { screen: 'sessions', icon: ScrollText, key: 'nav.sessions', enabled: true },
  ];

  function toggleLocale() {
    const next: SupportedLocale = $locale === 'en' ? 'de' : 'en';
    setLocale(next);
  }
</script>

<aside
  class="w-[var(--sidebar-w)] shrink-0 border-r border-[var(--border)] bg-[var(--surface)] py-[var(--sp-5)] px-[var(--sp-4)] flex flex-col gap-[var(--sp-5)]"
>
  <div class="font-[family-name:var(--font-display)] font-extrabold text-[22px] tracking-[-0.02em]">
    Whisker<span class="text-[var(--accent)]">watch</span>
  </div>
  <nav class="flex flex-col gap-0.5">
    {#each nav as item (item.key)}
      <button
        type="button"
        onclick={() => item.enabled && onnavigate(item.screen)}
        disabled={!item.enabled}
        title={item.enabled ? undefined : $_('nav.comingSoon')}
        class="flex items-center gap-2.5 py-2 px-2.5 rounded-[var(--radius-md)] text-[length:var(--text-body)] text-left {active ===
        item.screen
          ? 'font-bold text-[var(--accent)] bg-[var(--accent-tint)] cursor-default'
          : item.enabled
            ? 'font-medium text-[var(--text-secondary)] cursor-pointer hover:bg-[var(--surface-raised)]'
            : 'font-medium text-[var(--text-secondary)] cursor-not-allowed opacity-60'}"
      >
        <Icon icon={item.icon} />
        {$_(item.key)}
      </button>
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
    {#if onstartsession}
      <Button variant="primary" block onclick={onstartsession}>
        {#snippet icon()}
          <Icon icon={Play} />
        {/snippet}
        {$_('dashboard.startSession')}
      </Button>
    {/if}
  </div>
</aside>
