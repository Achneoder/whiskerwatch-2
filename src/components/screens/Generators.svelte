<script lang="ts">
  import { Dices, Swords, Package, UserRound } from 'lucide-svelte';
  import { _ } from 'svelte-i18n';
  import AppSidebar, { type NavScreen } from '../layout/AppSidebar.svelte';
  import Button from '../ui/Button.svelte';
  import Card from '../ui/Card.svelte';
  import Stepper from '../ui/Stepper.svelte';
  import DiceRoll from '../ui/DiceRoll.svelte';
  import Icon from '../ui/Icon.svelte';
  import { rollDice, type DiceRollResult } from '../../lib/generators/roll';
  import { ENCOUNTER_TABLE, ITEM_TABLE, generateFrom, generateNpc, type GeneratedNpc } from '../../lib/generators/tables';

  interface Props {
    onnavigate: (screen: NavScreen) => void;
    onstartsession?: () => void;
  }

  let { onnavigate, onstartsession }: Props = $props();

  const diceSides = [4, 6, 8, 10, 12, 20];
  let count = $state(2);
  let sides = $state(6);
  let modifier = $state(0);
  let diceResult = $state<DiceRollResult | null>(null);

  function doRollDice() {
    diceResult = rollDice(count, sides, modifier);
  }

  let encounter = $state<string | null>(null);
  let item = $state<string | null>(null);
  let npc = $state<GeneratedNpc | null>(null);
</script>

<div class="flex flex-col md:flex-row min-h-screen bg-[var(--bg)] text-[var(--text)]">
  <AppSidebar active="generators" {onnavigate} {onstartsession} />

  <main class="flex-1 p-[var(--sp-6)] max-w-[var(--content-max)] flex flex-col gap-[var(--sp-5)]">
    <header>
      <div class="ww-label text-[var(--accent)]">{$_('generators.eyebrow')}</div>
      <h1 class="text-[length:var(--text-h1)] mt-1">{$_('generators.title')}</h1>
    </header>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-[var(--sp-4)]">
      <!-- Dice -->
      <Card eyebrow={$_('generators.dice.eyebrow')} title={$_('generators.dice.title')}>
        <div class="flex flex-col gap-[var(--sp-4)]">
          <div class="flex gap-[var(--sp-5)] flex-wrap">
            <Stepper label={$_('generators.dice.count')} value={count} min={1} max={6} size="md" onchange={(v) => (count = v)} />
            <div class="flex flex-col gap-1.5 items-center">
              <span class="ww-label">{$_('generators.dice.sides')}</span>
              <select
                bind:value={sides}
                class="h-10 rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface-raised)] px-3 text-[length:var(--text-body)] w-fit"
              >
                {#each diceSides as s (s)}
                  <option value={s}>d{s}</option>
                {/each}
              </select>
            </div>
            <Stepper
              label={$_('generators.dice.modifier')}
              value={modifier}
              min={-5}
              max={5}
              size="md"
              onchange={(v) => (modifier = v)}
            />
          </div>
          <Button variant="primary" onclick={doRollDice}>
            {#snippet icon()}
              <Icon icon={Dices} />
            {/snippet}
            {$_('generators.dice.roll')}
          </Button>
          {#if diceResult}
            <DiceRoll
              dice={diceResult.dice}
              notation={diceResult.notation}
              total={diceResult.total}
              outcome="neutral"
            />
          {/if}
        </div>
      </Card>

      <!-- Encounter -->
      <Card eyebrow={$_('generators.encounter.eyebrow')} title={$_('generators.encounter.title')}>
        <div class="flex flex-col gap-[var(--sp-4)]">
          <Button variant="secondary" onclick={() => (encounter = generateFrom(ENCOUNTER_TABLE))}>
            {#snippet icon()}
              <Icon icon={Swords} />
            {/snippet}
            {$_('generators.encounter.roll')}
          </Button>
          {#if encounter}
            <p class="bg-[var(--surface-sunk)] rounded-[var(--radius-md)] p-[var(--sp-3)] text-[length:var(--text-body)] text-[var(--text-secondary)]">
              {encounter}
            </p>
          {/if}
        </div>
      </Card>

      <!-- Item -->
      <Card eyebrow={$_('generators.item.eyebrow')} title={$_('generators.item.title')}>
        <div class="flex flex-col gap-[var(--sp-4)]">
          <Button variant="secondary" onclick={() => (item = generateFrom(ITEM_TABLE))}>
            {#snippet icon()}
              <Icon icon={Package} />
            {/snippet}
            {$_('generators.item.roll')}
          </Button>
          {#if item}
            <p class="bg-[var(--surface-sunk)] rounded-[var(--radius-md)] p-[var(--sp-3)] text-[length:var(--text-body)] text-[var(--text-secondary)]">
              {item}
            </p>
          {/if}
        </div>
      </Card>

      <!-- NPC -->
      <Card eyebrow={$_('generators.npc.eyebrow')} title={$_('generators.npc.title')}>
        <div class="flex flex-col gap-[var(--sp-4)]">
          <Button variant="secondary" onclick={() => (npc = generateNpc())}>
            {#snippet icon()}
              <Icon icon={UserRound} />
            {/snippet}
            {$_('generators.npc.roll')}
          </Button>
          {#if npc}
            <div class="bg-[var(--surface-sunk)] rounded-[var(--radius-md)] p-[var(--sp-3)] flex flex-col gap-1">
              <div class="font-[family-name:var(--font-display)] font-bold text-[length:var(--text-title)]">{npc.name}</div>
              <div class="text-[length:var(--text-sm)] text-[var(--text-muted)]">{npc.role}</div>
              <div class="text-[length:var(--text-body)] text-[var(--text-secondary)] mt-1">
                <span class="ww-label">{$_('generators.npc.quirk')}</span>
                {npc.quirk}
              </div>
              <div class="text-[length:var(--text-body)] text-[var(--text-secondary)]">
                <span class="ww-label">{$_('generators.npc.want')}</span>
                {npc.want}
              </div>
            </div>
          {/if}
        </div>
      </Card>
    </div>
  </main>
</div>
