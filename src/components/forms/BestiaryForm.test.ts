import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import BestiaryForm from './BestiaryForm.svelte';

describe('BestiaryForm', () => {
  it('saves a new entry with an added attack', async () => {
    const onsave = vi.fn();
    render(BestiaryForm, { props: { onsave, oncancel: vi.fn() } });

    await fireEvent.input(screen.getByLabelText('Name'), { target: { value: 'Ratling' } });
    await fireEvent.input(screen.getByPlaceholderText('Attack name'), { target: { value: 'Blade' } });
    await fireEvent.input(screen.getByPlaceholderText('Damage (e.g. d6)'), { target: { value: 'd6' } });
    await fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    await fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(onsave).toHaveBeenCalledOnce();
    const saved = onsave.mock.calls[0]![0];
    expect(saved.name).toBe('Ratling');
    expect(saved.attacks).toEqual([{ name: 'Blade', damage: 'd6' }]);
    expect(saved.category).toBe('Vermin');
  });

  it('does not save when the name is blank', async () => {
    const onsave = vi.fn();
    render(BestiaryForm, { props: { onsave, oncancel: vi.fn() } });

    await fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(onsave).not.toHaveBeenCalled();
  });

  it('pre-fills fields and attacks from an initial entry', () => {
    render(BestiaryForm, {
      props: {
        initial: {
          id: '1',
          name: 'Ratling',
          category: 'Vermin',
          hd: 2,
          hp: 4,
          armor: 1,
          attacks: [{ name: 'Blade', damage: 'd6' }],
          special: 'Pack tactics',
          notes: '',
        },
        onsave: vi.fn(),
        oncancel: vi.fn(),
      },
    });

    expect(screen.getByDisplayValue('Ratling')).toBeInTheDocument();
    expect(screen.getByText(/Blade/)).toBeInTheDocument();
    expect(screen.getByDisplayValue('Pack tactics')).toBeInTheDocument();
  });

  it('calls oncancel when Cancel is clicked', async () => {
    const oncancel = vi.fn();
    render(BestiaryForm, { props: { onsave: vi.fn(), oncancel } });

    await fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(oncancel).toHaveBeenCalledOnce();
  });
});
