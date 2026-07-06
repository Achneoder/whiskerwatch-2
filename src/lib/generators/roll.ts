export interface DiceRollResult {
  dice: number[];
  modifier: number;
  total: number;
  notation: string;
}

export function rollDice(count: number, sides: number, modifier = 0): DiceRollResult {
  const dice = Array.from({ length: count }, () => 1 + Math.floor(Math.random() * sides));
  const total = dice.reduce((sum, d) => sum + d, 0) + modifier;
  const modText = modifier === 0 ? '' : modifier > 0 ? `+${modifier}` : `${modifier}`;
  return { dice, modifier, total, notation: `${count}d${sides}${modText}` };
}
