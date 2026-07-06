<script lang="ts">
  import Dashboard from './components/screens/Dashboard.svelte';
  import LiveSession from './components/screens/LiveSession.svelte';

  let screen = $state<'dashboard' | 'live'>('dashboard');
</script>

{#if screen === 'live'}
  <LiveSession onexit={() => (screen = 'dashboard')} />
{:else}
  <Dashboard onstartsession={() => (screen = 'live')} />
{/if}
