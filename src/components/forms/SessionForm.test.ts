import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import SessionForm from './SessionForm.svelte';

describe('SessionForm', () => {
  it('saves a new session with the default number and entered title', async () => {
    const onsave = vi.fn();
    render(SessionForm, { props: { defaultNumber: 5, onsave, oncancel: vi.fn() } });

    await fireEvent.input(screen.getByLabelText('Title'), { target: { value: 'The granary raid' } });
    await fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(onsave).toHaveBeenCalledOnce();
    const saved = onsave.mock.calls[0]![0];
    expect(saved.number).toBe(5);
    expect(saved.title).toBe('The granary raid');
  });

  it('does not save when the title is blank', async () => {
    const onsave = vi.fn();
    render(SessionForm, { props: { defaultNumber: 1, onsave, oncancel: vi.fn() } });

    await fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(onsave).not.toHaveBeenCalled();
  });

  it('pre-fills fields from an initial session', () => {
    render(SessionForm, {
      props: {
        initial: { id: '1', number: 3, date: '2026-01-01', title: 'Old title', summary: 'What happened' },
        defaultNumber: 4,
        onsave: vi.fn(),
        oncancel: vi.fn(),
      },
    });

    expect(screen.getByDisplayValue('Old title')).toBeInTheDocument();
    expect(screen.getByDisplayValue('What happened')).toBeInTheDocument();
  });

  it('calls oncancel when Cancel is clicked', async () => {
    const oncancel = vi.fn();
    render(SessionForm, { props: { defaultNumber: 1, onsave: vi.fn(), oncancel } });

    await fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(oncancel).toHaveBeenCalledOnce();
  });
});
