import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import HexNodeForm from './HexNodeForm.svelte';
import type { HexNode } from '../../lib/stores/hexmap.svelte';
import type { BestiaryEntry } from '../../lib/stores/bestiary.svelte';
import type { Faction } from '../../lib/stores/factions.svelte';

const sample: HexNode = {
  id: '1',
  q: 2,
  r: -1,
  terrain: 'ruins',
  name: 'The Gnawgate',
  notes: 'Tunnel entrance',
  discovered: true,
  encounters: [],
  controlledBy: null,
  contestedBy: [],
};

const ratling: BestiaryEntry = {
  id: 'b1',
  name: 'Gnawing Court Ratling',
  category: 'Vermin',
  hd: 2,
  hp: 4,
  armor: 1,
  attacks: [],
  special: '',
  notes: '',
};

const owl: BestiaryEntry = {
  id: 'b2',
  name: 'Sewer Owl',
  category: 'Bird of Prey',
  hd: 3,
  hp: 6,
  armor: 0,
  attacks: [],
  special: '',
  notes: '',
};

const gnawingCourt: Faction = {
  id: 'f1',
  name: 'The Gnawing Court',
  disposition: 'hostile',
  clock: 3,
  of: 6,
  note: '',
  tags: [],
};

const seedKeepers: Faction = {
  id: 'f2',
  name: 'The Seed-Keepers',
  disposition: 'ally',
  clock: 1,
  of: 6,
  note: '',
  tags: [],
};

describe('HexNodeForm', () => {
  it('saves with the default terrain and trimmed fields, omitting coordinates', async () => {
    const onsave = vi.fn();
    render(HexNodeForm, { props: { onsave, oncancel: vi.fn() } });

    await fireEvent.input(screen.getByLabelText('Name'), { target: { value: '  Sunwarp Meadow  ' } });
    await fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(onsave).toHaveBeenCalledOnce();
    const saved = onsave.mock.calls[0]![0];
    expect(saved).toEqual({
      terrain: 'meadow',
      name: 'Sunwarp Meadow',
      notes: '',
      discovered: false,
      encounters: [],
      controlledBy: null,
      contestedBy: [],
    });
    expect(saved).not.toHaveProperty('q');
    expect(saved).not.toHaveProperty('r');
    expect(saved).not.toHaveProperty('id');
  });

  it('pre-fills fields from an initial hex', () => {
    render(HexNodeForm, { props: { initial: sample, onsave: vi.fn(), oncancel: vi.fn() } });

    expect(screen.getByDisplayValue('The Gnawgate')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Tunnel entrance')).toBeInTheDocument();
    expect(screen.getByLabelText(/Discovered/)).toBeChecked();
  });

  it('calls oncancel when Cancel is clicked', async () => {
    const oncancel = vi.fn();
    render(HexNodeForm, { props: { onsave: vi.fn(), oncancel } });

    await fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(oncancel).toHaveBeenCalledOnce();
  });

  it('shows a muted message and no picker when the bestiary is empty', () => {
    render(HexNodeForm, { props: { onsave: vi.fn(), oncancel: vi.fn() } });

    expect(screen.getByText(/Add entries to the Bestiary first/)).toBeInTheDocument();
    expect(screen.queryByLabelText('Bestiary entry')).not.toBeInTheDocument();
  });

  it('adds and removes an encounter, reflected in the onsave payload', async () => {
    const onsave = vi.fn();
    render(HexNodeForm, { props: { bestiary: [ratling, owl], onsave, oncancel: vi.fn() } });

    await fireEvent.change(screen.getByLabelText('Bestiary entry'), { target: { value: 'b1' } });
    await fireEvent.click(screen.getByRole('button', { name: 'Add' }));

    expect(screen.getByText(/Gnawing Court Ratling/)).toBeInTheDocument();

    await fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onsave).toHaveBeenCalledOnce();
    expect(onsave.mock.calls[0]![0].encounters).toEqual([{ bestiaryId: 'b1', weight: 1 }]);

    await fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    await fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onsave.mock.calls[1]![0].encounters).toEqual([]);
  });

  it('sets a controlling faction and a contesting faction, reflected in the onsave payload', async () => {
    const onsave = vi.fn();
    render(HexNodeForm, { props: { factions: [gnawingCourt, seedKeepers], onsave, oncancel: vi.fn() } });

    await fireEvent.change(screen.getByLabelText('Controlled by'), { target: { value: 'f1' } });
    await fireEvent.change(screen.getByLabelText('Contesting faction'), { target: { value: 'f2' } });
    await fireEvent.click(screen.getByRole('button', { name: 'Add' }));

    expect(screen.getByText('The Seed-Keepers', { selector: 'span' })).toBeInTheDocument();

    await fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onsave).toHaveBeenCalledOnce();
    expect(onsave.mock.calls[0]![0].controlledBy).toBe('f1');
    expect(onsave.mock.calls[0]![0].contestedBy).toEqual(['f2']);
  });

  it('removes a faction from contestedBy when it is chosen as the controller', async () => {
    const onsave = vi.fn();
    render(HexNodeForm, { props: { factions: [gnawingCourt, seedKeepers], onsave, oncancel: vi.fn() } });

    await fireEvent.change(screen.getByLabelText('Contesting faction'), { target: { value: 'f1' } });
    await fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(screen.getByText('The Gnawing Court', { selector: 'span' })).toBeInTheDocument();

    await fireEvent.change(screen.getByLabelText('Controlled by'), { target: { value: 'f1' } });
    await fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(onsave.mock.calls[0]![0].controlledBy).toBe('f1');
    expect(onsave.mock.calls[0]![0].contestedBy).toEqual([]);
  });

  it('removes a contesting faction from the chip list', async () => {
    const onsave = vi.fn();
    render(HexNodeForm, { props: { factions: [gnawingCourt, seedKeepers], onsave, oncancel: vi.fn() } });

    await fireEvent.change(screen.getByLabelText('Contesting faction'), { target: { value: 'f1' } });
    await fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(screen.getByText('The Gnawing Court', { selector: 'span' })).toBeInTheDocument();

    await fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    await fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(onsave.mock.calls[0]![0].contestedBy).toEqual([]);
  });
});
