import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import LiveSessionEncounterInstance, { type EncounterInstance } from './LiveSessionEncounterInstance.svelte';

function instance(overrides: Partial<EncounterInstance> = {}): EncounterInstance {
  return { id: 'e1', label: 'Ratling 1', hp: 4, maxHp: 4, ...overrides };
}

function baseProps(overrides: Record<string, unknown> = {}) {
  return {
    instance: instance(),
    drawerOpen: false,
    ontoggledrawer: vi.fn(),
    onhurt: vi.fn(),
    onheal: vi.fn(),
    onremove: vi.fn(),
    ...overrides,
  };
}

describe('LiveSessionEncounterInstance', () => {
  it('shows the label and HP bar for a living instance', () => {
    render(LiveSessionEncounterInstance, { props: baseProps() });

    expect(screen.getByText('Ratling 1')).toBeInTheDocument();
    expect(screen.getByText('HP')).toBeInTheDocument();
    expect(screen.queryByText('Defeated')).not.toBeInTheDocument();
  });

  it('calls onremove with the instance id from the corner "x" while alive', async () => {
    const onremove = vi.fn();
    render(LiveSessionEncounterInstance, { props: baseProps({ onremove }) });

    await fireEvent.click(screen.getByRole('button', { name: 'Remove Ratling 1' }));

    expect(onremove).toHaveBeenCalledWith('e1');
  });

  it('toggles the drawer via the Hurt button', async () => {
    const ontoggledrawer = vi.fn();
    render(LiveSessionEncounterInstance, { props: baseProps({ ontoggledrawer }) });

    await fireEvent.click(screen.getByRole('button', { name: 'Hurt' }));

    expect(ontoggledrawer).toHaveBeenCalledWith('e1');
  });

  it('applies a hurt chip via onhurt when the drawer is open', async () => {
    const onhurt = vi.fn();
    render(LiveSessionEncounterInstance, { props: baseProps({ drawerOpen: true, onhurt }) });

    await fireEvent.click(screen.getByRole('button', { name: '3' }));

    expect(onhurt).toHaveBeenCalledWith('e1', 3);
  });

  it('switches to Heal mode and applies via onheal', async () => {
    const onheal = vi.fn();
    render(LiveSessionEncounterInstance, { props: baseProps({ drawerOpen: true, onheal }) });

    await fireEvent.click(screen.getByRole('button', { name: 'Heal' }));
    await fireEvent.click(screen.getByRole('button', { name: '2' }));

    expect(onheal).toHaveBeenCalledWith('e1', 2);
  });

  it('shows a dimmed, strikethrough Defeated state with only a Remove action once hp is 0', () => {
    render(LiveSessionEncounterInstance, { props: baseProps({ instance: instance({ hp: 0 }) }) });

    expect(screen.getByText('Defeated')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Hurt' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Remove Ratling 1$/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument();
  });

  it('calls onremove from the defeated Remove button', async () => {
    const onremove = vi.fn();
    render(LiveSessionEncounterInstance, { props: baseProps({ instance: instance({ hp: 0 }), onremove }) });

    await fireEvent.click(screen.getByRole('button', { name: 'Remove' }));

    expect(onremove).toHaveBeenCalledWith('e1');
  });
});
