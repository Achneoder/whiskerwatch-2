import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import SaveDock from './SaveDock.svelte';

const members = [
  { id: 'p1', name: 'Pip', str: 10, dex: 13, wil: 9 },
  { id: 'p2', name: 'Wren', str: 8, dex: 10, wil: 12 },
];

function mockD20Roll(result: number) {
  vi.spyOn(Math, 'random').mockReturnValue((result - 1) / 20 + 0.0001);
}

function mockD6Pair(d1: number, d2: number) {
  const spy = vi.spyOn(Math, 'random');
  spy.mockReturnValueOnce((d1 - 1) / 6 + 0.0001);
  spy.mockReturnValueOnce((d2 - 1) / 6 + 0.0001);
}

describe('SaveDock', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows a message instead of the picker when there is no one to save', () => {
    render(SaveDock, { props: { members: [] } });

    expect(screen.getByText(/add a mouse or hireling/i)).toBeInTheDocument();
  });

  it('rolls a save for the selected mouse and attribute, showing a pass', async () => {
    mockD20Roll(5); // well under Pip's STR of 10
    render(SaveDock, { props: { members } });

    await fireEvent.click(screen.getByRole('button', { name: /roll save/i }));

    expect(screen.getByText('Success')).toBeInTheDocument();
  });

  it('shows a failed save when the roll is over the attribute score', async () => {
    mockD20Roll(20); // well over Pip's STR of 10
    render(SaveDock, { props: { members } });

    await fireEvent.click(screen.getByRole('button', { name: /roll save/i }));

    expect(screen.getByText('Failure')).toBeInTheDocument();
  });

  it('lets the GM switch attribute before rolling', async () => {
    mockD20Roll(11); // fails Pip's STR (10) and WIL (9), but passes Pip's DEX (13)
    render(SaveDock, { props: { members } });

    await fireEvent.click(screen.getByRole('button', { name: /^DEX/ }));
    await fireEvent.click(screen.getByRole('button', { name: /roll save/i }));

    // Pip's DEX is 13, so an 11 passes.
    expect(screen.getByText('Success')).toBeInTheDocument();
  });

  it('does not show a LOY button when the selected member has no loyalty score', () => {
    render(SaveDock, { props: { members } });

    expect(screen.queryByRole('button', { name: /^LOY/ })).not.toBeInTheDocument();
  });

  it('shows a LOY button for a hireling and rolls 2d6 roll-under on tap', async () => {
    const membersWithHireling = [...members, { id: 'h1', name: 'Oat', str: 10, dex: 10, wil: 10, loyalty: 9 }];
    mockD6Pair(2, 3); // total 5, well under Oat's loyalty of 9
    render(SaveDock, { props: { members: membersWithHireling } });

    await fireEvent.change(screen.getByRole('combobox'), { target: { value: 'h1' } });
    await fireEvent.click(screen.getByRole('button', { name: /^LOY 9/ }));
    await fireEvent.click(screen.getByRole('button', { name: /roll save/i }));

    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(screen.getByText('2d6')).toBeInTheDocument();
  });
});
