import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import ScarForm from './ScarForm.svelte';

describe('ScarForm', () => {
  it('disables Add Scar until a label is entered', async () => {
    render(ScarForm, { props: { onsave: vi.fn(), oncancel: vi.fn() } });

    expect(screen.getByRole('button', { name: 'Add Scar' })).toBeDisabled();

    await fireEvent.input(screen.getByLabelText('Label'), { target: { value: 'Lost an eye' } });

    expect(screen.getByRole('button', { name: 'Add Scar' })).not.toBeDisabled();
  });

  it('fills the label field when a suggestion chip is tapped, without submitting', async () => {
    const onsave = vi.fn();
    render(ScarForm, { props: { onsave, oncancel: vi.fn() } });

    await fireEvent.click(screen.getByRole('button', { name: 'Walks with a limp' }));

    expect(screen.getByLabelText('Label')).toHaveValue('Walks with a limp');
    expect(onsave).not.toHaveBeenCalled();
  });

  it('lets the GM edit a chip-filled label before saving', async () => {
    const onsave = vi.fn();
    render(ScarForm, { props: { onsave, oncancel: vi.fn() } });

    await fireEvent.click(screen.getByRole('button', { name: 'Missing whiskers' }));
    await fireEvent.input(screen.getByLabelText('Label'), { target: { value: 'Missing half a whisker' } });
    await fireEvent.input(screen.getByLabelText('Note'), { target: { value: 'Singed by a candle flame.' } });
    await fireEvent.click(screen.getByRole('button', { name: 'Add Scar' }));

    expect(onsave).toHaveBeenCalledWith({ label: 'Missing half a whisker', note: 'Singed by a candle flame.' });
  });

  it('calls oncancel when Cancel is clicked', async () => {
    const oncancel = vi.fn();
    render(ScarForm, { props: { onsave: vi.fn(), oncancel } });

    await fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(oncancel).toHaveBeenCalledOnce();
  });
});
