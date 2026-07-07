import { rollDice } from './roll';

/**
 * Mausritter's core save mechanic: roll a single d20 and succeed if the
 * result is at or under the target attribute score (STR/DEX/WIL — the GM
 * picks which, based on the fictional situation). Plain pass/fail — there's
 * no crit/fumble rule on a natural 1 or 20 in core Mausritter. Rolling
 * exactly the score is a pass (roll-under is inclusive of the score).
 *
 * Deliberately generic on `score` rather than "STR save" specifically:
 * Phase 8 reuses this same roll-under primitive for loyalty saves and
 * item-use saves, so it lives here rather than embedded in a component.
 */
export interface SaveResult {
  roll: number;
  score: number;
  passed: boolean;
}

export function rollSave(score: number): SaveResult {
  const { dice } = rollDice(1, 20);
  const roll = dice[0]!;
  return { roll, score, passed: roll <= score };
}
