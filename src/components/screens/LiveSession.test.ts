import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import LiveSession from './LiveSession.svelte';

describe('LiveSession', () => {
  it('sets live density on the document element and cleans it up on unmount', () => {
    const { unmount } = render(LiveSession, { props: {} });

    expect(document.documentElement.getAttribute('data-density')).toBe('live');

    unmount();

    expect(document.documentElement.getAttribute('data-density')).toBeNull();
  });

  it('renders a roll result after clicking Roll 2d6', async () => {
    render(LiveSession, { props: {} });

    expect(screen.queryByText('Last roll')).not.toBeInTheDocument();

    await fireEvent.click(screen.getByRole('button', { name: /roll 2d6/i }));

    expect(screen.getByText('Last roll')).toBeInTheDocument();
  });

  it('calls onexit when the Prep back button is clicked', async () => {
    const onexit = vi.fn();
    render(LiveSession, { props: { onexit } });

    await fireEvent.click(screen.getByRole('button', { name: /end session/i }));

    expect(onexit).toHaveBeenCalledOnce();
  });
});
