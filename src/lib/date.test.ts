import { describe, expect, it } from 'vitest';
import { daysSince } from './date';

describe('daysSince', () => {
  it('returns 0 for today', () => {
    expect(daysSince(new Date().toISOString())).toBe(0);
  });

  it('returns the number of whole days elapsed', () => {
    const sixDaysAgo = new Date();
    sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);

    expect(daysSince(sixDaysAgo.toISOString())).toBe(6);
  });

  it('returns 0 for an invalid date rather than throwing', () => {
    expect(daysSince('not a date')).toBe(0);
  });
});
