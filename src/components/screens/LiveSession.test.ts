import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import LiveSession from './LiveSession.svelte';
import { replaceParty, getParty, type PartyMember } from '../../lib/stores/party.svelte';
import { replaceHirelings, type Hireling } from '../../lib/stores/hirelings.svelte';
import { replaceFactions, getFactions } from '../../lib/stores/factions.svelte';
import { replaceBeats } from '../../lib/stores/beats.svelte';
import { replaceSessions } from '../../lib/stores/sessions.svelte';

function member(overrides: Partial<PartyMember> = {}): PartyMember {
  return {
    id: 'p1',
    name: 'Pip',
    role: 'Scout',
    hp: 6,
    max: 6,
    str: 10,
    maxStr: 10,
    dex: 13,
    wil: 9,
    pips: 0,
    xp: 0,
    level: 1,
    status: 'active',
    conditions: [],
    scars: [],
    items: [],
    ...overrides,
  };
}

function hireling(overrides: Partial<Hireling> = {}): Hireling {
  return {
    id: 'h1',
    name: 'Oat',
    role: 'Porter',
    hp: 3,
    max: 3,
    str: 10,
    maxStr: 10,
    dex: 10,
    wil: 10,
    loyalty: 4,
    notes: '',
    status: 'active',
    conditions: [],
    scars: [],
    items: [],
    ...overrides,
  };
}

function mockD20Roll(result: number) {
  vi.spyOn(Math, 'random').mockReturnValue((result - 1) / 20 + 0.0001);
}

describe('LiveSession', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  function seed() {
    replaceParty([member()]);
    replaceHirelings([hireling()]);
    replaceFactions([
      { id: 'f1', name: 'The Court', disposition: 'hostile', clock: 3, of: 6, note: '', tags: [] },
      { id: 'f2', name: 'The Keepers', disposition: 'ally', clock: 1, of: 6, note: '', tags: [] },
    ]);
    replaceBeats([{ id: 'b1', parentId: null, title: 'The granary raid', notes: '', status: 'active' }]);
    replaceSessions([{ id: 's1', number: 5, date: '2026-01-01', title: 'Into the tunnels', summary: '' }]);
  }

  it('sets live density on the document element and cleans it up on unmount', () => {
    seed();
    const { unmount } = render(LiveSession, { props: {} });

    expect(document.documentElement.getAttribute('data-density')).toBe('live');

    unmount();

    expect(document.documentElement.getAttribute('data-density')).toBeNull();
  });

  it('calls onexit when the exit button is clicked', async () => {
    seed();
    const onexit = vi.fn();
    render(LiveSession, { props: { onexit } });

    await fireEvent.click(screen.getByRole('button', { name: /end session/i }));

    expect(onexit).toHaveBeenCalledOnce();
  });

  it('shows the real session and active beat in the header instead of fixture text', () => {
    seed();
    render(LiveSession, { props: {} });

    expect(screen.getByText(/Session 5/)).toBeInTheDocument();
    expect(screen.getByText('Into the tunnels')).toBeInTheDocument();
    expect(screen.getByText('The granary raid')).toBeInTheDocument();
  });

  it('falls back to placeholder copy when there is no session or active beat', () => {
    replaceParty([member()]);
    replaceHirelings([]);
    replaceFactions([]);
    replaceBeats([]);
    replaceSessions([]);
    render(LiveSession, { props: {} });

    expect(screen.getByText('No session logged yet')).toBeInTheDocument();
    expect(screen.getByText('No active beat')).toBeInTheDocument();
  });

  it('renders hireling cards alongside the party', () => {
    seed();
    render(LiveSession, { props: {} });

    // "Pip" also appears as a <option> in the save dock's mouse picker, so
    // assert presence rather than uniqueness here.
    expect(screen.getAllByText('Pip').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Oat').length).toBeGreaterThan(0);
  });

  it('rolls a Mausritter save (d20 roll-under) and shows a pass/fail result', async () => {
    seed();
    mockD20Roll(5); // well under Pip's STR of 10
    render(LiveSession, { props: {} });

    await fireEvent.click(screen.getByRole('button', { name: /roll save/i }));

    expect(screen.getByText('Success')).toBeInTheDocument();
  });

  it('applies damage through a card\'s drawer and shows an undo affordance', async () => {
    seed();
    render(LiveSession, { props: {} });

    // Pip's card renders first (party section before hirelings).
    const [hurtButton] = screen.getAllByRole('button', { name: 'Hurt' });
    await fireEvent.click(hurtButton!);
    await fireEvent.click(screen.getByRole('button', { name: '3' }));

    expect(getParty().find((m) => m.id === 'p1')?.hp).toBe(3);
    expect(screen.getByText(/Applied 3 damage/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument();
  });

  it('toggles a condition through the + Condition drawer', async () => {
    seed();
    render(LiveSession, { props: {} });

    const [conditionTrigger] = screen.getAllByRole('button', { name: /\+ Condition/ });
    await fireEvent.click(conditionTrigger!);
    await fireEvent.click(screen.getByRole('button', { name: 'Frightened' }));

    expect(getParty().find((m) => m.id === 'p1')?.conditions).toEqual(['frightened']);
  });

  it('bumps a faction clock from the faction clock strip and shows an undo affordance', async () => {
    seed();
    render(LiveSession, { props: {} });

    await fireEvent.click(screen.getByRole('button', { name: /The Court/ }));

    expect(getFactions().find((f) => f.id === 'f1')?.clock).toBe(4);
    expect(screen.getByText(/clock advanced/i)).toBeInTheDocument();
  });
});
