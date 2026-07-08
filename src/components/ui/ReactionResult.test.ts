import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import ReactionResult from './ReactionResult.svelte';
import type { ReactionRollResult } from '../../lib/generators/reaction';

function result(overrides: Partial<ReactionRollResult> = {}): ReactionRollResult {
  return {
    dice: [1, 1],
    total: 2,
    band: 'hostile',
    guidance: 'Attacks or otherwise acts against the party.',
    ...overrides,
  };
}

describe('ReactionResult', () => {
  it('shows the band name as a label and the SRD guidance sentence', () => {
    render(ReactionResult, { props: { result: result() } });

    expect(screen.getByText('Hostile')).toBeInTheDocument();
    expect(screen.getByText('Attacks or otherwise acts against the party.')).toBeInTheDocument();
  });

  it('shows the dice faces and total', () => {
    render(ReactionResult, { props: { result: result({ dice: [3, 4], total: 7, band: 'neutral' }) } });

    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it.each([
    ['unfriendly', 'Unfriendly'],
    ['friendly', 'Friendly'],
    ['helpful', 'Helpful'],
  ] as const)('renders the %s band label as %s', (band, label) => {
    render(ReactionResult, { props: { result: result({ band }) } });

    expect(screen.getByText(label)).toBeInTheDocument();
  });
});
