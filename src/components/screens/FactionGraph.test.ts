import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import FactionGraph from './FactionGraph.svelte';
import type { Faction } from '../../lib/stores/factions.svelte';
import type { FactionEdge } from '../../lib/stores/factionEdges.svelte';

const factions: Faction[] = [
  { id: 'a', name: 'The Court', disposition: 'hostile', clock: 3, of: 6, note: '', tags: [] },
  { id: 'b', name: 'The Keepers', disposition: 'ally', clock: 5, of: 6, note: '', tags: [] },
];

describe('FactionGraph', () => {
  it('renders a node per faction and a line per drawable edge', () => {
    const edges: FactionEdge[] = [{ id: 'e1', sourceId: 'a', targetId: 'b', type: 'enemy' }];
    const { container } = render(FactionGraph, { props: { factions, edges, onselect: vi.fn() } });

    expect(screen.getByRole('button', { name: 'The Court' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'The Keepers' })).toBeInTheDocument();
    expect(container.querySelectorAll('line')).toHaveLength(1);
  });

  it('skips an edge that references a missing faction', () => {
    const edges: FactionEdge[] = [{ id: 'e1', sourceId: 'a', targetId: 'ghost', type: 'ally' }];
    const { container } = render(FactionGraph, { props: { factions, edges, onselect: vi.fn() } });

    expect(container.querySelectorAll('line')).toHaveLength(0);
  });

  it('shows an empty message when there are no factions', () => {
    render(FactionGraph, { props: { factions: [], edges: [], onselect: vi.fn() } });

    expect(screen.getByText(/relationship web/)).toBeInTheDocument();
  });
});
