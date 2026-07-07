import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import Generators from './Generators.svelte';
import { replaceBestiary, type BestiaryEntry } from '../../lib/stores/bestiary.svelte';
import { replaceHexNodes, type HexNode } from '../../lib/stores/hexmap.svelte';

const ratling: BestiaryEntry = {
  id: 'b1',
  name: 'Gnawing Court Ratling',
  category: 'Vermin',
  hd: 2,
  hp: 4,
  armor: 1,
  attacks: [{ name: 'Rusty blade', damage: 'd6' }],
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

const bramblewatch: HexNode = {
  id: 'h1',
  q: 0,
  r: 0,
  terrain: 'settlement',
  name: 'Bramblewatch',
  notes: '',
  discovered: true,
  encounters: [{ bestiaryId: 'b1', weight: 1 }],
};

describe('Generators', () => {
  beforeEach(() => {
    replaceBestiary([ratling, owl]);
    replaceHexNodes([bramblewatch]);
  });

  it('rolls dice and shows a result', async () => {
    render(Generators, { props: { onnavigate: vi.fn() } });

    await fireEvent.click(screen.getByRole('button', { name: 'Roll' }));

    expect(screen.getByText(/2d6/)).toBeInTheDocument();
  });

  it('rolls an encounter from the whole bestiary by default and shows a stat block', async () => {
    render(Generators, { props: { onnavigate: vi.fn() } });

    await fireEvent.click(screen.getByRole('button', { name: 'Roll an encounter' }));

    expect(screen.getByText('Rolled from the whole bestiary')).toBeInTheDocument();
    expect(screen.getByText(/Gnawing Court Ratling|Sewer Owl/)).toBeInTheDocument();
  });

  it('rolls an encounter scoped to a selected hex', async () => {
    render(Generators, { props: { onnavigate: vi.fn() } });

    await fireEvent.change(screen.getByRole('combobox', { name: 'Hex' }), { target: { value: 'h1' } });
    await fireEvent.click(screen.getByRole('button', { name: 'Roll an encounter' }));

    expect(screen.getByText('Rolled for Bramblewatch')).toBeInTheDocument();
    expect(screen.getByText('Gnawing Court Ratling')).toBeInTheDocument();
  });

  it('disables rolling and shows a message when the bestiary is empty', () => {
    replaceBestiary([]);
    render(Generators, { props: { onnavigate: vi.fn() } });

    expect(screen.getByRole('button', { name: 'Roll an encounter' })).toBeDisabled();
    expect(screen.getByText(/No bestiary entries yet/)).toBeInTheDocument();
  });

  it('rolls an item and shows a result from the table', async () => {
    render(Generators, { props: { onnavigate: vi.fn() } });

    await fireEvent.click(screen.getByRole('button', { name: 'Roll an item' }));

    const paragraphs = document.querySelectorAll('p');
    expect(paragraphs.length).toBeGreaterThan(0);
  });

  it('rolls an NPC and shows name, role, quirk and want', async () => {
    render(Generators, { props: { onnavigate: vi.fn() } });

    await fireEvent.click(screen.getByRole('button', { name: 'Roll an NPC' }));

    expect(screen.getByText('Quirk:')).toBeInTheDocument();
    expect(screen.getByText('Wants:')).toBeInTheDocument();
  });
});
