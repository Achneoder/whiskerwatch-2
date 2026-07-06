import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/svelte';
import Bestiary from './Bestiary.svelte';
import { replaceBestiary } from '../../lib/stores/bestiary.svelte';

describe('Bestiary', () => {
  beforeEach(() => {
    replaceBestiary([]);
  });

  it('adds a new creature', async () => {
    render(Bestiary, { props: { onnavigate: vi.fn() } });

    await fireEvent.click(screen.getByRole('button', { name: 'Add creature' }));
    await fireEvent.input(screen.getByLabelText('Name'), { target: { value: 'Ratling' } });
    await fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(screen.getByText('Ratling')).toBeInTheDocument();
  });

  it('deletes a creature after confirming', async () => {
    replaceBestiary([
      {
        id: '1',
        name: 'Ratling',
        category: 'Vermin',
        hd: 2,
        hp: 4,
        armor: 1,
        attacks: [],
        special: '',
        notes: '',
      },
    ]);
    render(Bestiary, { props: { onnavigate: vi.fn() } });

    await fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    const dialog = screen.getByRole('dialog');
    await fireEvent.click(within(dialog).getByRole('button', { name: 'Delete' }));

    expect(screen.queryByText('Ratling')).not.toBeInTheDocument();
  });

  it('shows the empty state when there are no entries', () => {
    render(Bestiary, { props: { onnavigate: vi.fn() } });

    expect(screen.getByText(/No creatures yet/)).toBeInTheDocument();
  });
});
