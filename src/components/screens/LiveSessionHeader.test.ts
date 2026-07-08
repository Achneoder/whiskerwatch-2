import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
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
});
