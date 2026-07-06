<script lang="ts">
  import Dashboard from './components/screens/Dashboard.svelte';
  import Roster from './components/screens/Roster.svelte';
  import Adventure from './components/screens/Adventure.svelte';
  import Sessions from './components/screens/Sessions.svelte';
  import LiveSession from './components/screens/LiveSession.svelte';
  import type { NavScreen } from './components/layout/AppSidebar.svelte';

  let screen = $state<'dashboard' | 'roster' | 'adventure' | 'sessions' | 'live'>('dashboard');

  function navigate(target: NavScreen) {
    if (target === 'overview') screen = 'dashboard';
    else if (target === 'warband') screen = 'roster';
    else if (target === 'adventure') screen = 'adventure';
    else if (target === 'sessions') screen = 'sessions';
  }
</script>

{#if screen === 'live'}
  <LiveSession onexit={() => (screen = 'dashboard')} />
{:else if screen === 'roster'}
  <Roster onnavigate={navigate} onstartsession={() => (screen = 'live')} />
{:else if screen === 'adventure'}
  <Adventure onnavigate={navigate} onstartsession={() => (screen = 'live')} />
{:else if screen === 'sessions'}
  <Sessions onnavigate={navigate} onstartsession={() => (screen = 'live')} />
{:else}
  <Dashboard onnavigate={navigate} onstartsession={() => (screen = 'live')} />
{/if}
