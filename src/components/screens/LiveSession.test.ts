import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/svelte';
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
    wage: 5,
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

function mockD6Pair(d1: number, d2: number) {
  const spy = vi.spyOn(Math, 'random');
  spy.mockReturnValueOnce((d1 - 1) / 6 + 0.0001);
  spy.mockReturnValueOnce((d2 - 1) / 6 + 0.0001);
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
    replaceBeats([
      { id: 'b1', parentId: null, title: 'The granary raid', notes: '', status: 'active', hexNodeId: null, factionIds: [] },
    ]);
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

  it('opens a mouse\'s bag, burns a charge, and undoes it back', async () => {
    replaceParty([
      member({ items: [{ id: 'lantern-1', name: 'Lantern', slots: 1, charges: 3, maxCharges: 6, notes: '' }] }),
    ]);
    replaceHirelings([]);
    replaceFactions([]);
    replaceBeats([]);
    replaceSessions([]);
    render(LiveSession, { props: {} });

    await fireEvent.click(screen.getByRole('button', { name: /open pip's bag/i }));
    await fireEvent.click(screen.getByRole('button', { name: /Lantern, 3 of 6 charges, tap to use one/i }));

    expect(getParty().find((m) => m.id === 'p1')?.items[0]?.charges).toBe(2);
    expect(screen.getByText(/used a charge \(2\/6 left\)/i)).toBeInTheDocument();

    await fireEvent.click(screen.getByRole('button', { name: 'Undo' }));

    expect(getParty().find((m) => m.id === 'p1')?.items[0]?.charges).toBe(3);
  });

  it('shows "burned out" with no undo when a charge tick brings an item to exactly 0', async () => {
    replaceParty([
      member({ items: [{ id: 'lantern-1', name: 'Lantern', slots: 1, charges: 1, maxCharges: 6, notes: '' }] }),
    ]);
    replaceHirelings([]);
    replaceFactions([]);
    replaceBeats([]);
    replaceSessions([]);
    render(LiveSession, { props: {} });

    await fireEvent.click(screen.getByRole('button', { name: /open pip's bag/i }));
    await fireEvent.click(screen.getByRole('button', { name: /Lantern, 1 of 6 charges, tap to use one/i }));

    expect(getParty().find((m) => m.id === 'p1')?.items[0]?.charges).toBe(0);
    expect(screen.getByText(/burned out/i)).toBeInTheDocument();
  });

  it('shows "is empty" with no undo when tapping an already-empty item', async () => {
    replaceParty([
      member({ items: [{ id: 'lantern-1', name: 'Lantern', slots: 1, charges: 0, maxCharges: 6, notes: '' }] }),
    ]);
    replaceHirelings([]);
    replaceFactions([]);
    replaceBeats([]);
    replaceSessions([]);
    render(LiveSession, { props: {} });

    await fireEvent.click(screen.getByRole('button', { name: /open pip's bag/i }));
    await fireEvent.click(screen.getByRole('button', { name: /Lantern, 0 of 6 charges, tap to use one/i }));

    expect(getParty().find((m) => m.id === 'p1')?.items[0]?.charges).toBe(0);
    expect(screen.getByText(/Lantern is empty\./i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Undo' })).not.toBeInTheDocument();
  });

  it('rolls a loyalty save from a hireling\'s card and shows a pass/fail result inline', async () => {
    seed();
    mockD6Pair(1, 2); // total 3, well under Oat's loyalty of 4
    render(LiveSession, { props: {} });

    await fireEvent.click(screen.getByRole('button', { name: /roll a loyalty save for oat, loyalty 4/i }));

    expect(screen.getByText(/Loyalty save: 3 vs 4 — Passed/)).toBeInTheDocument();
  });

  it('does not show a loyalty pill on a party mouse\'s card', () => {
    seed();
    render(LiveSession, { props: {} });

    const pipCard = screen.getByTestId('mouse-card-Pip');
    expect(within(pipCard).queryByText('Loyalty')).not.toBeInTheDocument();
  });

  it('rolls a 2d6 loyalty save from the SaveDock\'s LOY button, only shown for hirelings', async () => {
    seed();
    mockD6Pair(1, 1); // total 2, well under Oat's loyalty of 4
    render(LiveSession, { props: {} });

    expect(screen.queryByRole('button', { name: /^LOY/ })).not.toBeInTheDocument();

    await fireEvent.change(screen.getByRole('combobox'), { target: { value: 'h1' } });

    expect(screen.getByRole('button', { name: /^LOY 4/ })).toBeInTheDocument();
    await fireEvent.click(screen.getByRole('button', { name: /^LOY 4/ }));
    await fireEvent.click(screen.getByRole('button', { name: /roll save/i }));

    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(screen.getByText('2d6')).toBeInTheDocument();
  });

  it('opens Pay Day, marks a hireling paid, and offers an inline loyalty check for an unpaid one', async () => {
    seed();
    mockD6Pair(6, 6); // total 12, over Oat's loyalty of 4 — a failed save
    render(LiveSession, { props: {} });

    await fireEvent.click(screen.getByRole('button', { name: /pay day/i }));

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Oat')).toBeInTheDocument();
    expect(within(dialog).getByText('5p')).toBeInTheDocument();
    expect(within(dialog).getByText('Unpaid')).toBeInTheDocument();

    await fireEvent.click(within(dialog).getByRole('button', { name: /roll loyalty save/i }));
    expect(within(dialog).getByText(/Loyalty save: 12 vs 4 — Failed/)).toBeInTheDocument();

    await fireEvent.click(within(dialog).getByText('Unpaid'));
    expect(within(dialog).getByText('Paid')).toBeInTheDocument();
  });

  it('resets Pay Day\'s paid state every time the modal reopens', async () => {
    seed();
    render(LiveSession, { props: {} });

    await fireEvent.click(screen.getByRole('button', { name: /pay day/i }));
    await fireEvent.click(screen.getByText('Unpaid'));
    expect(screen.getByText('Paid')).toBeInTheDocument();

    await fireEvent.click(screen.getByRole('dialog').querySelector('[aria-label="Close"]')!);
    await fireEvent.click(screen.getByRole('button', { name: /pay day/i }));

    expect(screen.getByText('Unpaid')).toBeInTheDocument();
  });
});
