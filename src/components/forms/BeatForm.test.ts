import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import BeatForm from './BeatForm.svelte';

describe('BeatForm', () => {
  it('saves a new beat with the entered title', async () => {
    const onsave = vi.fn();
    render(BeatForm, { props: { onsave, oncancel: vi.fn() } });

    await fireEvent.input(screen.getByLabelText('Title'), { target: { value: 'Find the tunnel' } });
    await fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(onsave).toHaveBeenCalledWith({ title: 'Find the tunnel', notes: '', status: 'planned' });
  });

  it('does not save when the title is blank', async () => {
    const onsave = vi.fn();
    render(BeatForm, { props: { onsave, oncancel: vi.fn() } });

    await fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(onsave).not.toHaveBeenCalled();
  });

  it('pre-fills fields from an initial beat', () => {
    render(BeatForm, {
      props: {
        initial: { id: '1', parentId: null, title: 'Find the tunnel', notes: 'Check the sewers', status: 'active' },
        onsave: vi.fn(),
        oncancel: vi.fn(),
      },
    });

    expect(screen.getByDisplayValue('Find the tunnel')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Check the sewers')).toBeInTheDocument();
  });

  it('calls oncancel when Cancel is clicked', async () => {
    const oncancel = vi.fn();
    render(BeatForm, { props: { onsave: vi.fn(), oncancel } });

    await fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(oncancel).toHaveBeenCalledOnce();
  });
});
