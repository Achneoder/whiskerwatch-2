import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import FactionClockStrip from './FactionClockStrip.svelte';

const factions = [
  { id: 'a', name: 'The Court', clock: 3, of: 6 },
  { id: 'b', name: 'The Keepers', clock: 1, of: 6 },
];

describe('FactionClockStrip', () => {
  it('renders nothing when there are no factions to show', () => {
    render(FactionClockStrip, {
      props: { factions: [], notice: null, onbump: vi.fn(), ondismissnotice: vi.fn() },
    });

    expect(screen.queryByText('Faction clocks')).not.toBeInTheDocument();
  });

  it('renders a tappable pill per faction and calls onbump with its id', async () => {
    const onbump = vi.fn();
    render(FactionClockStrip, { props: { factions, notice: null, onbump, ondismissnotice: vi.fn() } });

    await fireEvent.click(screen.getByRole('button', { name: /The Court/ }));

    expect(onbump).toHaveBeenCalledWith('a');
  });

  it('shows a notice with an undo affordance and wires it up', async () => {
    const undo = vi.fn();
    const ondismissnotice = vi.fn();
    render(FactionClockStrip, {
      props: {
        factions,
        notice: { text: "The Court's clock advanced — Undo", undo },
        onbump: vi.fn(),
        ondismissnotice,
      },
    });

    expect(screen.getByText(/clock advanced/i)).toBeInTheDocument();
    await fireEvent.click(screen.getByRole('button', { name: 'Undo' }));

    expect(undo).toHaveBeenCalledOnce();
    expect(ondismissnotice).toHaveBeenCalledOnce();
  });
});
