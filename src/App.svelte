<script lang="ts">
  import Dashboard from './components/screens/Dashboard.svelte';
  import Roster from './components/screens/Roster.svelte';
  import Adventure from './components/screens/Adventure.svelte';
  import Bestiary from './components/screens/Bestiary.svelte';
  import Factions from './components/screens/Factions.svelte';
  import HexMap from './components/screens/HexMap.svelte';
  import Generators from './components/screens/Generators.svelte';
  import Sessions from './components/screens/Sessions.svelte';
  import Settings from './components/screens/Settings.svelte';
  import LiveSession from './components/screens/LiveSession.svelte';
  import type { NavScreen } from './components/layout/AppSidebar.svelte';

  let screen = $state<
    | 'dashboard'
    | 'roster'
    | 'adventure'
    | 'bestiary'
    | 'factions'
    | 'hexMap'
    | 'generators'
    | 'sessions'
    | 'settings'
    | 'live'
  >('dashboard');

  function navigate(target: NavScreen) {
    if (target === 'overview') screen = 'dashboard';
    else if (target === 'warband') screen = 'roster';
    else if (target === 'adventure') screen = 'adventure';
    else if (target === 'bestiary') screen = 'bestiary';
    else if (target === 'factions') screen = 'factions';
    else if (target === 'hexMap') screen = 'hexMap';
    else if (target === 'generators') screen = 'generators';
    else if (target === 'sessions') screen = 'sessions';
    else if (target === 'settings') screen = 'settings';
  }
</script>

{#if screen === 'live'}
  <LiveSession onexit={() => (screen = 'dashboard')} />
{:else if screen === 'roster'}
  <Roster onnavigate={navigate} onstartsession={() => (screen = 'live')} />
{:else if screen === 'adventure'}
  <Adventure onnavigate={navigate} onstartsession={() => (screen = 'live')} />
{:else if screen === 'bestiary'}
  <Bestiary onnavigate={navigate} onstartsession={() => (screen = 'live')} />
{:else if screen === 'factions'}
  <Factions onnavigate={navigate} onstartsession={() => (screen = 'live')} />
{:else if screen === 'hexMap'}
  <HexMap onnavigate={navigate} onstartsession={() => (screen = 'live')} />
{:else if screen === 'generators'}
  <Generators onnavigate={navigate} onstartsession={() => (screen = 'live')} />
{:else if screen === 'sessions'}
  <Sessions onnavigate={navigate} onstartsession={() => (screen = 'live')} />
{:else if screen === 'settings'}
  <Settings onnavigate={navigate} onstartsession={() => (screen = 'live')} />
{:else}
  <Dashboard onnavigate={navigate} onstartsession={() => (screen = 'live')} />
{/if}
