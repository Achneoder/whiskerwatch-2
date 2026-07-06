import { describe, expect, it } from 'vitest';
import { rollDice } from './roll';

describe('rollDice', () => {
  it('rolls the requested number of dice within range', () => {
    const result = rollDice(3, 6);

    expect(result.dice).toHaveLength(3);
    for (const d of result.dice) {
      expect(d).toBeGreaterThanOrEqual(1);
      expect(d).toBeLessThanOrEqual(6);
    }
  });

  it('sums the dice plus modifier for the total', () => {
    const result = rollDice(2, 6, 3);

    expect(result.total).toBe(result.dice.reduce((a, b) => a + b, 0) + 3);
  });

  it('formats the notation with a positive modifier', () => {
    const result = rollDice(2, 6, 1);
    expect(result.notation).toBe('2d6+1');
  });

  it('formats the notation with a negative modifier', () => {
    const result = rollDice(1, 20, -2);
    expect(result.notation).toBe('1d20-2');
  });

  it('formats the notation with no modifier', () => {
    const result = rollDice(4, 8, 0);
    expect(result.notation).toBe('4d8');
  });
});
