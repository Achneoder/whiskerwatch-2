import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/svelte';
import Adventure from './Adventure.svelte';
import { replaceBeats } from '../../lib/stores/beats.svelte';
import { replaceHexNodes } from '../../lib/stores/hexmap.svelte';
import { replaceFactions } from '../../lib/stores/factions.svelte';

describe('Adventure', () => {
  beforeEach(() => {
    replaceBeats([]);
    replaceHexNodes([]);
    replaceFactions([]);
  });

  it('adds a root beat', async () => {
    render(Adventure, { props: { onnavigate: vi.fn() } });

    await fireEvent.click(screen.getByRole('button', { name: 'Add beat' }));
    await fireEvent.input(screen.getByLabelText('Title'), { target: { value: 'Find the tunnel' } });
    await fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(screen.getByText('Find the tunnel')).toBeInTheDocument();
  });

  it('adds a sub-beat under an existing beat', async () => {
    replaceBeats([{ id: 'root', parentId: null, title: 'Root beat', notes: '', status: 'planned', hexNodeId: null, factionIds: [] }]);
    render(Adventure, { props: { onnavigate: vi.fn() } });

    await fireEvent.click(screen.getByRole('button', { name: 'Add sub-beat' }));
    await fireEvent.input(screen.getByLabelText('Title'), { target: { value: 'Child beat' } });
    await fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(screen.getByText('Child beat')).toBeInTheDocument();
  });

  it('cycles a beat status when its pill is clicked', async () => {
    replaceBeats([{ id: 'root', parentId: null, title: 'Root beat', notes: '', status: 'planned', hexNodeId: null, factionIds: [] }]);
    render(Adventure, { props: { onnavigate: vi.fn() } });

    expect(screen.getByText('Planned')).toBeInTheDocument();
    await fireEvent.click(screen.getByText('Planned'));
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('deletes a beat and its sub-beats after confirming, warning about the count', async () => {
    replaceBeats([
      { id: 'root', parentId: null, title: 'Root beat', notes: '', status: 'planned', hexNodeId: null, factionIds: [] },
      { id: 'child', parentId: 'root', title: 'Child beat', notes: '', status: 'planned', hexNodeId: null, factionIds: [] },
    ]);
    render(Adventure, { props: { onnavigate: vi.fn() } });

    await fireEvent.click(screen.getAllByRole('button', { name: 'Delete' })[0]!);
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText(/1 sub-beats/)).toBeInTheDocument();
    await fireEvent.click(within(dialog).getByRole('button', { name: 'Delete' }));

    expect(screen.queryByText('Root beat')).not.toBeInTheDocument();
    expect(screen.queryByText('Child beat')).not.toBeInTheDocument();
  });

  it('links a beat to a hex and a faction, and shows both as tags on the beat row', async () => {
    replaceHexNodes([{ id: 'hex-1', q: 0, r: 0, terrain: 'settlement', name: 'Bramblewatch', notes: '', discovered: true, encounters: [] }]);
    replaceFactions([{ id: 'fac-1', name: 'The Gnawing Court', disposition: 'hostile', clock: 3, of: 6, note: '', tags: [] }]);
    render(Adventure, { props: { onnavigate: vi.fn() } });

    await fireEvent.click(screen.getByRole('button', { name: 'Add beat' }));
    await fireEvent.input(screen.getByLabelText('Title'), { target: { value: 'The granary raid' } });
    await fireEvent.change(screen.getByLabelText('Linked hex'), { target: { value: 'hex-1' } });
    await fireEvent.change(screen.getByLabelText('Faction'), { target: { value: 'fac-1' } });
    await fireEvent.click(screen.getByRole('button', { name: 'Add faction' }));
    await fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(screen.getByText('The granary raid')).toBeInTheDocument();
    expect(screen.getByText('C3')).toBeInTheDocument();
    expect(screen.getByText('The Gnawing Court')).toBeInTheDocument();
  });
});
