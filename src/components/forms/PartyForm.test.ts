import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import PartyForm from './PartyForm.svelte';

describe('PartyForm', () => {
  it('saves a new member with the entered name', async () => {
    const onsave = vi.fn();
    render(PartyForm, { props: { onsave, oncancel: vi.fn() } });

    await fireEvent.input(screen.getByLabelText('Name'), { target: { value: 'Juniper' } });
    await fireEvent.input(screen.getByLabelText('Role'), { target: { value: 'Scout' } });
    await fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(onsave).toHaveBeenCalledOnce();
    const saved = onsave.mock.calls[0]![0];
    expect(saved.name).toBe('Juniper');
    expect(saved.role).toBe('Scout');
    expect(saved.conditions).toEqual([]);
  });

  it('does not save when the name is blank', async () => {
    const onsave = vi.fn();
    render(PartyForm, { props: { onsave, oncancel: vi.fn() } });

    await fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(onsave).not.toHaveBeenCalled();
  });

  it('pre-fills fields from an initial member and adds a condition', async () => {
    const onsave = vi.fn();
    render(PartyForm, {
      props: {
        initial: { id: '1', name: 'Pip', role: 'Scout', hp: 4, max: 6, pips: 100, conditions: [] },
        onsave,
        oncancel: vi.fn(),
      },
    });

    expect(screen.getByDisplayValue('Pip')).toBeInTheDocument();

    await fireEvent.input(screen.getByPlaceholderText('Condition name'), { target: { value: 'Frightened' } });
    await fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    await fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    const saved = onsave.mock.calls[0]![0];
    expect(saved.conditions).toEqual([{ tone: 'danger', label: 'Frightened' }]);
  });

  it('calls oncancel when Cancel is clicked', async () => {
    const oncancel = vi.fn();
    render(PartyForm, { props: { onsave: vi.fn(), oncancel } });

    await fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(oncancel).toHaveBeenCalledOnce();
  });
});
