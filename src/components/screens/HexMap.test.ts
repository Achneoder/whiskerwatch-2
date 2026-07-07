import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import HexMap from './HexMap.svelte';
import { replaceHexNodes, type HexNode } from '../../lib/stores/hexmap.svelte';
import { replaceBeats } from '../../lib/stores/beats.svelte';
import { replaceBestiary, type BestiaryEntry } from '../../lib/stores/bestiary.svelte';

const home: HexNode = {
  id: '1',
  q: 0,
  r: 0,
  terrain: 'settlement',
  name: 'Bramblewatch',
  notes: 'Home warren',
  discovered: true,
  encounters: [],
};

describe('HexMap', () => {
  beforeEach(() => {
    replaceHexNodes([]);
    replaceBeats([]);
    replaceBestiary([]);
  });

  it('renders a seeded content hex by its accessible label', () => {
    replaceHexNodes([home]);
    render(HexMap, { props: { onnavigate: vi.fn() } });

    expect(screen.getByRole('button', { name: /Bramblewatch/ })).toBeInTheDocument();
  });

  it('opens the add editor when an empty hex is tapped', async () => {
    render(HexMap, { props: { onnavigate: vi.fn() } });

    await fireEvent.click(screen.getByRole('button', { name: 'C3' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Describe hex')).toBeInTheDocument();
  });

  it('opens the edit editor prefilled when a content hex is tapped', async () => {
    replaceHexNodes([home]);
    render(HexMap, { props: { onnavigate: vi.fn() } });

    await fireEvent.click(screen.getByRole('button', { name: /Bramblewatch/ }));

    expect(screen.getByDisplayValue('Bramblewatch')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Home warren')).toBeInTheDocument();
  });

  it('shows the empty state when there are no hexes', () => {
    render(HexMap, { props: { onnavigate: vi.fn() } });

    expect(screen.getByText(/No hexes charted yet/)).toBeInTheDocument();
  });

  it('shows beats touching a hex in its detail modal', async () => {
    replaceHexNodes([home]);
    replaceBeats([
      { id: 'b1', parentId: null, title: 'The granary raid', notes: '', status: 'active', hexNodeId: '1', factionIds: [] },
    ]);
    render(HexMap, { props: { onnavigate: vi.fn() } });

    await fireEvent.click(screen.getByRole('button', { name: /Bramblewatch/ }));

    expect(screen.getByText('Beats touching this hex')).toBeInTheDocument();
    expect(screen.getByText('The granary raid')).toBeInTheDocument();
  });

  it('shows encounters linked to a hex in its detail modal', async () => {
    const ratling: BestiaryEntry = {
      id: 'r1',
      name: 'Gnawing Court Ratling',
      category: 'Vermin',
      hd: 2,
      hp: 4,
      armor: 1,
      attacks: [],
      special: '',
      notes: '',
    };
    replaceBestiary([ratling]);
    replaceHexNodes([{ ...home, encounters: [{ bestiaryId: 'r1', weight: 3 }] }]);
    render(HexMap, { props: { onnavigate: vi.fn() } });

    await fireEvent.click(screen.getByRole('button', { name: /Bramblewatch/ }));

    expect(screen.getByText('Encounters here')).toBeInTheDocument();
    expect(screen.getByText('Gnawing Court Ratling ×3')).toBeInTheDocument();
  });
});
