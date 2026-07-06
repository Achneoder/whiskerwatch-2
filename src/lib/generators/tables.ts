export const ENCOUNTER_TABLE: string[] = [
  '2d4 Gnawing Court ratlings on patrol, arguing over a stolen ration.',
  'A Rat Court Enforcer inspecting a tunnel junction with one ratling escort.',
  "The Tunnel Widow's web blocks the passage — signs of a recent, larger kill.",
  'A Sewer Owl swoops down demanding "toll" (a pip or shiny item) before letting the party pass.',
  'Flash flood in the tunnels — DEX save or be swept back to the last junction.',
  'A frightened, lost Seed-Keeper scout, separated from their patrol.',
  'Fresh rat-court graffiti marking territory — a WIL save to learn something useful about it.',
  'The Granary Rot has spread further than expected; the smell alone calls for a STR save vs Exhausted.',
];

export const ITEM_TABLE: string[] = [
  'A dented thimble, useful as a helmet (light armor, 1 slot).',
  "Three acorns' worth of pips knotted in a cloth.",
  'A sliver of broken mirror — reflects light, could blind a foe once.',
  "A spool of the Tunnel Widow's silk thread, strong as rope.",
  'A single waterproofed match, still good for one fire.',
  'A rat-court signet carved from a button — proof of rank if flashed.',
  'A vial of owl pellet oil — foul-smelling, but masks scent from vermin for an hour.',
  'A cracked acorn-cap flask, half full of blackberry wine.',
];

export const NPC_NAMES: string[] = [
  'Thistle',
  'Bramble',
  'Acorn',
  'Clover',
  'Nettle',
  'Barley',
  'Hazel',
  'Fern',
  'Moss',
  'Wick',
];

export const NPC_ROLES: string[] = [
  'Grain merchant',
  'Tunnel scout',
  'Sewer-toll collector',
  'Retired soldier',
  'Seed-Keeper forager',
  'Gnawing Court defector',
  "Miller's apprentice",
  'Owl Bridge toll-keeper',
  'Wandering minstrel',
  'Granary watchmouse',
];

export const NPC_QUIRKS: string[] = [
  'Never removes their hat',
  'Speaks only in questions',
  'Collects lost buttons',
  'Terrified of owls',
  'Constantly hungry',
  'Hums while thinking',
  'Distrusts anyone taller',
  'Keeps a diary of grudges',
  'Overly formal',
  'Flinches at loud noises',
];

export const NPC_WANTS: string[] = [
  'A safe way past the Gnawing Court',
  'Revenge on whoever wronged them',
  'To be taken seriously',
  "A share of the granary's grain",
  'To leave the sewers for good',
  'Proof their family is still alive',
  'A trade deal with the Seed-Keepers',
  'To retire somewhere quiet',
  'Forgiveness for a past betrayal',
  'An audience with Owl Bridge Toll',
];

function pick<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)]!;
}

export interface GeneratedNpc {
  name: string;
  role: string;
  quirk: string;
  want: string;
}

export function generateNpc(): GeneratedNpc {
  return { name: pick(NPC_NAMES), role: pick(NPC_ROLES), quirk: pick(NPC_QUIRKS), want: pick(NPC_WANTS) };
}

export function generateFrom(table: string[]): string {
  return pick(table);
}
