import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import { fireEvent } from '@testing-library/svelte';
import LiveSessionInventoryModal from './LiveSessionInventoryModal.svelte';
import type { Item } from '../../lib/items';

function makeItem(overrides: Partial<Item> = {}): Item {
  return {
    id: 'i1',
    name: 'Torch',
    slots: 1,
    charges: null,
    maxCharges: null,
    notes: '',
    ...overrides,
  };
}

describe('LiveSessionInventoryModal', () => {
  it('renders nothing when closed', () => {
    render(LiveSessionInventoryModal, {
      props: { name: 'Pip', items: [], open: false, onburn: vi.fn(), onclose: vi.fn() },
    });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows the mouse name and the used/max slots line', () => {
    render(LiveSessionInventoryModal, {
      props: {
        name: 'Pip',
        items: [makeItem({ id: 'a', slots: 2 })],
        open: true,
        onburn: vi.fn(),
        onclose: vi.fn(),
      },
    });

    expect(screen.getByText('Pip')).toBeInTheDocument();
    expect(screen.getByText('2 / 10 slots used')).toBeInTheDocument();
  });

  it('renders a non-chargeable item as static (no tap affordance)', () => {
    render(LiveSessionInventoryModal, {
      props: {
        name: 'Pip',
        items: [makeItem({ id: 'a', name: 'Rope', charges: null, maxCharges: null })],
        open: true,
        onburn: vi.fn(),
        onclose: vi.fn(),
      },
    });

    expect(screen.getByText('Rope')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Rope/ })).not.toBeInTheDocument();
  });

  it('renders a chargeable item as a full-cell tap target that calls onburn with its id', async () => {
    const onburn = vi.fn();
    render(LiveSessionInventoryModal, {
      props: {
        name: 'Pip',
        items: [makeItem({ id: 'lantern-1', name: 'Lantern', charges: 4, maxCharges: 6 })],
        open: true,
        onburn,
        onclose: vi.fn(),
      },
    });

    const cell = screen.getByRole('button', { name: /Lantern, 4 of 6 charges, tap to use one/i });
    await fireEvent.click(cell);

    expect(onburn).toHaveBeenCalledWith('lantern-1');
  });

  it('renders the charge dots reflecting current vs max', () => {
    render(LiveSessionInventoryModal, {
      props: {
        name: 'Pip',
        items: [makeItem({ id: 'a', name: 'Lantern', charges: 2, maxCharges: 4 })],
        open: true,
        onburn: vi.fn(),
        onclose: vi.fn(),
      },
    });

    expect(screen.getByText('●●○○')).toBeInTheDocument();
  });

  it('stays open after a tap (parent controls `open`, not this component)', async () => {
    render(LiveSessionInventoryModal, {
      props: {
        name: 'Pip',
        items: [makeItem({ id: 'a', name: 'Lantern', charges: 4, maxCharges: 6 })],
        open: true,
        onburn: vi.fn(),
        onclose: vi.fn(),
      },
    });

    await fireEvent.click(screen.getByRole('button', { name: /Lantern/ }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('shows a notice with an undo affordance and wires it up', async () => {
    const undo = vi.fn();
    const ondismissnotice = vi.fn();
    render(LiveSessionInventoryModal, {
      props: {
        name: 'Pip',
        items: [],
        open: true,
        notice: { text: 'Lantern used a charge (2/6 left)', undo },
        onburn: vi.fn(),
        onclose: vi.fn(),
        ondismissnotice,
      },
    });

    expect(screen.getByText('Lantern used a charge (2/6 left)')).toBeInTheDocument();
    await fireEvent.click(screen.getByRole('button', { name: 'Undo' }));

    expect(undo).toHaveBeenCalledOnce();
    expect(ondismissnotice).toHaveBeenCalledOnce();
  });

  it('closes via the close callback', async () => {
    const onclose = vi.fn();
    render(LiveSessionInventoryModal, {
      props: { name: 'Pip', items: [], open: true, onburn: vi.fn(), onclose },
    });

    await fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(onclose).toHaveBeenCalledOnce();
  });
});
