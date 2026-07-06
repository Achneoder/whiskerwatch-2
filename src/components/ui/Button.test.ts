import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import ButtonHarness from './Button.test.harness.svelte';

describe('Button', () => {
  it('renders its label and fires onclick', async () => {
    const onclick = vi.fn();
    render(ButtonHarness, { props: { onclick, label: 'Roll' } });

    const button = screen.getByRole('button', { name: 'Roll' });
    await fireEvent.click(button);

    expect(onclick).toHaveBeenCalledOnce();
  });

  it('does not fire onclick when disabled', async () => {
    const onclick = vi.fn();
    render(ButtonHarness, { props: { onclick, label: 'Roll', disabled: true } });

    await fireEvent.click(screen.getByRole('button', { name: 'Roll' }));

    expect(onclick).not.toHaveBeenCalled();
  });
});
