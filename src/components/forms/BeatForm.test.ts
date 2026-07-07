import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import BeatForm from './BeatForm.svelte';
import type { HexNode } from '../../lib/stores/hexmap.svelte';
import type { Faction } from '../../lib/stores/factions.svelte';

const hexNode: HexNode = {
  id: 'hex-1',
  q: 0,
  r: 0,
  terrain: 'settlement',
  name: 'Bramblewatch',
  notes: '',
  discovered: true,
  encounters: [],
};

const faction: Faction = {
  id: 'fac-1',
  name: 'The Gnawing Court',
  disposition: 'hostile',
  clock: 3,
  of: 6,
  note: '',
  tags: [],
};

describe('BeatForm', () => {
  it('saves a new beat with the entered title and no links', async () => {
    const onsave = vi.fn();
    render(BeatForm, { props: { onsave, oncancel: vi.fn() } });

    await fireEvent.input(screen.getByLabelText('Title'), { target: { value: 'Find the tunnel' } });
    await fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(onsave).toHaveBeenCalledWith({
      title: 'Find the tunnel',
      notes: '',
      status: 'planned',
      hexNodeId: null,
      factionIds: [],
    });
  });

  it('does not save when the title is blank', async () => {
    const onsave = vi.fn();
    render(BeatForm, { props: { onsave, oncancel: vi.fn() } });

    await fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(onsave).not.toHaveBeenCalled();
  });

  it('pre-fills fields from an initial beat', () => {
    render(BeatForm, {
      props: {
        initial: {
          id: '1',
          parentId: null,
          title: 'Find the tunnel',
          notes: 'Check the sewers',
          status: 'active',
          hexNodeId: null,
          factionIds: [],
        },
        onsave: vi.fn(),
        oncancel: vi.fn(),
      },
    });

    expect(screen.getByDisplayValue('Find the tunnel')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Check the sewers')).toBeInTheDocument();
  });

  it('calls oncancel when Cancel is clicked', async () => {
    const oncancel = vi.fn();
    render(BeatForm, { props: { onsave: vi.fn(), oncancel } });

    await fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(oncancel).toHaveBeenCalledOnce();
  });

  it('links a hex and a faction, and includes them on save', async () => {
    const onsave = vi.fn();
    render(BeatForm, {
      props: { hexNodes: [hexNode], factions: [faction], onsave, oncancel: vi.fn() },
    });

    await fireEvent.input(screen.getByLabelText('Title'), { target: { value: 'Raid the granary' } });
    await fireEvent.change(screen.getByLabelText('Linked hex'), { target: { value: 'hex-1' } });
    await fireEvent.change(screen.getByLabelText('Faction'), { target: { value: 'fac-1' } });
    await fireEvent.click(screen.getByRole('button', { name: 'Add faction' }));
    await fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(onsave).toHaveBeenCalledWith({
      title: 'Raid the granary',
      notes: '',
      status: 'planned',
      hexNodeId: 'hex-1',
      factionIds: ['fac-1'],
    });
  });

  it('removes a linked faction chip before saving', async () => {
    const onsave = vi.fn();
    render(BeatForm, {
      props: {
        initial: {
          id: '1',
          parentId: null,
          title: 'Raid the granary',
          notes: '',
          status: 'planned',
          hexNodeId: null,
          factionIds: ['fac-1'],
        },
        factions: [faction],
        onsave,
        oncancel: vi.fn(),
      },
    });

    expect(screen.getByText('The Gnawing Court')).toBeInTheDocument();
    await fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    await fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(onsave).toHaveBeenCalledWith(
      expect.objectContaining({ factionIds: [] })
    );
  });
});
