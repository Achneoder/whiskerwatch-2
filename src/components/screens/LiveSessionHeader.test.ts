import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/svelte';
import LiveSessionHeader from './LiveSessionHeader.svelte';

describe('LiveSessionHeader', () => {
  it('shows the session number/title and active beat title', () => {
    render(LiveSessionHeader, {
      props: { sessionNumber: 5, sessionTitle: 'Into the tunnels', beatTitle: 'The granary raid' },
    });

    expect(screen.getByText(/Session 5/)).toBeInTheDocument();
    expect(screen.getByText('Into the tunnels')).toBeInTheDocument();
    expect(screen.getByText('The granary raid')).toBeInTheDocument();
  });

  it('falls back to placeholder copy when there is no session or active beat', () => {
    render(LiveSessionHeader, { props: { sessionNumber: null, sessionTitle: null, beatTitle: null } });

    expect(screen.getByText('No session logged yet')).toBeInTheDocument();
    expect(screen.getByText('No active beat')).toBeInTheDocument();
  });

  it('calls onexit when the exit button is clicked', async () => {
    const onexit = vi.fn();
    render(LiveSessionHeader, {
      props: { sessionNumber: 1, sessionTitle: 'A', beatTitle: 'B', onexit },
    });

    await fireEvent.click(screen.getByRole('button', { name: /back to prep/i }));

    expect(onexit).toHaveBeenCalledOnce();
  });

  it('calls onendsession when the End Session button is clicked', async () => {
    const onendsession = vi.fn();
    render(LiveSessionHeader, {
      props: { sessionNumber: 1, sessionTitle: 'A', beatTitle: 'B', onendsession },
    });

    await fireEvent.click(screen.getByRole('button', { name: /end session/i }));

    expect(onendsession).toHaveBeenCalledOnce();
  });

  it('calls onopenrules when the rules reference button is clicked', async () => {
    const onopenrules = vi.fn();
    render(LiveSessionHeader, {
      props: { sessionNumber: 1, sessionTitle: 'A', beatTitle: 'B', onopenrules },
    });

    await fireEvent.click(screen.getByRole('button', { name: 'Rules reference' }));

    expect(onopenrules).toHaveBeenCalledOnce();
  });

  it('renders no adventure picker chip when adventureOptions is omitted (the 0/1 fast path)', () => {
    render(LiveSessionHeader, {
      props: { sessionNumber: 1, sessionTitle: 'A', beatTitle: 'B' },
    });

    expect(screen.queryByRole('button', { name: /choose adventure/i })).not.toBeInTheDocument();
  });

  it('renders no adventure picker chip when only one adventure option is passed', () => {
    render(LiveSessionHeader, {
      props: {
        sessionNumber: 1,
        sessionTitle: 'A',
        beatTitle: 'B',
        adventureOptions: [{ id: 'adv-1', title: 'The granary raid', beatTitle: 'Into the tunnels' }],
        selectedAdventureId: 'adv-1',
      },
    });

    expect(screen.queryByRole('button', { name: /choose adventure/i })).not.toBeInTheDocument();
  });

  it('shows an adventure picker chip and listbox when 2+ adventure options are passed', async () => {
    const onselectadventure = vi.fn();
    render(LiveSessionHeader, {
      props: {
        sessionNumber: 1,
        sessionTitle: 'A',
        beatTitle: 'Into the tunnels',
        adventureOptions: [
          { id: 'adv-1', title: 'The granary raid', beatTitle: 'Into the tunnels' },
          { id: 'adv-2', title: 'The Gnawing Court', beatTitle: 'Confront the envoy' },
        ],
        selectedAdventureId: 'adv-1',
        onselectadventure,
      },
    });

    const chip = screen.getByRole('button', { name: /choose adventure, currently the granary raid/i });
    expect(chip).toHaveAttribute('aria-haspopup', 'listbox');
    expect(chip).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    await fireEvent.click(chip);

    expect(chip).toHaveAttribute('aria-expanded', 'true');
    const listbox = screen.getByRole('listbox', { name: 'Active adventures' });
    const options = within(listbox).getAllByRole('option');
    expect(options).toHaveLength(2);
    expect(options[0]).toHaveAttribute('aria-selected', 'true');
    expect(within(listbox).getByText('Confront the envoy')).toBeInTheDocument();

    await fireEvent.click(within(listbox).getByText('The Gnawing Court'));

    expect(onselectadventure).toHaveBeenCalledWith('adv-2');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});
