import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import Dashboard from './Dashboard.svelte';
import { replaceSessions } from '../../lib/stores/sessions.svelte';
import { replaceBeats, type Beat } from '../../lib/stores/beats.svelte';
import { replaceHexNodes, type HexNode } from '../../lib/stores/hexmap.svelte';
import { replaceHirelings, type Hireling } from '../../lib/stores/hirelings.svelte';
import { replaceFactions, type Faction } from '../../lib/stores/factions.svelte';
import { getCampaignName, setCampaignName, DEFAULT_CAMPAIGN_NAME } from '../../lib/stores/campaign.svelte';

function makeBeat(overrides: Partial<Beat> = {}): Beat {
  return {
    id: crypto.randomUUID(),
    parentId: null,
    title: 'A beat',
    notes: '',
    status: 'planned',
    hexNodeId: null,
    factionIds: [],
    adventureId: 'adv-1',
    ...overrides,
  };
}

function makeHexNode(overrides: Partial<HexNode> = {}): HexNode {
  return {
    id: crypto.randomUUID(),
    q: 0,
    r: 0,
    terrain: 'meadow',
    name: 'A hex',
    notes: '',
    discovered: true,
    encounters: [],
    controlledBy: null,
    contestedBy: [],
    ...overrides,
  };
}

function makeHireling(overrides: Partial<Hireling> = {}): Hireling {
  return {
    id: crypto.randomUUID(),
    name: 'A hireling',
    role: 'Guide',
    hp: 4,
    max: 4,
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

function makeFaction(overrides: Partial<Faction> = {}): Faction {
  return {
    id: crypto.randomUUID(),
    name: 'A faction',
    disposition: 'neutral',
    clock: 0,
    of: 6,
    note: '',
    tags: [],
    ...overrides,
  };
}

/** Zeroes out all four prep-checklist inputs so tests can opt individual counts back in. */
function clearPrepChecklistData() {
  replaceBeats([]);
  replaceHexNodes([]);
  replaceHirelings([]);
  replaceFactions([]);
}

describe('Dashboard', () => {
  beforeEach(() => {
    setCampaignName(DEFAULT_CAMPAIGN_NAME);
  });

  it('renders the warband and factions', () => {
    render(Dashboard, { props: { onnavigate: vi.fn() } });

    expect(screen.getByText('Pip')).toBeInTheDocument();
    expect(screen.getByText('Wren')).toBeInTheDocument();
    expect(screen.getByText('The Gnawing Court')).toBeInTheDocument();
  });

  it('calls onstartsession when the Start session button is clicked', async () => {
    const onstartsession = vi.fn();
    render(Dashboard, { props: { onnavigate: vi.fn(), onstartsession } });

    // AppSidebar renders a desktop <aside> and a mobile <header> nav in
    // parallel (toggled via CSS breakpoints jsdom doesn't apply), so both
    // "Start session" buttons exist in the DOM at once here.
    const [button] = screen.getAllByRole('button', { name: /start session/i });
    await button!.click();

    expect(onstartsession).toHaveBeenCalledOnce();
  });

  it('calls onnavigate with "warband" when Manage is clicked', async () => {
    const onnavigate = vi.fn();
    render(Dashboard, { props: { onnavigate } });

    const button = screen.getByRole('button', { name: /manage/i });
    await button.click();

    expect(onnavigate).toHaveBeenCalledWith('warband');
  });

  it('shows the next session number and last session title, and navigates to sessions', async () => {
    replaceSessions([{ id: '1', number: 7, date: '2026-01-01', title: 'Into the deep sewers', summary: '' }]);
    const onnavigate = vi.fn();
    render(Dashboard, { props: { onnavigate } });

    expect(screen.getByText('#8')).toBeInTheDocument();
    expect(screen.getByText('Into the deep sewers')).toBeInTheDocument();

    await fireEvent.click(screen.getByText('#8'));
    expect(onnavigate).toHaveBeenCalledWith('sessions');
  });

  it('shows an empty state when no sessions are logged', () => {
    replaceSessions([]);
    render(Dashboard, { props: { onnavigate: vi.fn() } });

    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('No sessions logged yet')).toBeInTheDocument();
  });

  describe('session prep checklist', () => {
    it('computes each row count from store data and still renders zero-count rows', () => {
      clearPrepChecklistData();
      replaceBeats([makeBeat({ status: 'active' }), makeBeat({ status: 'planned' }), makeBeat({ status: 'active' })]);
      replaceHexNodes([
        makeHexNode({ encounters: [{ bestiaryId: 'x', weight: 1 }] }),
        makeHexNode({ encounters: [] }),
      ]);
      // No hirelings, no factions -> those two rows should render as "0".
      render(Dashboard, { props: { onnavigate: vi.fn() } });

      expect(screen.getByText('2 beats')).toBeInTheDocument();
      expect(screen.getByText('1 hexes')).toBeInTheDocument();
      expect(screen.getByText('0 active hirelings')).toBeInTheDocument();
      expect(screen.getByText('0 faction clocks')).toBeInTheDocument();
    });

    it('counts only active hirelings drawing a nonzero wage', () => {
      clearPrepChecklistData();
      replaceHirelings([
        makeHireling({ status: 'active', wage: 5 }),
        makeHireling({ status: 'active', wage: 0 }),
        makeHireling({ status: 'deceased', wage: 5 }),
      ]);
      render(Dashboard, { props: { onnavigate: vi.fn() } });

      expect(screen.getByText('1 active hirelings')).toBeInTheDocument();
    });

    it('counts faction clocks at or one tick from full, matching Live Session\'s threshold', () => {
      clearPrepChecklistData();
      replaceFactions([
        makeFaction({ clock: 6, of: 6 }), // full
        makeFaction({ clock: 5, of: 6 }), // one away
        makeFaction({ clock: 2, of: 6 }), // not near full
        makeFaction({ clock: 3, of: 0 }), // no clock configured, excluded
      ]);
      render(Dashboard, { props: { onnavigate: vi.fn() } });

      expect(screen.getByText('2 faction clocks')).toBeInTheDocument();
    });

    it.each([
      ['beats', 'adventure', '1 beats', () => replaceBeats([makeBeat({ status: 'active' })])],
      [
        'hexes',
        'hexMap',
        '1 hexes',
        () => replaceHexNodes([makeHexNode({ encounters: [{ bestiaryId: 'x', weight: 1 }] })]),
      ],
      [
        'wages',
        'warband',
        '1 active hirelings',
        () => replaceHirelings([makeHireling({ status: 'active', wage: 5 })]),
      ],
      ['clocks', 'factions', '1 faction clocks', () => replaceFactions([makeFaction({ clock: 6, of: 6 })])],
    ] as const)('tapping the %s row navigates to %s', async (_label, target, leadText, seed) => {
      clearPrepChecklistData();
      seed();
      const onnavigate = vi.fn();
      render(Dashboard, { props: { onnavigate } });

      const row = screen.getByText(leadText).closest('button');
      expect(row).toBeTruthy();
      await fireEvent.click(row!);

      expect(onnavigate).toHaveBeenCalledWith(target);
    });

    it('shows the all-clear message when all four counts are zero', () => {
      clearPrepChecklistData();
      render(Dashboard, { props: { onnavigate: vi.fn() } });

      expect(screen.getByText(/Nothing urgent/)).toBeInTheDocument();
      expect(screen.queryByText(/beats$/)).not.toBeInTheDocument();
    });

    it('shows individual rows (not the all-clear message) when at least one count is nonzero', () => {
      clearPrepChecklistData();
      replaceBeats([makeBeat({ status: 'active' })]);
      render(Dashboard, { props: { onnavigate: vi.fn() } });

      expect(screen.queryByText(/Nothing urgent/)).not.toBeInTheDocument();
      expect(screen.getByText('1 beats')).toBeInTheDocument();
      expect(screen.getByText('0 hexes')).toBeInTheDocument();
      expect(screen.getByText('0 active hirelings')).toBeInTheDocument();
      expect(screen.getByText('0 faction clocks')).toBeInTheDocument();
    });
  });

  describe('campaign name', () => {
    it('renders the stored campaign name', () => {
      setCampaignName('The Gnawing Court Rises');
      render(Dashboard, { props: { onnavigate: vi.fn() } });

      expect(screen.getByRole('heading', { name: 'The Gnawing Court Rises' })).toBeInTheDocument();
    });

    it('reveals an editable field when the rename pencil is clicked, and saves on Enter', async () => {
      render(Dashboard, { props: { onnavigate: vi.fn() } });

      await fireEvent.click(screen.getByRole('button', { name: /rename campaign/i }));
      const input = screen.getByRole('textbox', { name: /campaign name/i });
      await fireEvent.input(input, { target: { value: 'The Salt Marsh Expedition' } });
      await fireEvent.keyDown(input, { key: 'Enter' });

      expect(getCampaignName()).toBe('The Salt Marsh Expedition');
      expect(screen.getByRole('heading', { name: 'The Salt Marsh Expedition' })).toBeInTheDocument();
    });

    it('saves the edited name on blur', async () => {
      render(Dashboard, { props: { onnavigate: vi.fn() } });

      await fireEvent.click(screen.getByRole('button', { name: /rename campaign/i }));
      const input = screen.getByRole('textbox', { name: /campaign name/i });
      await fireEvent.input(input, { target: { value: 'Sewers of Grimwater' } });
      await fireEvent.blur(input);

      expect(getCampaignName()).toBe('Sewers of Grimwater');
    });

    it('discards the edit on Escape', async () => {
      setCampaignName('Original Name');
      render(Dashboard, { props: { onnavigate: vi.fn() } });

      await fireEvent.click(screen.getByRole('button', { name: /rename campaign/i }));
      const input = screen.getByRole('textbox', { name: /campaign name/i });
      await fireEvent.input(input, { target: { value: 'Some Draft' } });
      await fireEvent.keyDown(input, { key: 'Escape' });

      expect(getCampaignName()).toBe('Original Name');
      expect(screen.getByRole('heading', { name: 'Original Name' })).toBeInTheDocument();
    });
  });
});
