import type { Faction } from './factions.svelte';
import type { FactionEdge } from './factionEdges.svelte';

/**
 * Shared seed for the two faction stores. Faction ids are generated once here
 * so the edge seed can reference them by id, without either `.svelte.ts` store
 * having to import the other at module-evaluation time (which would risk a
 * circular-import crash). Both stores import their seed from this plain module.
 */

const gnawingCourt = crypto.randomUUID();
const owlBridge = crypto.randomUUID();
const seedKeepers = crypto.randomUUID();
const reevesGuild = crypto.randomUUID();
const militia = crypto.randomUUID();

export const seedFactions: Faction[] = [
  {
    id: gnawingCourt,
    name: 'The Gnawing Court',
    disposition: 'hostile',
    clock: 3,
    of: 6,
    note: "Rats tunnelling beneath the granary — when the clock fills they breach the grain cellars and raid Bramblewatch's food stores.",
    tags: ['Hostile', 'Sewers'],
  },
  {
    id: owlBridge,
    name: 'Owl Bridge Toll',
    disposition: 'neutral',
    clock: 1,
    of: 4,
    note: 'A barn owl in the old millhouse demands a pip toll to cross Millrace Creek — when it fills she starts snatching mice who cross for free.',
    tags: ['Neutral', 'Toll'],
  },
  {
    id: seedKeepers,
    name: 'The Seed-Keepers',
    disposition: 'ally',
    clock: 5,
    of: 6,
    note: 'Field mice hoarding winter stores in the meadow burrows — when it fills, allies get first pick of provisions before the frost.',
    tags: ['Ally', 'Meadow'],
  },
  {
    id: reevesGuild,
    name: "Granary Reeve's Guild",
    disposition: 'neutral',
    clock: 2,
    of: 6,
    note: 'The merchant council running the granary, weighing whether to pay the Court "protection" — when it fills they secretly funnel grain to the rats.',
    tags: ['Neutral', 'Trade'],
  },
  {
    id: militia,
    name: 'Bramblewatch Militia',
    disposition: 'ally',
    clock: 3,
    of: 8,
    note: "Hedgerow defenders drilling in secret — when it fills they muster to seal the Court's tunnels for good.",
    tags: ['Ally', 'Defense'],
  },
];

export const seedFactionEdges: FactionEdge[] = [
  { id: crypto.randomUUID(), sourceId: gnawingCourt, targetId: militia, type: 'enemy' },
  { id: crypto.randomUUID(), sourceId: gnawingCourt, targetId: seedKeepers, type: 'enemy' },
  { id: crypto.randomUUID(), sourceId: gnawingCourt, targetId: reevesGuild, type: 'enemy' },
  { id: crypto.randomUUID(), sourceId: seedKeepers, targetId: militia, type: 'ally' },
  { id: crypto.randomUUID(), sourceId: reevesGuild, targetId: seedKeepers, type: 'rival' },
  { id: crypto.randomUUID(), sourceId: reevesGuild, targetId: owlBridge, type: 'ally' },
  { id: crypto.randomUUID(), sourceId: owlBridge, targetId: militia, type: 'rival' },
];
