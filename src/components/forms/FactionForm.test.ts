import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import FactionForm from './FactionForm.svelte';
import type { Faction } from '../../lib/stores/factions.svelte';

const sample: Faction = {
  id: '1',
  name: 'The Gnawing Court',
  disposition: 'hostile',
  clock: 3,
  of: 6,
  note: 'Rats in the granary',
  tags: ['Sewers'],
};

describe('FactionForm', () => {
  it('saves a new faction with an added tag', async () => {
    const onsave = vi.fn();
    render(FactionForm, { props: { onsave, oncancel: vi.fn() } });

    await fireEvent.input(screen.getByLabelText('Name'), { target: { value: 'Owl Toll' } });
    await fireEvent.input(screen.getByPlaceholderText('Add a tag'), { target: { value: 'Toll' } });
    await fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    await fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(onsave).toHaveBeenCalledOnce();
    const saved = onsave.mock.calls[0]![0];
    expect(saved.name).toBe('Owl Toll');
    expect(saved.disposition).toBe('neutral');
    expect(saved.tags).toEqual(['Toll']);
  });

  it('does not save when the name is blank', async () => {
    const onsave = vi.fn();
    render(FactionForm, { props: { onsave, oncancel: vi.fn() } });

    await fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(onsave).not.toHaveBeenCalled();
  });

  it('pre-fills fields from an initial faction', () => {
    render(FactionForm, { props: { initial: sample, onsave: vi.fn(), oncancel: vi.fn() } });

    expect(screen.getByDisplayValue('The Gnawing Court')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Rats in the granary')).toBeInTheDocument();
    expect(screen.getByText('Sewers')).toBeInTheDocument();
  });

  it('hides the relationship editor in add mode', () => {
    render(FactionForm, { props: { onsave: vi.fn(), oncancel: vi.fn() } });

    expect(screen.getByText(/Save the faction first/)).toBeInTheDocument();
  });

  it('adds a relationship in edit mode', async () => {
    const onaddedge = vi.fn();
    const other: Faction = { ...sample, id: '2', name: 'Owl Bridge Toll' };
    render(FactionForm, {
      props: { initial: sample, otherFactions: [other], edges: [], onaddedge, onsave: vi.fn(), oncancel: vi.fn() },
    });

    await fireEvent.change(screen.getByLabelText('Faction'), { target: { value: '2' } });
    await fireEvent.click(screen.getByRole('button', { name: 'Add relationship' }));

    expect(onaddedge).toHaveBeenCalledOnce();
    expect(onaddedge.mock.calls[0]![0]).toMatchObject({ sourceId: '1', targetId: '2', type: 'ally' });
  });

  it('calls oncancel when Cancel is clicked', async () => {
    const oncancel = vi.fn();
    render(FactionForm, { props: { onsave: vi.fn(), oncancel } });

    await fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(oncancel).toHaveBeenCalledOnce();
  });
});
