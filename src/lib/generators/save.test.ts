import { describe, expect, it, vi, afterEach } from 'vitest';
import { rollSave, rollLoyaltySave } from './save';

/**
 * `rollSave` rolls via `rollDice(1, 20)`, which computes
 * `1 + Math.floor(Math.random() * 20)`. Mock `Math.random` to land on a
 * specific d20 result so the pass/fail boundary can be tested deterministically.
 */
function mockD20Roll(result: number) {
  const random = (result - 1) / 20 + 0.0001;
  vi.spyOn(Math, 'random').mockReturnValue(random);
}

describe('rollSave', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('passes when the roll is under the score', () => {
    mockD20Roll(5);
    const result = rollSave(10);

    expect(result).toEqual({ roll: 5, score: 10, passed: true });
  });

  it('passes when the roll exactly equals the score (roll-under is inclusive)', () => {
    mockD20Roll(10);
    const result = rollSave(10);

    expect(result).toEqual({ roll: 10, score: 10, passed: true });
  });

  it('fails when the roll is over the score', () => {
    mockD20Roll(11);
    const result = rollSave(10);

    expect(result).toEqual({ roll: 11, score: 10, passed: false });
  });

  it('always passes when the score is at or above the maximum d20 result', () => {
    mockD20Roll(20);
    const result = rollSave(20);

    expect(result.passed).toBe(true);
  });

  it('always fails when the score is 0', () => {
    mockD20Roll(1);
    const result = rollSave(0);

    expect(result.passed).toBe(false);
  });
});

/**
 * `rollLoyaltySave` rolls via `rollDice(2, 6)`, which draws two independent
 * `1 + Math.floor(Math.random() * 6)` values. Queue two mocked `Math.random`
 * results (one per die) to land on a specific 2d6 pair deterministically.
 */
function mockD6Pair(d1: number, d2: number) {
  const spy = vi.spyOn(Math, 'random');
  spy.mockReturnValueOnce((d1 - 1) / 6 + 0.0001);
  spy.mockReturnValueOnce((d2 - 1) / 6 + 0.0001);
}

describe('rollLoyaltySave', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('passes when the 2d6 total is under the loyalty score', () => {
    mockD6Pair(2, 3);
    const result = rollLoyaltySave(10);

    expect(result).toEqual({ dice: [2, 3], roll: 5, score: 10, passed: true });
  });

  it('passes when the total exactly equals the score (roll-under is inclusive)', () => {
    mockD6Pair(4, 3);
    const result = rollLoyaltySave(7);

    expect(result).toEqual({ dice: [4, 3], roll: 7, score: 7, passed: true });
  });

  it('fails when the total is over the score', () => {
    mockD6Pair(6, 6);
    const result = rollLoyaltySave(10);

    expect(result).toEqual({ dice: [6, 6], roll: 12, score: 10, passed: false });
  });

  it('always fails when the score is below the minimum possible roll', () => {
    mockD6Pair(1, 1);
    const result = rollLoyaltySave(1);

    expect(result.passed).toBe(false);
  });
});
