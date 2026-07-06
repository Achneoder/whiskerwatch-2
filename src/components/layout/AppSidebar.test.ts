import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import AppSidebar from './AppSidebar.svelte';

describe('AppSidebar', () => {
  it('calls onnavigate when an enabled nav item is clicked', async () => {
    const onnavigate = vi.fn();
    render(AppSidebar, { props: { active: 'overview', onnavigate } });

    await screen.getByRole('button', { name: /warband/i }).click();

    expect(onnavigate).toHaveBeenCalledWith('warband');
  });

  it('does not call onnavigate for a disabled nav item', async () => {
    const onnavigate = vi.fn();
    render(AppSidebar, { props: { active: 'overview', onnavigate } });

    const factionsButton = screen.getByRole('button', { name: /factions/i });
    expect(factionsButton).toBeDisabled();

    await factionsButton.click();

    expect(onnavigate).not.toHaveBeenCalled();
  });

  it('only renders the start session button when onstartsession is provided', () => {
    const { rerender } = render(AppSidebar, { props: { active: 'overview', onnavigate: vi.fn() } });
    expect(screen.queryByRole('button', { name: /start session/i })).not.toBeInTheDocument();

    rerender({ active: 'overview', onnavigate: vi.fn(), onstartsession: vi.fn() });
    expect(screen.getByRole('button', { name: /start session/i })).toBeInTheDocument();
  });
});
