import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import HexNodeForm from './HexNodeForm.svelte';
import type { HexNode } from '../../lib/stores/hexmap.svelte';

const sample: HexNode = {
  id: '1',
  q: 2,
  r: -1,
  terrain: 'ruins',
  name: 'The Gnawgate',
  notes: 'Tunnel entrance',
  discovered: true,
};

describe('HexNodeForm', () => {
  it('saves with the default terrain and trimmed fields, omitting coordinates', async () => {
    const onsave = vi.fn();
    render(HexNodeForm, { props: { onsave, oncancel: vi.fn() } });

    await fireEvent.input(screen.getByLabelText('Name'), { target: { value: '  Sunwarp Meadow  ' } });
    await fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(onsave).toHaveBeenCalledOnce();
    const saved = onsave.mock.calls[0]![0];
    expect(saved).toEqual({ terrain: 'meadow', name: 'Sunwarp Meadow', notes: '', discovered: false });
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
});
