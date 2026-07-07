import type { BestiaryEntry } from '../stores/bestiary.svelte';
import type { HexEncounter, HexNode } from '../stores/hexmap.svelte';

/**
 * Weighted-random pick across a list of `{bestiaryId, weight}` links, resolved
 * against the full bestiary. Dangling ids (a bestiary entry deleted after the
 * link was made) are skipped rather than crashing — see CLAUDE.md's
 * "degrade gracefully" rule for stale local data.
 */
export function weightedPick(encounters: HexEncounter[], bestiary: BestiaryEntry[]): BestiaryEntry | null {
  const resolved = encounters
    .map((e) => ({ entry: bestiary.find((b) => b.id === e.bestiaryId), weight: e.weight }))
    .filter((r): r is { entry: BestiaryEntry; weight: number } => r.entry !== undefined && r.weight > 0);

  if (resolved.length === 0) return null;

  const total = resolved.reduce((sum, r) => sum + r.weight, 0);
  let roll = Math.random() * total;
  for (const r of resolved) {
    roll -= r.weight;
    if (roll < 0) return r.entry;
  }
  return resolved[resolved.length - 1]!.entry;
}

/**
 * Rolls a random encounter for a given hex (or `'any'` for the whole
 * bestiary). Falls back to a uniform pick across the whole bestiary when the
 * hex isn't found or has no encounters configured — Generators should always
 * produce something useful, not an empty result, once any bestiary entry exists.
 */
export function generateEncounterFor(hexId: string | 'any', hexNodes: HexNode[], bestiary: BestiaryEntry[]): BestiaryEntry | null {
  if (bestiary.length === 0) return null;

  const hex = hexId === 'any' ? undefined : hexNodes.find((h) => h.id === hexId);

  if (!hex || hex.encounters.length === 0) {
    return weightedPick(
      bestiary.map((b) => ({ bestiaryId: b.id, weight: 1 })),
      bestiary,
    );
  }

  return weightedPick(hex.encounters, bestiary);
}
