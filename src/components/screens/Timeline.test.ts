import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/svelte';
import Timeline from './Timeline.svelte';
import { replaceCampaignHistory } from '../../lib/stores/campaignHistory.svelte';
import { replaceHexNodes } from '../../lib/stores/hexmap.svelte';
import { replaceFactions } from '../../lib/stores/factions.svelte';
import { replaceAdventures } from '../../lib/stores/adventures.svelte';
import { replaceSessions } from '../../lib/stores/sessions.svelte';

describe('Timeline', () => {
  beforeEach(() => {
    replaceCampaignHistory([]);
    replaceHexNodes([]);
    replaceFactions([]);
    replaceAdventures([]);
    replaceSessions([]);
  });

  it('shows the empty state when nothing has happened yet', () => {
    render(Timeline, { props: { onnavigate: vi.fn() } });

    expect(
      screen.getByText('Nothing recorded yet — this fills in as you complete beats, log sessions, and bump faction clocks.'),
    ).toBeInTheDocument();
  });

  it('renders a grouped, newest-first feed of mixed entry types', () => {
    replaceCampaignHistory([
      { id: '1', type: 'session', timestamp: '2026-07-01T10:00:00.000Z', sessionId: 's1', number: 4, title: 'Into the sewers' },
      {
        id: '2',
        type: 'beatCompleted',
        timestamp: '2026-07-02T09:00:00.000Z',
        beatId: 'b1',
        title: 'The granary raid',
        hexNodeId: null,
        factionIds: [],
      },
      {
        id: '3',
        type: 'clockChanged',
        timestamp: '2026-07-02T11:00:00.000Z',
        factionId: 'f1',
        factionName: 'The Gnawing Court',
        from: 2,
        to: 3,
        max: 6,
      },
    ]);

    render(Timeline, { props: { onnavigate: vi.fn() } });

    expect(screen.getByText('Session #4: Into the sewers')).toBeInTheDocument();
    expect(screen.getByText('Beat completed: The granary raid')).toBeInTheDocument();
    expect(screen.getByText('The Gnawing Court clock: 2 — 3')).toBeInTheDocument();

    const rows = screen.getAllByText(/Session #4|Beat completed|clock:/);
    // Newest day (07-02) groups first, and within that day the clock change (11:00)
    // sorts before the beat completion (09:00); the session (07-01) is oldest, last.
    expect(rows.map((el) => el.textContent)).toEqual([
      'The Gnawing Court clock: 2 — 3',
      'Beat completed: The granary raid',
      'Session #4: Into the sewers',
    ]);
  });

  it('resolves linked hex and faction names on a completed beat', () => {
    replaceHexNodes([
      {
        id: 'hex-1',
        q: 0,
        r: 0,
        terrain: 'meadow',
        name: 'Bramblewatch',
        notes: '',
        discovered: true,
        encounters: [],
        controlledBy: null,
        contestedBy: [],
      },
    ]);
    replaceFactions([{ id: 'fac-1', name: 'The Gnawing Court', disposition: 'hostile', clock: 1, of: 6, note: '', tags: [] }]);
    replaceCampaignHistory([
      {
        id: '1',
        type: 'beatCompleted',
        timestamp: '2026-07-02T09:00:00.000Z',
        beatId: 'b1',
        title: 'The granary raid',
        hexNodeId: 'hex-1',
        factionIds: ['fac-1'],
      },
    ]);

    render(Timeline, { props: { onnavigate: vi.fn() } });

    expect(screen.getByText('Bramblewatch')).toBeInTheDocument();
    expect(screen.getByText('The Gnawing Court')).toBeInTheDocument();
  });

  it('degrades gracefully when a completed beat references a hex/faction that has since been deleted', () => {
    // hexNodes/factions are empty (as if the hex and faction were deleted after
    // this beat was completed and logged) — the lookups in `hexNameFor`/
    // `factionNamesFor` should just come up empty rather than crash or render
    // a stale/undefined label.
    replaceCampaignHistory([
      {
        id: '1',
        type: 'beatCompleted',
        timestamp: '2026-07-02T09:00:00.000Z',
        beatId: 'b1',
        title: 'The granary raid',
        hexNodeId: 'deleted-hex',
        factionIds: ['deleted-faction'],
      },
    ]);

    expect(() => render(Timeline, { props: { onnavigate: vi.fn() } })).not.toThrow();

    expect(screen.getByText('Beat completed: The granary raid')).toBeInTheDocument();
  });

  it('renders a death entry with its cause', () => {
    replaceCampaignHistory([
      {
        id: '1',
        type: 'death',
        timestamp: '2026-07-02T09:00:00.000Z',
        memberId: 'p1',
        name: 'Wren',
        role: 'Tinker',
        source: 'party',
        cause: "Overrun by the barn cat's claws",
      },
    ]);

    render(Timeline, { props: { onnavigate: vi.fn() } });

    expect(screen.getByText("Wren died — Overrun by the barn cat's claws")).toBeInTheDocument();
  });

  it('falls back to a plain "died" line when no cause was given', () => {
    replaceCampaignHistory([
      {
        id: '1',
        type: 'death',
        timestamp: '2026-07-02T09:00:00.000Z',
        memberId: 'h1',
        name: 'Oat',
        role: 'Porter',
        source: 'hireling',
      },
    ]);

    render(Timeline, { props: { onnavigate: vi.fn() } });

    expect(screen.getByText('Oat died')).toBeInTheDocument();
    expect(screen.queryByText(/Oat died —/)).not.toBeInTheDocument();
  });

  it('filters out entry types when their toggle tag is tapped', async () => {
    replaceCampaignHistory([
      { id: '1', type: 'session', timestamp: '2026-07-01T10:00:00.000Z', sessionId: 's1', number: 4, title: 'Into the sewers' },
      {
        id: '2',
        type: 'beatCompleted',
        timestamp: '2026-07-02T09:00:00.000Z',
        beatId: 'b1',
        title: 'The granary raid',
        hexNodeId: null,
        factionIds: [],
      },
    ]);

    render(Timeline, { props: { onnavigate: vi.fn() } });

    expect(screen.getByText('Session #4: Into the sewers')).toBeInTheDocument();

    await fireEvent.click(within(screen.getByTestId('timeline-filters')).getByText('Sessions'));

    expect(screen.queryByText('Session #4: Into the sewers')).not.toBeInTheDocument();
    expect(screen.getByText('Beat completed: The granary raid')).toBeInTheDocument();
  });

  describe('adventure filter chips (Phase 12)', () => {
    beforeEach(() => {
      replaceAdventures([
        { id: 'adv-1', title: 'The granary raid', description: '', status: 'active' },
        { id: 'adv-2', title: 'The Gnawing Court', description: '', status: 'active' },
      ]);
      replaceSessions([
        { id: 's1', number: 4, date: '2026-07-01', title: 'Into the sewers', summary: '', adventureId: 'adv-1' },
        { id: 's2', number: 5, date: '2026-07-03', title: 'Confront the envoy', summary: '', adventureId: 'adv-2' },
      ]);
      replaceCampaignHistory([
        { id: '1', type: 'session', timestamp: '2026-07-01T10:00:00.000Z', sessionId: 's1', number: 4, title: 'Into the sewers' },
        { id: '2', type: 'session', timestamp: '2026-07-03T10:00:00.000Z', sessionId: 's2', number: 5, title: 'Confront the envoy' },
        {
          id: '3',
          type: 'beatCompleted',
          timestamp: '2026-07-02T09:00:00.000Z',
          beatId: 'b1',
          title: 'A different plot entirely',
          hexNodeId: null,
          factionIds: [],
        },
      ]);
    });

    it('shows no adventure filter chips when there are no adventures', () => {
      replaceAdventures([]);
      render(Timeline, { props: { onnavigate: vi.fn() } });

      expect(screen.queryByTestId('timeline-adventure-filters')).not.toBeInTheDocument();
    });

    it('filters session entries down to the selected adventure, leaving other entry types untouched', async () => {
      render(Timeline, { props: { onnavigate: vi.fn() } });

      const filters = within(screen.getByTestId('timeline-adventure-filters'));
      await fireEvent.click(filters.getByText('The Gnawing Court'));

      expect(screen.getByText('Session #5: Confront the envoy')).toBeInTheDocument();
      expect(screen.queryByText('Session #4: Into the sewers')).not.toBeInTheDocument();
      // beatCompleted has no adventureId concept — it's unaffected by this filter.
      expect(screen.getByText('Beat completed: A different plot entirely')).toBeInTheDocument();
    });
  });
});
