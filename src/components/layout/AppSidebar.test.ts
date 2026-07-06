import { describe, expect, it, vi } from 'vitest';
import { render, within } from '@testing-library/svelte';
import AppSidebar from './AppSidebar.svelte';

// The component renders two parallel navs (a desktop <aside> and a mobile
// <header>, toggled purely via CSS breakpoints) so both exist in the DOM at
// once in jsdom, which has no layout engine to apply `hidden`/`md:flex`.
// Scope queries to the desktop <aside> to avoid ambiguous duplicate matches.
function getDesktopNav(container: HTMLElement) {
  const aside = container.querySelector('aside');
  if (!aside) throw new Error('Expected an <aside> element');
  return within(aside);
}

describe('AppSidebar', () => {
  it('calls onnavigate when an enabled nav item is clicked', async () => {
    const onnavigate = vi.fn();
    const { container } = render(AppSidebar, { props: { active: 'overview', onnavigate } });

    await getDesktopNav(container).getByRole('button', { name: /warband/i }).click();

    expect(onnavigate).toHaveBeenCalledWith('warband');
  });

  it('navigates to factions and the hex map now that both screens are enabled', async () => {
    const onnavigate = vi.fn();
    const { container } = render(AppSidebar, { props: { active: 'overview', onnavigate } });
    const nav = getDesktopNav(container);

    const factionsButton = nav.getByRole('button', { name: /factions/i });
    expect(factionsButton).not.toBeDisabled();
    await factionsButton.click();
    expect(onnavigate).toHaveBeenCalledWith('factions');

    await nav.getByRole('button', { name: /hex map/i }).click();
    expect(onnavigate).toHaveBeenCalledWith('hexMap');
  });

  it('only renders the start session button when onstartsession is provided', () => {
    const { container, rerender } = render(AppSidebar, { props: { active: 'overview', onnavigate: vi.fn() } });
    expect(getDesktopNav(container).queryByRole('button', { name: /start session/i })).not.toBeInTheDocument();

    rerender({ active: 'overview', onnavigate: vi.fn(), onstartsession: vi.fn() });
    expect(getDesktopNav(container).getByRole('button', { name: /start session/i })).toBeInTheDocument();
  });
});
