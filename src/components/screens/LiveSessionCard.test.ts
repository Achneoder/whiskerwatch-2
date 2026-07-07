import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import LiveSessionCard, { type LiveSessionCardMember } from './LiveSessionCard.svelte';
import type { ConditionName } from '../../lib/conditions';

function member(overrides: Partial<LiveSessionCardMember> = {}): LiveSessionCardMember {
  return {
    id: 'm1',
    name: 'Pip',
    role: 'Scout',
    hp: 6,
    max: 6,
    str: 10,
    maxStr: 10,
    conditions: [],
    ...overrides,
  };
}

interface Notice {
  text: string;
  undo?: (() => void) | undefined;
}

interface TestProps {
  member: LiveSessionCardMember;
  drawer: 'damage' | 'condition' | null;
  notice: Notice | null;
  pendingStrSave: number | null;
  ondamage: (amount: number) => void;
  onheal: (amount: number) => void;
  ontoggledrawer: (kind: 'damage' | 'condition') => void;
  ontogglecondition: (condition: ConditionName) => void;
  onresolvestrsave: () => void;
  onrequestdeath: () => void;
  ondismissnotice: () => void;
}

function baseProps(overrides: Partial<TestProps> = {}): TestProps {
  return {
    member: member(),
    drawer: null,
    notice: null,
    pendingStrSave: null,
    ondamage: vi.fn(),
    onheal: vi.fn(),
    ontoggledrawer: vi.fn(),
    ontogglecondition: vi.fn(),
    onresolvestrsave: vi.fn(),
    onrequestdeath: vi.fn(),
    ondismissnotice: vi.fn(),
    ...overrides,
  };
}

describe('LiveSessionCard', () => {
  it('renders the name, role, and HP but hides the STR bar at full health', () => {
    render(LiveSessionCard, { props: baseProps() });

    expect(screen.getByText('Pip')).toBeInTheDocument();
    expect(screen.getByText('Scout')).toBeInTheDocument();
    expect(screen.getByText('HP')).toBeInTheDocument();
    expect(screen.queryByText('STR')).not.toBeInTheDocument();
  });

  it('reveals the STR bar once STR is below max', () => {
    render(LiveSessionCard, { props: baseProps({ member: member({ str: 7 }) }) });

    expect(screen.getByText('STR')).toBeInTheDocument();
  });

  it('reveals the STR bar once HP hits 0, even if STR is untouched', () => {
    render(LiveSessionCard, { props: baseProps({ member: member({ hp: 0 }) }) });

    expect(screen.getByText('STR')).toBeInTheDocument();
  });

  it('asks the parent to toggle the damage drawer from the Hurt button', async () => {
    const ontoggledrawer = vi.fn();
    render(LiveSessionCard, { props: baseProps({ ontoggledrawer }) });

    await fireEvent.click(screen.getByRole('button', { name: 'Hurt' }));

    expect(ontoggledrawer).toHaveBeenCalledWith('damage');
  });

  it('applies a damage chip immediately via ondamage', async () => {
    const ondamage = vi.fn();
    render(LiveSessionCard, { props: baseProps({ drawer: 'damage', ondamage }) });

    await fireEvent.click(screen.getByRole('button', { name: '3' }));

    expect(ondamage).toHaveBeenCalledWith(3);
  });

  it('switches to Heal mode and applies via onheal', async () => {
    const onheal = vi.fn();
    render(LiveSessionCard, { props: baseProps({ drawer: 'damage', onheal }) });

    await fireEvent.click(screen.getByRole('button', { name: 'Heal' }));
    await fireEvent.click(screen.getByRole('button', { name: '2' }));

    expect(onheal).toHaveBeenCalledWith(2);
  });

  it('applies a custom amount once revealed', async () => {
    const ondamage = vi.fn();
    render(LiveSessionCard, { props: baseProps({ drawer: 'damage', ondamage }) });

    await fireEvent.click(screen.getByRole('button', { name: /custom amount/i }));
    await fireEvent.click(screen.getByRole('button', { name: 'Apply' }));

    expect(ondamage).toHaveBeenCalledWith(7); // Stepper defaults to 7
  });

  it('asks the parent to open the condition drawer from the + Condition chip', async () => {
    const ontoggledrawer = vi.fn();
    render(LiveSessionCard, { props: baseProps({ ontoggledrawer }) });

    await fireEvent.click(screen.getByRole('button', { name: /\+ Condition/ }));

    expect(ontoggledrawer).toHaveBeenCalledWith('condition');
  });

  it('lists every condition in the drawer and toggles one on tap', async () => {
    const ontogglecondition = vi.fn();
    render(LiveSessionCard, { props: baseProps({ drawer: 'condition', ontogglecondition }) });

    await fireEvent.click(screen.getByRole('button', { name: 'Frightened' }));

    expect(ontogglecondition).toHaveBeenCalledWith('frightened');
  });

  it('taps an applied condition pill in the compact row to remove it', async () => {
    const ontogglecondition = vi.fn();
    render(LiveSessionCard, {
      props: baseProps({ member: member({ conditions: ['frightened'] }), ontogglecondition }),
    });

    await fireEvent.click(screen.getByRole('button', { name: /Frightened/ }));

    expect(ontogglecondition).toHaveBeenCalledWith('frightened');
  });

  it('shows a pending STR save banner and resolves it on tap', async () => {
    const onresolvestrsave = vi.fn();
    render(LiveSessionCard, {
      props: baseProps({ member: member({ str: 8, maxStr: 10 }), pendingStrSave: 8, onresolvestrsave }),
    });

    expect(screen.getByText(/STR save required at 8/)).toBeInTheDocument();
    await fireEvent.click(screen.getByRole('button', { name: /roll str save/i }));

    expect(onresolvestrsave).toHaveBeenCalledOnce();
  });

  it('replaces the Hurt button with a death confirmation trigger once STR hits 0', async () => {
    const onrequestdeath = vi.fn();
    render(LiveSessionCard, { props: baseProps({ member: member({ str: 0 }), onrequestdeath }) });

    expect(screen.queryByRole('button', { name: 'Hurt' })).not.toBeInTheDocument();
    await fireEvent.click(screen.getByRole('button', { name: /confirm death/i }));

    expect(onrequestdeath).toHaveBeenCalledOnce();
  });

  it('shows an inline notice with an undo affordance', async () => {
    const undo = vi.fn();
    const ondismissnotice = vi.fn();
    render(LiveSessionCard, {
      props: baseProps({ notice: { text: 'Applied 3 damage — Undo', undo }, ondismissnotice }),
    });

    expect(screen.getByText('Applied 3 damage — Undo')).toBeInTheDocument();
    await fireEvent.click(screen.getByRole('button', { name: 'Undo' }));

    expect(undo).toHaveBeenCalledOnce();
    expect(ondismissnotice).toHaveBeenCalledOnce();
  });
});
