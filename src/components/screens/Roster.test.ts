import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/svelte';
import Roster from './Roster.svelte';
import { replaceParty } from '../../lib/stores/party.svelte';
import { replaceHirelings } from '../../lib/stores/hirelings.svelte';

describe('Roster', () => {
  beforeEach(() => {
    replaceParty([]);
    replaceHirelings([]);
  });

  it('adds a new party member through the modal form', async () => {
    render(Roster, { props: { onnavigate: vi.fn() } });

    await fireEvent.click(screen.getByRole('button', { name: 'Add mouse' }));
    await fireEvent.input(screen.getByLabelText('Name'), { target: { value: 'Juniper' } });
    await fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(screen.getByText('Juniper')).toBeInTheDocument();
  });

  it('deletes a party member after confirming', async () => {
    replaceParty([
      {
        id: '1',
        name: 'Pip',
        role: 'Scout',
        hp: 4,
        max: 6,
        str: 10,
        maxStr: 10,
        dex: 10,
        wil: 10,
        pips: 0,
        xp: 0,
        level: 1,
        status: 'active',
        conditions: [],
        scars: [],
        items: [],
      },
    ]);
    render(Roster, { props: { onnavigate: vi.fn() } });

    await fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    const dialog = screen.getByRole('dialog');
    await fireEvent.click(within(dialog).getByRole('button', { name: 'Delete' }));

    expect(screen.queryByText('Pip')).not.toBeInTheDocument();
  });

  it('adds a new hireling through the modal form', async () => {
    render(Roster, { props: { onnavigate: vi.fn() } });

    await fireEvent.click(screen.getByRole('button', { name: 'Add hireling' }));
    await fireEvent.input(screen.getByLabelText('Name'), { target: { value: 'Oat' } });
    await fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(screen.getByText('Oat')).toBeInTheDocument();
  });

  it('shows a hireling\'s loyalty as a pill and their wage as a tag when set', () => {
    replaceHirelings([
      {
        id: '1',
        name: 'Oat',
        role: 'Porter',
        hp: 3,
        max: 3,
        str: 10,
        maxStr: 10,
        dex: 10,
        wil: 10,
        loyalty: 9,
        wage: 5,
        notes: '',
        status: 'active',
        conditions: [],
        scars: [],
        items: [],
      },
    ]);
    render(Roster, { props: { onnavigate: vi.fn() } });

    expect(screen.getByText('Loyalty')).toBeInTheDocument();
    expect(screen.getByText('9')).toBeInTheDocument();
    expect(screen.getByText('5p/day')).toBeInTheDocument();
  });

  it('hides the wage tag when a hireling has no wage set', () => {
    replaceHirelings([
      {
        id: '1',
        name: 'Oat',
        role: 'Porter',
        hp: 3,
        max: 3,
        str: 10,
        maxStr: 10,
        dex: 10,
        wil: 10,
        loyalty: 9,
        wage: 0,
        notes: '',
        status: 'active',
        conditions: [],
        scars: [],
        items: [],
      },
    ]);
    render(Roster, { props: { onnavigate: vi.fn() } });

    expect(screen.queryByText(/p\/day/)).not.toBeInTheDocument();
  });

  it('imports a campaign file and replaces the roster', async () => {
    render(Roster, { props: { onnavigate: vi.fn() } });

    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      party: [{ id: 'x', name: 'Clover', role: 'Sage', hp: 6, max: 6, pips: 0, conditions: [] }],
      hirelings: [],
    };
    const file = new File([JSON.stringify(data)], 'campaign.json', { type: 'application/json' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    await fireEvent.change(input, { target: { files: [file] } });

    expect(await screen.findByText('Clover')).toBeInTheDocument();
  });

  it('shows an error when the imported file is not valid JSON', async () => {
    render(Roster, { props: { onnavigate: vi.fn() } });

    const file = new File(['not json'], 'bad.json', { type: 'application/json' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    await fireEvent.change(input, { target: { files: [file] } });

    expect(await screen.findByText(/not valid JSON/)).toBeInTheDocument();
  });
});
