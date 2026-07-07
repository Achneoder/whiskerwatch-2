import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/svelte';
import Sessions from './Sessions.svelte';
import { replaceSessions } from '../../lib/stores/sessions.svelte';

describe('Sessions', () => {
  beforeEach(() => {
    replaceSessions([]);
  });

  it('logs a new session', async () => {
    render(Sessions, { props: { onnavigate: vi.fn() } });

    await fireEvent.click(screen.getByRole('button', { name: 'Log session' }));
    await fireEvent.input(screen.getByLabelText('Title'), { target: { value: 'The granary raid' } });
    await fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(screen.getByText('The granary raid')).toBeInTheDocument();
  });

  it('lists sessions newest-first', () => {
    replaceSessions([
      { id: '1', number: 1, date: '2026-01-01', title: 'First', summary: '' },
      { id: '2', number: 3, date: '2026-01-15', title: 'Third', summary: '' },
      { id: '3', number: 2, date: '2026-01-08', title: 'Second', summary: '' },
    ]);
    render(Sessions, { props: { onnavigate: vi.fn() } });

    const titles = screen.getAllByText(/First|Second|Third/).map((el) => el.textContent);
    expect(titles).toEqual(['Third', 'Second', 'First']);
  });

  it('deletes a session after confirming', async () => {
    replaceSessions([{ id: '1', number: 1, date: '2026-01-01', title: 'First', summary: '' }]);
    render(Sessions, { props: { onnavigate: vi.fn() } });

    await fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    const dialog = screen.getByRole('dialog');
    await fireEvent.click(within(dialog).getByRole('button', { name: 'Delete' }));

    expect(screen.queryByText('First')).not.toBeInTheDocument();
  });

  it('opens the add-session modal pre-filled when handed a recap draft', () => {
    const onconsumeddraft = vi.fn();
    render(Sessions, {
      props: {
        onnavigate: vi.fn(),
        draftRecap: { number: 6, date: '2026-07-07', title: '', summary: "• Resolved: 'The raid'\n" },
        onconsumeddraft,
      },
    });

    expect(screen.getByDisplayValue(/Resolved: 'The raid'/)).toBeInTheDocument();
    expect(onconsumeddraft).toHaveBeenCalledOnce();
  });
});
