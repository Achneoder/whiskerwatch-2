import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import Generators from './Generators.svelte';

describe('Generators', () => {
  it('rolls dice and shows a result', async () => {
    render(Generators, { props: { onnavigate: vi.fn() } });

    await fireEvent.click(screen.getByRole('button', { name: 'Roll' }));

    expect(screen.getByText(/2d6/)).toBeInTheDocument();
  });

  it('rolls an encounter and shows a result from the table', async () => {
    render(Generators, { props: { onnavigate: vi.fn() } });

    await fireEvent.click(screen.getByRole('button', { name: 'Roll an encounter' }));

    expect(screen.queryByText('No creatures yet', { exact: false })).not.toBeInTheDocument();
    const paragraphs = document.querySelectorAll('p');
    expect(paragraphs.length).toBeGreaterThan(0);
  });

  it('rolls an NPC and shows name, role, quirk and want', async () => {
    render(Generators, { props: { onnavigate: vi.fn() } });

    await fireEvent.click(screen.getByRole('button', { name: 'Roll an NPC' }));

    expect(screen.getByText('Quirk:')).toBeInTheDocument();
    expect(screen.getByText('Wants:')).toBeInTheDocument();
  });
});
