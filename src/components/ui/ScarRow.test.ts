import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import ScarRow from './ScarRow.svelte';
import type { Scar } from '../../lib/conditions';

function scar(label: string): Scar {
  return { label, note: '' };
}

describe('ScarRow', () => {
  it('shows the + Scar button when there are no scars yet', () => {
    render(ScarRow, { props: { name: 'Pip', scars: [], onaddscar: vi.fn() } });

    expect(screen.getByRole('button', { name: /add a scar for pip/i })).toBeInTheDocument();
  });

  it('calls onaddscar when the + Scar button is tapped', async () => {
    const onaddscar = vi.fn();
    render(ScarRow, { props: { name: 'Pip', scars: [], onaddscar } });

    await fireEvent.click(screen.getByRole('button', { name: /add a scar for pip/i }));

    expect(onaddscar).toHaveBeenCalledOnce();
  });

  it('shows up to 3 scars inline with no overflow tag', () => {
    render(ScarRow, {
      props: { name: 'Pip', scars: [scar('Lost an eye'), scar('Walks with a limp'), scar('Jumpy around fire')], onaddscar: vi.fn() },
    });

    expect(screen.getByText('Lost an eye')).toBeInTheDocument();
    expect(screen.getByText('Walks with a limp')).toBeInTheDocument();
    expect(screen.getByText('Jumpy around fire')).toBeInTheDocument();
    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument();
  });

  it('collapses a 4th+ scar into a +N tag that expands the full list on tap', async () => {
    const scars = [scar('Lost an eye'), scar('Walks with a limp'), scar('Jumpy around fire'), scar('Missing whiskers')];
    render(ScarRow, { props: { name: 'Pip', scars, onaddscar: vi.fn() } });

    expect(screen.getByText('+1')).toBeInTheDocument();
    expect(screen.queryByText('Missing whiskers')).not.toBeInTheDocument();

    await fireEvent.click(screen.getByRole('button', { name: /show all of pip's scars/i }));

    expect(screen.getByText("Pip's scars")).toBeInTheDocument();
    expect(screen.getAllByText('Missing whiskers').length).toBeGreaterThan(0);
  });
});
