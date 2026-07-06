import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import Stepper from './Stepper.svelte';

describe('Stepper', () => {
  it('increments and decrements within min/max', async () => {
    const onchange = vi.fn();
    render(Stepper, { props: { value: 3, min: 0, max: 6, onchange } });

    await fireEvent.click(screen.getByRole('button', { name: 'Increase' }));
    expect(onchange).toHaveBeenLastCalledWith(4);

    await fireEvent.click(screen.getByRole('button', { name: 'Decrease' }));
    expect(onchange).toHaveBeenLastCalledWith(2);
  });

  it('disables the decrease button at min and clamps at min', async () => {
    const onchange = vi.fn();
    render(Stepper, { props: { value: 0, min: 0, max: 6, onchange } });

    const decrease = screen.getByRole('button', { name: 'Decrease' });
    expect(decrease).toBeDisabled();

    await fireEvent.click(decrease);
    expect(onchange).not.toHaveBeenCalled();
  });

  it('disables the increase button at max and clamps at max', async () => {
    const onchange = vi.fn();
    render(Stepper, { props: { value: 6, min: 0, max: 6, onchange } });

    const increase = screen.getByRole('button', { name: 'Increase' });
    expect(increase).toBeDisabled();

    await fireEvent.click(increase);
    expect(onchange).not.toHaveBeenCalled();
  });
});
