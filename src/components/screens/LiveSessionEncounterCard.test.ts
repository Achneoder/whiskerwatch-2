import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import LiveSessionEncounterCard from './LiveSessionEncounterCard.svelte';
import type { EncounterInstance } from './LiveSessionEncounterInstance.svelte';
import type { BestiaryEntry } from '../../lib/stores/bestiary.svelte';

function bestiaryEntry(overrides: Partial<BestiaryEntry> = {}): BestiaryEntry {
  return {
    id: 'b1',
    name: 'Gnawing Court Ratling',
    category: 'Vermin',
    hd: 2,
    hp: 4,
    armor: 1,
    attacks: [],
    special: '',
    notes: '',
    ...overrides,
  };
}

function instance(overrides: Partial<EncounterInstance> = {}): EncounterInstance {
  return { id: 'e1', label: 'Gnawing Court Ratling 1', hp: 4, maxHp: 4, ...overrides };
}

function baseProps(overrides: Record<string, unknown> = {}) {
  return {
    hexName: 'Tunnel Junction',
    hasBestiary: true,
    encounterResult: null as BestiaryEntry | null,
    reactionResult: null,
    instances: [] as EncounterInstance[],
    openDrawerId: null as string | null,
    hadInstances: false,
    notice: null as { text: string; undo?: (() => void) | undefined } | null,
    onrollencounter: vi.fn(),
    onrollreaction: vi.fn(),
    onaddanother: vi.fn(),
    ontoggledrawer: vi.fn(),
    onhurtinstance: vi.fn(),
    onhealinstance: vi.fn(),
    onremoveinstance: vi.fn(),
    ondismissnotice: vi.fn(),
    ...overrides,
  };
}

describe('LiveSessionEncounterCard', () => {
  it('shows only the roll button before anything has been rolled', () => {
    render(LiveSessionEncounterCard, { props: baseProps() });

    expect(screen.getByRole('button', { name: 'Roll an encounter' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /add another/i })).not.toBeInTheDocument();
  });

  it('shows the "+ Add another" chip and calls onaddanother once a result exists', async () => {
    const onaddanother = vi.fn();
    render(LiveSessionEncounterCard, {
      props: baseProps({ encounterResult: bestiaryEntry(), onaddanother }),
    });

    const chip = screen.getByRole('button', { name: '+ Add another Gnawing Court Ratling' });
    await fireEvent.click(chip);

    expect(onaddanother).toHaveBeenCalledOnce();
  });

  it('renders one row per instance', () => {
    render(LiveSessionEncounterCard, {
      props: baseProps({
        encounterResult: bestiaryEntry(),
        instances: [instance({ id: 'e1', label: 'Ratling 1' }), instance({ id: 'e2', label: 'Ratling 2' })],
      }),
    });

    expect(screen.getByText('Ratling 1')).toBeInTheDocument();
    expect(screen.getByText('Ratling 2')).toBeInTheDocument();
  });

  it('opens only the drawer matching openDrawerId', () => {
    render(LiveSessionEncounterCard, {
      props: baseProps({
        encounterResult: bestiaryEntry(),
        instances: [instance({ id: 'e1', label: 'Ratling 1' }), instance({ id: 'e2', label: 'Ratling 2' })],
        openDrawerId: 'e1',
      }),
    });

    // Only one drawer's chip grid should be present at a time.
    expect(screen.getAllByRole('button', { name: '3' })).toHaveLength(1);
  });

  it('shows Defeated + Remove for a 0 HP instance and calls onremoveinstance', async () => {
    const onremoveinstance = vi.fn();
    render(LiveSessionEncounterCard, {
      props: baseProps({
        encounterResult: bestiaryEntry(),
        instances: [instance({ id: 'e2', label: 'Ratling 2', hp: 0 })],
        onremoveinstance,
      }),
    });

    expect(screen.getByText('Defeated')).toBeInTheDocument();
    await fireEvent.click(screen.getByRole('button', { name: 'Remove' }));

    expect(onremoveinstance).toHaveBeenCalledWith('e2');
  });

  it('shows the fight-over tip once every instance has been removed after having had at least one', () => {
    render(LiveSessionEncounterCard, {
      props: baseProps({ encounterResult: bestiaryEntry(), instances: [], hadInstances: true }),
    });

    expect(screen.getByText(/Fight's over/)).toBeInTheDocument();
  });

  it('shows no tip and no instance list before anything has ever been rolled', () => {
    render(LiveSessionEncounterCard, {
      props: baseProps({ encounterResult: bestiaryEntry(), instances: [], hadInstances: false }),
    });

    expect(screen.queryByText(/Fight's over/)).not.toBeInTheDocument();
  });

  it('shows an inline notice with an undo affordance', async () => {
    const undo = vi.fn();
    const ondismissnotice = vi.fn();
    render(LiveSessionEncounterCard, {
      props: baseProps({ notice: { text: 'Ratling 2 removed — Undo', undo }, ondismissnotice }),
    });

    expect(screen.getByText('Ratling 2 removed — Undo')).toBeInTheDocument();
    await fireEvent.click(screen.getByRole('button', { name: 'Undo' }));

    expect(undo).toHaveBeenCalledOnce();
    expect(ondismissnotice).toHaveBeenCalledOnce();
  });

  it('shows the reaction roll button below the instance list', () => {
    render(LiveSessionEncounterCard, {
      props: baseProps({ encounterResult: bestiaryEntry(), instances: [instance()] }),
    });

    expect(screen.getByRole('button', { name: 'Roll Reaction' })).toBeInTheDocument();
  });
});
