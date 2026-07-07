/**
 * The HP→STR damage-overflow arithmetic shared by `PartyMember` and
 * `Hireling`. This is deliberately narrow: it's the primitive that answers
 * "where did this damage land", nothing more. It does NOT roll the
 * resulting STR save or apply Injured/Incapacitated/deceased — that's a
 * GM-driven decision made in Live Session (stage 2) after seeing this
 * result, per Mausritter's death spiral (no separate wound counter, no
 * random Fatal Wounds table).
 */
export interface DamageOutcome {
  /** How much of the incoming damage was absorbed by HP. */
  hpLost: number;
  /** How much overflowed into STR after HP hit 0. */
  strLost: number;
  newHp: number;
  newStr: number;
  /** True if this hit drained any STR — the caller must now resolve a STR save at `newStr`. */
  strSaveRequired: boolean;
  /** True if STR was reduced to exactly 0 — immediate death, no save. */
  died: boolean;
}

export function applyDamage(current: { hp: number; str: number }, amount: number): DamageOutcome {
  const damage = Math.max(0, amount);
  const hpLost = Math.min(current.hp, damage);
  const overflow = damage - hpLost;
  const strLost = Math.min(current.str, overflow);
  const newHp = current.hp - hpLost;
  const newStr = current.str - strLost;

  return {
    hpLost,
    strLost,
    newHp,
    newStr,
    strSaveRequired: strLost > 0,
    died: strLost > 0 && newStr === 0,
  };
}
