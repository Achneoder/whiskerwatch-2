import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import HurtHealDrawer from './HurtHealDrawer.svelte';

function baseProps(overrides: Record<string, unknown> = {}) {
  return {
    mode: 'hurt' as const,
    chips: [1, 2, 3, 4, 5, 6],
    customOpen: false,
    customAmount: 7,
    onmode: vi.fn(),
    onchip: vi.fn(),
    oncustomtoggle: vi.fn(),
    onapplycustom: vi.fn(),
    ...overrides,
  };
}

describe('HurtHealDrawer', () => {
  it('renders a chip for every value passed in', () => {
    render(HurtHealDrawer, { props: baseProps() });

    for (const n of [1, 2, 3, 4, 5, 6]) {
      expect(screen.getByRole('button', { name: String(n) })).toBeInTheDocument();
    }
  });

  it('calls onchip with the tapped chip amount', async () => {
    const onchip = vi.fn();
    render(HurtHealDrawer, { props: baseProps({ onchip }) });

    await fireEvent.click(screen.getByRole('button', { name: '3' }));

    expect(onchip).toHaveBeenCalledWith(3);
  });

  it('calls onmode when switching between Hurt and Heal', async () => {
    const onmode = vi.fn();
    render(HurtHealDrawer, { props: baseProps({ onmode }) });

    await fireEvent.click(screen.getByRole('button', { name: 'Heal' }));

    expect(onmode).toHaveBeenCalledWith('heal');
  });

  it('shows the custom-amount toggle button until oncustomtoggle flips customOpen on', async () => {
    const oncustomtoggle = vi.fn();
    render(HurtHealDrawer, { props: baseProps({ oncustomtoggle }) });

    expect(screen.queryByRole('button', { name: 'Increase' })).not.toBeInTheDocument();
    await fireEvent.click(screen.getByRole('button', { name: /custom amount/i }));

    expect(oncustomtoggle).toHaveBeenCalledOnce();
  });

  it('reveals the Stepper and Apply button once customOpen is true, defaulting to the given amount', () => {
    render(HurtHealDrawer, { props: baseProps({ customOpen: true, customAmount: 7 }) });

    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Apply' })).toBeInTheDocument();
  });

  it('applies a custom amount via onapplycustom', async () => {
    const onapplycustom = vi.fn();
    render(HurtHealDrawer, { props: baseProps({ customOpen: true, onapplycustom }) });

    await fireEvent.click(screen.getByRole('button', { name: 'Apply' }));

    expect(onapplycustom).toHaveBeenCalledOnce();
  });

  it('bumps the bindable customAmount up/down via the Stepper', async () => {
    render(HurtHealDrawer, { props: baseProps({ customOpen: true, customAmount: 7 }) });

    await fireEvent.click(screen.getByRole('button', { name: 'Increase' }));

    expect(screen.getByText('8')).toBeInTheDocument();
  });

  it('tints chips for hurt vs heal mode differently (mode drives styling, not a separate prop)', () => {
    const { unmount } = render(HurtHealDrawer, { props: baseProps({ mode: 'hurt' }) });
    const hurtChip = screen.getByRole('button', { name: '1' });
    expect(hurtChip.className).toContain('danger');
    unmount();

    render(HurtHealDrawer, { props: baseProps({ mode: 'heal' }) });
    const healChip = screen.getByRole('button', { name: '1' });
    expect(healChip.className).toContain('success');
  });
});
