# Whiskerwatch Roadmap

Where the app is, and what's next, ordered by what actually unblocks running a real campaign.

## Where we are

**Phases 1–7 have shipped**, plus the first bullet of Phase 8. Every screen in `CLAUDE.md`'s domain list exists and is wired to persisted, localStorage-backed stores: Dashboard, Roster (parties/mice/hirelings), Adventure (beat tree), Bestiary, Factions (relationship graph + clocks), Hex Map (canvas + per-hex nodes), Generators (dice/encounter/item/NPC), Sessions (log/recap), Settings, and the Live Session table view. Live Session reads real state (session/beat/faction/hireling data, no fixture strings) and rolls an actual Mausritter d20 roll-under save. Player mice and hirelings carry real STR/DEX/WIL, the HP→STR damage-overflow death spiral, the standardized condition vocabulary, downtime XP, and now a rules-accurate 10-slot item inventory. The design system (tokens, `ui/` primitives), export/import of the whole campaign to JSON, a PWA manifest + service worker, and English/German i18n via `svelte-i18n` are all in place. Phases 1–7 and Phase 8's first bullet are summarised under "Shipped" below and kept for history; the detailed forward plan now continues at the rest of **Phase 8**.

## Shipped (Phases 1–7, plus Phase 8's item model)

Kept as a record of how we got here. Full detail lives in git history; this is the summary.

- **Phase 1 — real session end to end.** Roster CRUD for player mice and hirelings; per-entity persisted stores (`persistedList.svelte.ts` + `storage.ts`); export/import of the whole campaign to a single JSON file (`campaignExport.ts`) so a campaign survives a browser wipe and can move between devices.
- **Phase 2 — prep tools.** Adventure beat tree (`BeatTree`, `BeatForm`) and a Sessions log (`SessionForm`, `sessions.svelte.ts`).
- **Phase 3 — bestiary & generators.** Rules-accurate Bestiary stat blocks; dice roller and encounter/item/NPC generators (`lib/generators/tables.ts`).
- **Phase 4 — factions & hex map.** Faction list + relationship graph (`FactionGraph`) + clocks; hex-crawl canvas (`HexCanvas`) with per-hex nodes (`HexNodeForm`).
- **Phase 5 — polish & cross-cutting.** Playwright + Cucumber BDD harness stood up; per-screen i18n (English/German); Settings screen wired to theme/language/export-import; PWA manifest + service worker (`lib/pwa.ts`) for offline use at the table.
- **Phase 6 — Live Session tells the truth.** The header pulls the in-progress `Session` and active `Beat` from real stores instead of literal strings; the 1–2 faction clocks nearest to full are tappable pills right in the table view; hirelings appear alongside player mice with the same card component; the roll mechanic is a real Mausritter save (d20 roll-under a STR/DEX/WIL score, plain pass/fail, no crit/fumble rule).
- **Phase 7 — mice have the stats Mausritter runs on.** STR/DEX/WIL on `PartyMember`/`Hireling`; HP-then-STR damage overflow (`combat.ts`'s `applyDamage`) with the real death spiral (STR save on any STR drain, Injured+Incapacitated on a fail, immediate death at exactly 0 STR — no random Fatal Wounds table, just a one-tap death confirm); the standardized condition vocabulary (`lib/conditions.ts`) with a tap-to-add chip picker; downtime XP from pips spent, not kills, with the real SRD advancement thresholds.
- **Phase 8, item model + slot inventory (first bullet only).** A rules-accurate fixed 10-slot inventory (6 body + 4 paws, one flat array — the split is a UI convention, not two storage pools) on both `PartyMember` and `Hireling` (`lib/items.ts` + thin per-store wrappers, mirroring `combat.ts`'s shared-pure-function pattern). Tap-to-edit slot grid (`ItemSlotGrid.svelte`) in the Roster edit forms; 2-slot bulky items span a cell; a 6-pip charge track renders as display-only dots (ticking them is the next bullet, not this one); exceeding 10 slots shows an "Overburdened" warning banner that never blocks adding more. Deliberately not surfaced in Live Session yet — no charge-ticking exists, so a read-only bag there has no at-table utility until the next bullet lands.

The IndexedDB migration flagged in the original Phase 1 was *not* done — the app is still `localStorage`-only. That's fine at current data volume; it's re-flagged as cross-cutting debt below because Phase 9 grows the volume and adds reference integrity concerns.

---

## Phase 8 — Inventory, gear, and hirelings that cost something (continued)

The item model itself has landed (see Shipped above). What's left is making it actually *do* something at the table and giving hirelings a cost.

- **Wear/charge pips on items.** Torches, rations, rope and similar consumables get a pip track (☐☐☐☐) that ticks down with use, tap-to-cross-off in Live Session. This is the actual "pip" system on Mausritter's item cards and is completely absent today — right now "pips" in this codebase means only currency, and the charge dots added with the item model are display-only. This is also what unlocks a Live Session inventory surface (deferred from the first bullet specifically because there was nothing to tick yet).
- **Hireling wages + loyalty saves.** Add a daily wage to `Hireling`; a "pay day" prompt at session start/end that decrements the shared pip purse; and a one-tap loyalty save in Live Session for the "will they follow you into the tunnel" moment (2d6 vs. loyalty, same roll-under pattern as attribute saves — the primitive already exists from Phase 6/7, reuse it). Hirelings currently have a loyalty *number* with no mechanic that ever reads it.

## Phase 9 — Weave the world together

The integration debt, and the single biggest reason the app is four documents rather than one campaign tool. Beats, Hexes, Factions, and Bestiary are currently unrelated lists that share a color palette. Ranks as high as Phase 6 in GM value; it touches every screen a little rather than one screen a lot, and can run concurrently with Phase 8.

- **Beats reference hexes and factions.** `Beat` gains optional `hexNodeId` and `factionIds[]`; the relationship surfaces back on Hex Map and Factions ("beats touching this hex / faction"). This is what makes prep connective instead of three separate documents about the same campaign.
- **Hex encounters draw from the real Bestiary.** `HexNode` gains an optional list of `bestiaryEntryId` + weight, and the flat "d8 flavor text" `ENCOUNTER_TABLE` in `tables.ts` is replaced by generation that reads real `BestiaryEntry` records — so a rolled encounter links straight to a stat block, not a string. Turns Generators from a flavor-text toy into a tool a GM trusts for HP/attacks.
- **Hexes link to factions.** Optional "controlled by" / "contested by", drawn as a colored ring/tag on the canvas (mirroring the faction graph's disposition ring), so a GM can glance at the map and see whose territory the party is walking into.
- **Generated content is keepable.** The NPC/monster generators currently produce results that vanish on next click. Add "save to roster as hireling" / "save to bestiary" so an NPC improvised at the table doesn't have to be re-typed from memory next session.

## Phase 10 — Close the loop: sessions that write themselves

Prep and live-play are covered by 6–9; this phase is the *after* — `CLAUDE.md`'s "next session starts fast."

- **Session auto-recap draft.** When a GM ends a Live Session, generate a draft `Session` pre-filled with which beats changed status, which faction clocks moved, which mice took damage / gained conditions / leveled up, and any Fatal Wounds rolls. The GM edits prose on top instead of reconstructing the night from memory. Highest-leverage item here once 8–9 give it something real to summarize.
- **Campaign timeline view.** A read-only chronological feed merging sessions, clock changes, and beat completions ("when did the Owl Bridge toll go up?"). Nice-to-have, prep-mode.
- **Scars & death ledger.** A small persisted list of permanent Fatal Wounds outcomes per mouse, shown on the roster card. Cheap since Phase 7's Fatal Wounds prompt already exists, and good for table drama.

## Cross-cutting, not a phase

- **IndexedDB migration.** Re-flagged from the original Phase 1; still not done, still fine for now (`persistedList.svelte.ts` on `localStorage` handles current volume). Revisit once Phase 8's item store and Phase 9's cross-links land — not speculatively before.
- **Referential integrity on delete.** `factions`/`factionEdges` already do this right (`removeEdgesForFaction`). Every Phase 9 cross-link (beat→hex, hex→faction, hex→bestiary) needs the same cascade-or-null-out discipline, or deleting a hex silently orphans a beat's reference — and per `CLAUDE.md` a dangling ID must degrade gracefully, not crash.
- **Testing.** Every item keeps the established Vitest + Playwright/Cucumber pairing. The save mechanic especially deserves a Gherkin scenario — e.g. "Given Wren has 0 HP and a STR save fails, When the GM applies 3 more damage, Then Wren's STR drops and a Fatal Wounds prompt appears" — since it's a rules-correctness surface, not just UI.

## Explicitly out of scope (would be scope creep)

- **Full character-creation wizard** (rolling starting stats/background/items). GMs in this campaign already have their mice — this is new-campaign onboarding, not running-this-campaign. Revisit only if zero-to-one setup becomes a target use case.
- **Weather/season/calendar systems.** Mausritter has light seasonal downtime rules, but nothing at this table has asked for it. Don't build ahead of real need.
- **Multi-campaign / co-GM real-time sync.** No backend by design (`CLAUDE.md`); the "hand off to a co-GM" story is the export/import flow already shipped, not sync.

## Sequencing notes

- **Phase 8's remaining two bullets are the real "do next."** The item model landed; charge-pip ticking and hireling wages/loyalty both reuse primitives that already exist (the slot grid, the roll-under save), so they're comparatively cheap.
- **Phase 9 should not slip to "someday."** It's the difference between four solid CRUD screens and one campaign tool. It's mostly ID-linking and light UI, so run it alongside the rest of Phase 8 if capacity allows.
- **Route interaction-heavy work through `ux-ui-designer` first:** this paid off for Phase 8's slot-grid inventory (the easiest thing in that wave to get wrong on a phone) and should apply to any future Live Session inventory surface once charge-ticking lands.
- **Content accuracy through `gm-product-owner`:** the condition vocabulary, Fatal Wounds table, item/slot rules, and any new Bestiary/faction content must stay rules-accurate to Mausritter.
