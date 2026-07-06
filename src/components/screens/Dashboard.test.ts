import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import Dashboard from './Dashboard.svelte';
import { replaceSessions } from '../../lib/stores/sessions.svelte';

describe('Dashboard', () => {
  it('renders the warband and factions', () => {
    render(Dashboard, { props: { onnavigate: vi.fn() } });

    expect(screen.getByText('Pip')).toBeInTheDocument();
    expect(screen.getByText('Wren')).toBeInTheDocument();
    expect(screen.getByText('The Gnawing Court')).toBeInTheDocument();
  });

  it('calls onstartsession when the Start session button is clicked', async () => {
    const onstartsession = vi.fn();
    render(Dashboard, { props: { onnavigate: vi.fn(), onstartsession } });

    // AppSidebar renders a desktop <aside> and a mobile <header> nav in
    // parallel (toggled via CSS breakpoints jsdom doesn't apply), so both
    // "Start session" buttons exist in the DOM at once here.
    const [button] = screen.getAllByRole('button', { name: /start session/i });
    await button!.click();

    expect(onstartsession).toHaveBeenCalledOnce();
  });

  it('calls onnavigate with "warband" when Manage is clicked', async () => {
    const onnavigate = vi.fn();
    render(Dashboard, { props: { onnavigate } });

    const button = screen.getByRole('button', { name: /manage/i });
    await button.click();

    expect(onnavigate).toHaveBeenCalledWith('warband');
  });

  it('shows the next session number and last session title, and navigates to sessions', async () => {
    replaceSessions([{ id: '1', number: 7, date: '2026-01-01', title: 'Into the deep sewers', summary: '' }]);
    const onnavigate = vi.fn();
    render(Dashboard, { props: { onnavigate } });

    expect(screen.getByText('#8')).toBeInTheDocument();
    expect(screen.getByText('Into the deep sewers')).toBeInTheDocument();

    await fireEvent.click(screen.getByText('#8'));
    expect(onnavigate).toHaveBeenCalledWith('sessions');
  });

  it('shows an empty state when no sessions are logged', () => {
    replaceSessions([]);
    render(Dashboard, { props: { onnavigate: vi.fn() } });

    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('No sessions logged yet')).toBeInTheDocument();
  });
});
