import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Dashboard from './Dashboard.svelte';

describe('Dashboard', () => {
  it('renders the warband and factions', () => {
    render(Dashboard, { props: {} });

    expect(screen.getByText('Pip')).toBeInTheDocument();
    expect(screen.getByText('Wren')).toBeInTheDocument();
    expect(screen.getByText('The Gnawing Court')).toBeInTheDocument();
  });

  it('calls onstartsession when the Start session button is clicked', async () => {
    const onstartsession = vi.fn();
    const { component } = render(Dashboard, { props: { onstartsession } });
    void component;

    const button = screen.getByRole('button', { name: /start session/i });
    await button.click();

    expect(onstartsession).toHaveBeenCalledOnce();
  });
});
