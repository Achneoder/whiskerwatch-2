import { rollDice } from './roll';

/**
 * Mausritter's core save mechanic: roll a single d20 and succeed if the
 * result is at or under the target attribute score (STR/DEX/WIL — the GM
 * picks which, based on the fictional situation). Plain pass/fail — there's
 * no crit/fumble rule on a natural 1 or 20 in core Mausritter. Rolling
 * exactly the score is a pass (roll-under is inclusive of the score).
 *
 * Deliberately generic on `score` rather than "STR save" specifically, so it
 * lives here rather than embedded in a component. Note this is NOT the same
 * primitive as `rollLoyaltySave` below — loyalty saves are 2d6 roll-under,
 * not d20 roll-under.
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

/**
 * Mausritter's loyalty save: roll 2d6 and succeed if the total is at or
 * under the hireling's Loyalty score (2–12, generated on 2d6). A different
 * mechanic from `rollSave` — this is a 2d6 roll-under band, not a d20 one —
 * so it's a separate primitive rather than a `rollSave` call site. Carries
 * both dice faces (rather than just the total) so `DiceRoll` can render two
 * d6 faces the way a GM would actually see them land on the table.
 */
export interface LoyaltySaveResult {
  dice: [number, number];
  roll: number;
  score: number;
  passed: boolean;
}

export function rollLoyaltySave(score: number): LoyaltySaveResult {
  const { dice, total } = rollDice(2, 6);
  return { dice: [dice[0]!, dice[1]!], roll: total, score, passed: total <= score };
}
