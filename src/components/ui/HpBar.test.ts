import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import HpBar from './HpBar.svelte';

describe('HpBar', () => {
  it('shows the current/max value', () => {
    render(HpBar, { props: { value: 4, max: 6, label: 'HP' } });

    expect(screen.getByText('HP')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('/6')).toBeInTheDocument();
  });

  it('renders one pip per max point when max is small', () => {
    const { container } = render(HpBar, { props: { value: 2, max: 6, showValue: false, label: '' } });

    const pips = container.querySelectorAll(':scope > div:last-child > div > div');
    expect(pips).toHaveLength(6);
  });

  it('switches to a continuous bar when max is large', () => {
    const { container } = render(HpBar, { props: { value: 30, max: 100, showValue: false, label: '' } });

    const pips = container.querySelectorAll(':scope > div:last-child > div > div');
    expect(pips).toHaveLength(1);
  });
});
