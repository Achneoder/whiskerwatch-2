<script lang="ts">
  import {
    LayoutDashboard,
    Users,
    ListTree,
    PawPrint,
    Swords,
    Map,
    WandSparkles,
    ScrollText,
    Moon,
    Sun,
    Play,
    Languages,
    Settings,
  } from 'lucide-svelte';
  import { _ } from 'svelte-i18n';
  import Button from '../ui/Button.svelte';
  import Icon from '../ui/Icon.svelte';
  import { getTheme, toggleTheme, initTheme } from '../../lib/stores/theme.svelte';
  import { locale, setLocale, type SupportedLocale } from '../../lib/i18n';

  export type NavScreen =
    | 'overview'
    | 'warband'
    | 'adventure'
    | 'bestiary'
    | 'factions'
    | 'hexMap'
    | 'generators'
    | 'sessions'
    | 'settings';

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
    { screen: 'bestiary', icon: PawPrint, key: 'nav.bestiary', enabled: true },
    { screen: 'factions', icon: Swords, key: 'nav.factions', enabled: true },
    { screen: 'hexMap', icon: Map, key: 'nav.hexMap', enabled: true },
    { screen: 'generators', icon: WandSparkles, key: 'nav.generators', enabled: true },
    { screen: 'sessions', icon: ScrollText, key: 'nav.sessions', enabled: true },
  ];

  function toggleLocale() {
    const next: SupportedLocale = $locale === 'en' ? 'de' : 'en';
    setLocale(next);
  }
</script>

<!-- Desktop / tablet-landscape sidebar -->
<aside
  class="hidden md:flex md:w-[var(--sidebar-w)] shrink-0 border-r border-[var(--border)] bg-[var(--surface)] py-[var(--sp-5)] px-[var(--sp-4)] flex-col gap-[var(--sp-5)]"
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
    <button
      type="button"
      aria-current={active === 'settings' ? 'page' : undefined}
      onclick={() => onnavigate('settings')}
      class="flex items-center gap-2.5 py-2 px-2.5 rounded-[var(--radius-md)] text-[length:var(--text-body)] text-left border-t border-[var(--border)] pt-3 {active ===
      'settings'
        ? 'font-bold text-[var(--accent)] bg-[var(--accent-tint)] cursor-default'
        : 'font-medium text-[var(--text-secondary)] cursor-pointer hover:bg-[var(--surface-raised)]'}"
    >
      <Icon icon={Settings} />
      {$_('nav.settings')}
    </button>
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

<!-- Mobile / tablet-portrait top bar -->
<header class="flex md:hidden flex-col sticky top-0 z-10 bg-[var(--surface)] border-b border-[var(--border)] w-full">
  <div class="flex items-center justify-between gap-[var(--sp-3)] px-[var(--sp-4)] py-[var(--sp-3)]">
    <div class="font-[family-name:var(--font-display)] font-extrabold text-[18px] tracking-[-0.02em] shrink-0">
      Whisker<span class="text-[var(--accent)]">watch</span>
    </div>
    <div class="flex items-center gap-1.5 shrink-0">
      <button
        type="button"
        aria-label={$_('nav.settings')}
        aria-current={active === 'settings' ? 'page' : undefined}
        onclick={() => onnavigate('settings')}
        class="grid place-items-center w-9 h-9 rounded-[var(--radius-md)] cursor-pointer {active === 'settings'
          ? 'text-[var(--accent)] bg-[var(--accent-tint)]'
          : 'text-[var(--text-secondary)] hover:bg-[var(--surface-raised)]'}"
      >
        <Icon icon={Settings} />
      </button>
      <button
        type="button"
        aria-label={$_('locale.label')}
        onclick={toggleLocale}
        class="grid place-items-center w-9 h-9 rounded-[var(--radius-md)] text-[var(--text-secondary)] hover:bg-[var(--surface-raised)] cursor-pointer"
      >
        <Icon icon={Languages} />
      </button>
      <button
        type="button"
        aria-label={getTheme() === 'light' ? $_('theme.dark') : $_('theme.light')}
        onclick={toggleTheme}
        class="grid place-items-center w-9 h-9 rounded-[var(--radius-md)] text-[var(--text-secondary)] hover:bg-[var(--surface-raised)] cursor-pointer"
      >
        <Icon icon={getTheme() === 'light' ? Moon : Sun} />
      </button>
      {#if onstartsession}
        <button
          type="button"
          aria-label={$_('dashboard.startSession')}
          onclick={onstartsession}
          class="grid place-items-center w-9 h-9 rounded-[var(--radius-md)] bg-[var(--accent)] text-[var(--on-accent)] cursor-pointer"
        >
          <Icon icon={Play} />
        </button>
      {/if}
    </div>
  </div>
  <nav class="flex overflow-x-auto gap-1 px-[var(--sp-2)] pb-[var(--sp-2)]">
    {#each nav as item (item.key)}
      <button
        type="button"
        onclick={() => item.enabled && onnavigate(item.screen)}
        disabled={!item.enabled}
        title={item.enabled ? undefined : $_('nav.comingSoon')}
        class="flex flex-col items-center gap-0.5 shrink-0 py-1.5 px-3 rounded-[var(--radius-md)] text-[length:var(--text-caption)] whitespace-nowrap {active ===
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
</header>
