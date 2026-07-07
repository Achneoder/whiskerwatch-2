# Whiskerwatch Roadmap

Where the app is, and what's next, ordered by what actually unblocks running a real campaign.

## Where we are

**Phases 1–8 have shipped.** Every screen in `CLAUDE.md`'s domain list exists and is wired to persisted, localStorage-backed stores: Dashboard, Roster (parties/mice/hirelings), Adventure (beat tree), Bestiary, Factions (relationship graph + clocks), Hex Map (canvas + per-hex nodes), Generators (dice/encounter/item/NPC), Sessions (log/recap), Settings, and the Live Session table view. Live Session reads real state (session/beat/faction/hireling data, no fixture strings) and rolls an actual Mausritter d20 roll-under save. Player mice and hirelings carry real STR/DEX/WIL, the HP→STR damage-overflow death spiral, the standardized condition vocabulary, downtime XP, a rules-accurate 10-slot item inventory, and now a wage + 2d6 loyalty save. The design system (tokens, `ui/` primitives), export/import of the whole campaign to JSON, a PWA manifest + service worker, and English/German i18n via `svelte-i18n` are all in place. Phases 1–8 are summarised under "Shipped" below and kept for history; the detailed forward plan now continues at **Phase 9**.

## Shipped (Phases 1–8)

Kept as a record of how we got here. Full detail lives in git history; this is the summary.

- **Phase 1 — real session end to end.** Roster CRUD for player mice and hirelings; per-entity persisted stores (`persistedList.svelte.ts` + `storage.ts`); export/import of the whole campaign to a single JSON file (`campaignExport.ts`) so a campaign survives a browser wipe and can move between devices.
- **Phase 2 — prep tools.** Adventure beat tree (`BeatTree`, `BeatForm`) and a Sessions log (`SessionForm`, `sessions.svelte.ts`).
- **Phase 3 — bestiary & generators.** Rules-accurate Bestiary stat blocks; dice roller and encounter/item/NPC generators (`lib/generators/tables.ts`).
- **Phase 4 — factions & hex map.** Faction list + relationship graph (`FactionGraph`) + clocks; hex-crawl canvas (`HexCanvas`) with per-hex nodes (`HexNodeForm`).
- **Phase 5 — polish & cross-cutting.** Playwright + Cucumber BDD harness stood up; per-screen i18n (English/German); Settings screen wired to theme/language/export-import; PWA manifest + service worker (`lib/pwa.ts`) for offline use at the table.
- **Phase 6 — Live Session tells the truth.** The header pulls the in-progress `Session` and active `Beat` from real stores instead of literal strings; the 1–2 faction clocks nearest to full are tappable pills right in the table view; hirelings appear alongside player mice with the same card component; the roll mechanic is a real Mausritter save (d20 roll-under a STR/DEX/WIL score, plain pass/fail, no crit/fumble rule).
- **Phase 7 — mice have the stats Mausritter runs on.** STR/DEX/WIL on `PartyMember`/`Hireling`; HP-then-STR damage overflow (`combat.ts`'s `applyDamage`) with the real death spiral (STR save on any STR drain, Injured+Incapacitated on a fail, immediate death at exactly 0 STR — no random Fatal Wounds table, just a one-tap death confirm); the standardized condition vocabulary (`lib/conditions.ts`) with a tap-to-add chip picker; downtime XP from pips spent, not kills, with the real SRD advancement thresholds.
- **Phase 8, item model + slot inventory.** A rules-accurate fixed 10-slot inventory (6 body + 4 paws, one flat array — the split is a UI convention, not two storage pools) on both `PartyMember` and `Hireling` (`lib/items.ts` + thin per-store wrappers, mirroring `combat.ts`'s shared-pure-function pattern). Tap-to-edit slot grid (`ItemSlotGrid.svelte`) in the Roster edit forms; 2-slot bulky items span a cell; a 6-pip charge track renders as display-only dots. Exceeding 10 slots shows an "Overburdened" warning banner that never blocks adding more.
- **Phase 8, wear/charge pips on items.** `tickCharge` (`lib/items.ts`) plus `tickMemberItemCharge`/`tickHirelingItemCharge` store wrappers let a charge track actually decrement, not just display. Live Session gets its first inventory surface: a "Bag N/10" pill on each `LiveSessionCard` opens `LiveSessionInventoryModal`, a fixed 2-column paws/body grid where tapping a chargeable item burns its next pip (whole-cell tap target, not the tiny pip glyphs) with the same undo-toast pattern as damage/conditions. Deliberately no add/edit/remove/reslot in this surface — that stays prep-only in the Roster forms; Live Session is charge-ticking only.
- **Phase 8, hireling wages + loyalty saves.** `Hireling` gains a plain GM-entered `wage` (pips/day, no formula/auto-population from role). Live Session gets a tappable Loyalty pill (on the hireling's card, and as a 4th "LOY" button in `SaveDock`) that rolls the real Mausritter loyalty save — 2d6 roll-under Loyalty (2–12 range), a *different* primitive from the d20 `rollSave` used for STR/DEX/WIL (`rollLoyaltySave` in `lib/generators/save.ts`), reported pass/fail only with no auto-decrement — the GM narrates the consequence of a failed save. A "Pay Day" modal lists active hirelings with their wage and a tap-to-toggle Paid/Unpaid tag (deliberately local, unpersisted state that resets every reopen — not a ledger) plus an inline loyalty-check shortcut for anyone still unpaid when the GM closes out. **Deviation from the original roadmap wording:** non-payment does *not* auto-decrement a shared pip purse — a `gm-product-owner`/rules pass on this bullet confirmed Mausritter has no such mechanical penalty, so Pay Day is bookkeeping + a rolling shortcut only, never an automatic mutation.

The IndexedDB migration flagged in the original Phase 1 was *not* done — the app is still `localStorage`-only. That's fine at current data volume; it's re-flagged as cross-cutting debt below because Phase 9 grows the volume and adds reference integrity concerns.

---

## Phase 9 — Weave the world together

The integration debt, and the single biggest reason the app is four documents rather than one campaign tool. Beats, Hexes, Factions, and Bestiary are currently unrelated lists that share a color palette. Ranks as high as Phase 6 in GM value; it touches every screen a little rather than one screen a lot.

- **Beats reference hexes and factions. ✅ Done.** `Beat` gained optional `hexNodeId: string | null` and `factionIds: string[]`. `BeatForm` edits both links (hex via a human-readable-label select, factions via an add/remove chip picker like `FactionForm`'s relationship picker); the relationship surfaces read-only on Hex Map ("beats touching this hex," in the hex detail modal) and Factions (as tags on the faction card and inside `FactionForm`), plus small tags under linked rows in `BeatTree`. Deleting a hex or faction cascades to null-out/strip the reference from any beat (`clearHexNodeFromBeats`, `removeFactionFromBeats` in `beats.svelte.ts`, called from `removeHexNode`/`removeFaction`) so a dangling ID can't crash the app, per the referential-integrity rule below. Legacy localStorage beats without these fields are backfilled on load. Covered by unit tests across all touched stores/components and a new `features/beat-links.feature` Playwright/Cucumber scenario.
- **Hex encounters draw from the real Bestiary. ✅ Done.** `HexNode` gained `encounters: { bestiaryId, weight }[]`; the flat "d8 flavor text" `ENCOUNTER_TABLE` in `tables.ts` is gone, replaced by `lib/generators/encounters.ts`'s `generateEncounterFor`, which reads real `BestiaryEntry` records — weighted-random within a hex's linked creatures, or a uniform roll across the whole bestiary for "any hex"/hexes with no links. `HexNodeForm` gets an Encounters section (add/remove + in-place weight edit via a new `Stepper` `sm` size); the hex detail modal surfaces the list read-only as tags. A new `StatBlock` component (extracted from `Bestiary.svelte`, now shared) renders the rolled creature's real stat block in Generators instead of a sentence. Deleting a bestiary entry cascades to strip it from every hex's encounter list (`removeBestiaryEntryFromHexNodes`), and a dangling id already in storage degrades to an em-dash rather than crashing, per the referential-integrity rule below. Legacy hex records without `encounters` are backfilled on load. Covered by unit tests across all touched stores/components plus `features/hex-bestiary.feature`.
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

- **Phase 8 is complete.** All three bullets — item model/slot inventory, wear/charge pips, and hireling wages/loyalty saves — have landed. **Phase 9 is the real "do next."**
- **Phase 9 should not slip to "someday."** It's the difference between four solid CRUD screens and one campaign tool. It's mostly ID-linking and light UI.
- **Route interaction-heavy work through `ux-ui-designer` first:** this paid off for Phase 8's slot-grid inventory and again for the Live Session charge-tapping surface (both easy to get wrong on a phone) and should apply to any future at-table interaction work.
- **Content accuracy through `gm-product-owner`:** the condition vocabulary, Fatal Wounds table, item/slot rules, and any new Bestiary/faction content must stay rules-accurate to Mausritter.
