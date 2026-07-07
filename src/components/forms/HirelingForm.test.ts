import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import HirelingForm from './HirelingForm.svelte';

describe('HirelingForm', () => {
  it('saves a new hireling with the entered name', async () => {
    const onsave = vi.fn();
    render(HirelingForm, { props: { onsave, oncancel: vi.fn() } });

    await fireEvent.input(screen.getByLabelText('Name'), { target: { value: 'Oat' } });
    await fireEvent.input(screen.getByLabelText('Role'), { target: { value: 'Porter' } });
    await fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(onsave).toHaveBeenCalledOnce();
    const saved = onsave.mock.calls[0]![0];
    expect(saved.name).toBe('Oat');
    expect(saved.role).toBe('Porter');
  });

  it('does not save when the name is blank', async () => {
    const onsave = vi.fn();
    render(HirelingForm, { props: { onsave, oncancel: vi.fn() } });

    await fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(onsave).not.toHaveBeenCalled();
  });

  it('pre-fills fields from an initial hireling', () => {
    render(HirelingForm, {
      props: {
        initial: {
          id: '1',
          name: 'Oat',
          role: 'Porter',
          hp: 3,
          max: 3,
          str: 10,
          maxStr: 10,
          dex: 10,
          wil: 10,
          loyalty: 4,
          notes: 'Reliable.',
          status: 'active',
          conditions: [],
          scars: [],
          items: [],
        },
        onsave: vi.fn(),
        oncancel: vi.fn(),
      },
    });

    expect(screen.getByDisplayValue('Oat')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Reliable.')).toBeInTheDocument();
  });

  it('calls oncancel when Cancel is clicked', async () => {
    const oncancel = vi.fn();
    render(HirelingForm, { props: { onsave: vi.fn(), oncancel } });

    await fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(oncancel).toHaveBeenCalledOnce();
  });
});
