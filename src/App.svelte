<script lang="ts">
  import Dashboard from './components/screens/Dashboard.svelte';
  import Roster from './components/screens/Roster.svelte';
  import LiveSession from './components/screens/LiveSession.svelte';
  import type { NavScreen } from './components/layout/AppSidebar.svelte';

  let screen = $state<'dashboard' | 'roster' | 'live'>('dashboard');

  function navigate(target: NavScreen) {
    if (target === 'overview') screen = 'dashboard';
    else if (target === 'warband') screen = 'roster';
  }
</script>

{#if screen === 'live'}
  <LiveSession onexit={() => (screen = 'dashboard')} />
{:else if screen === 'roster'}
  <Roster onnavigate={navigate} onstartsession={() => (screen = 'live')} />
{:else}
  <Dashboard onnavigate={navigate} onstartsession={() => (screen = 'live')} />
{/if}
