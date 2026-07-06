<script lang="ts">
  import { ChevronLeft, Dices } from 'lucide-svelte';
  import { _ } from 'svelte-i18n';
  import Button from '../ui/Button.svelte';
  import Card from '../ui/Card.svelte';
  import HpBar from '../ui/HpBar.svelte';
  import StatusPill from '../ui/StatusPill.svelte';
  import Stepper from '../ui/Stepper.svelte';
  import DiceRoll from '../ui/DiceRoll.svelte';
  import Icon from '../ui/Icon.svelte';
  import { getParty, setHp } from '../../lib/stores/party.svelte';

  interface Props {
    onexit?: () => void;
  }

  let { onexit }: Props = $props();

  $effect(() => {
    document.documentElement.setAttribute('data-density', 'live');
    return () => document.documentElement.removeAttribute('data-density');
  });

  const party = getParty();

  interface Roll {
    dice: [number, number];
    total: number;
    outcome: 'success' | 'partial' | 'fail';
  }

  let roll = $state<Roll | null>(null);

  function doRoll() {
    const d: [number, number] = [1 + Math.floor(Math.random() * 6), 1 + Math.floor(Math.random() * 6)];
    const total = d[0] + d[1];
    roll = { dice: d, total, outcome: total >= 8 ? 'success' : total >= 6 ? 'partial' : 'fail' };
  }
</script>

<div class="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col">
  <!-- Top bar — deliberately sparse -->
  <header
    class="sticky top-0 z-5 flex items-center justify-between gap-[var(--sp-4)] py-[var(--sp-4)] px-[var(--sp-5)] bg-[var(--surface)] border-b border-[var(--border)]"
  >
    <button
      onclick={onexit}
      aria-label={$_('liveSession.exitAriaLabel')}
      class="inline-flex items-center gap-2 bg-none border-none text-[var(--text-muted)] cursor-pointer text-[length:var(--text-body)] font-[family-name:var(--font-body)]"
    >
      <Icon icon={ChevronLeft} size="live" />{$_('liveSession.exit')}
    </button>
    <div class="text-center">
      <div class="ww-label text-[var(--accent)]">{$_('liveSession.eyebrow', { values: { session: 5 } })}</div>
      <div class="font-[family-name:var(--font-display)] font-bold text-[length:var(--text-h3)]">
        The granary raid
      </div>
    </div>
    <StatusPill tone="clock" count={3} of={6} size="md">Court</StatusPill>
  </header>

  <main class="flex-1 w-full max-w-160 mx-auto p-[var(--sp-5)] flex flex-col gap-[var(--sp-5)]">
    {#each party as member, i (member.name)}
      {@const low = member.hp <= 2}
      <Card style={low ? 'border-color: var(--danger)' : undefined}>
        <div class="flex items-center gap-[var(--sp-4)] flex-wrap">
          <div class="flex-1 min-w-35">
            <div class="font-[family-name:var(--font-display)] font-extrabold text-[length:var(--text-h3)]">
              {member.name}
            </div>
            {#each member.conditions as cond (cond.label)}
              <div class="mt-2">
                <StatusPill tone="danger" size="live">{cond.label}</StatusPill>
              </div>
            {/each}
          </div>
          <Stepper
            label={$_('liveSession.hp')}
            value={member.hp}
            max={member.max}
            tone="hp"
            size="live"
            onchange={(v) => setHp(i, v)}
          />
        </div>
        <div class="mt-[var(--sp-4)]">
          <HpBar value={member.hp} max={member.max} label="" showValue={false} size="live" />
        </div>
      </Card>
    {/each}
  </main>

  <!-- Roll dock — the one obvious action, thumb-reachable -->
  <div
    class="sticky bottom-0 bg-[var(--surface)] border-t border-[var(--border)] p-[var(--sp-5)] flex flex-col items-center gap-[var(--sp-4)] shadow-[var(--shadow-lg)]"
  >
    {#if roll}
      <DiceRoll
        dice={roll.dice}
        notation="2d6"
        total={roll.total}
        outcome={roll.outcome}
        label={$_('liveSession.lastRoll')}
        size="live"
      />
    {/if}
    <div class="flex gap-[var(--sp-3)] w-full max-w-160">
      <Button variant="primary" size="live" block onclick={doRoll}>
        {#snippet icon()}
          <Icon icon={Dices} size="live" />
        {/snippet}
        {$_('liveSession.roll2d6')}
      </Button>
    </div>
  </div>
</div>
