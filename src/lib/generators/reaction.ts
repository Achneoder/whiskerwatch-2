import { rollDice } from './roll';

/**
 * Mausritter's reaction roll: a flat 2d6, NOT a roll-under save against any
 * score. The total is mapped to one of five SRD reaction bands the GM reads
 * straight off the table — there's no pass/fail here, just a band and the
 * guidance sentence that goes with it. Deliberately its own shape (not
 * `LoyaltySaveResult`) since there's no score input and no notion of passing.
 */
export type ReactionBand = 'hostile' | 'unfriendly' | 'neutral' | 'friendly' | 'helpful';

export interface ReactionRollResult {
  dice: [number, number];
  total: number;
  band: ReactionBand;
  guidance: string;
}

/** SRD reaction guidance sentence for each band, keyed by band name. */
export const REACTION_GUIDANCE: Record<ReactionBand, string> = {
  hostile: 'Attacks or otherwise acts against the party.',
  unfriendly: "Does the opposite of what's asked, may attack.",
  neutral: 'Uncertain, will act to preserve itself.',
  friendly: 'Does as asked, if not put in danger.',
  helpful: 'Actively helps, and offers a service.',
};

/** 2d6 total → SRD reaction band. */
export function bandForTotal(total: number): ReactionBand {
  if (total <= 2) return 'hostile';
  if (total <= 5) return 'unfriendly';
  if (total <= 8) return 'neutral';
  if (total <= 11) return 'friendly';
  return 'helpful';
}

export function rollReaction(): ReactionRollResult {
  const { dice, total } = rollDice(2, 6);
  const band = bandForTotal(total);
  return { dice: [dice[0]!, dice[1]!], total, band, guidance: REACTION_GUIDANCE[band] };
}
