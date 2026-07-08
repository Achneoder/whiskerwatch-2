import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/svelte';
import Timeline from './Timeline.svelte';
import { replaceCampaignHistory } from '../../lib/stores/campaignHistory.svelte';
import { replaceHexNodes } from '../../lib/stores/hexmap.svelte';
import { replaceFactions } from '../../lib/stores/factions.svelte';

describe('Timeline', () => {
  beforeEach(() => {
    replaceCampaignHistory([]);
    replaceHexNodes([]);
    replaceFactions([]);
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
});
