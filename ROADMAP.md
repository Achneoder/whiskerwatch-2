# Whiskerwatch Roadmap

Where the app is, and what's next, ordered by what actually unblocks running a real campaign.

## Where we are

**Phases 1–5 have shipped.** Every screen in `CLAUDE.md`'s domain list now exists and is wired to persisted, localStorage-backed stores: Dashboard, Roster (parties/mice/hirelings), Adventure (beat tree), Bestiary, Factions (relationship graph + clocks), Hex Map (canvas + per-hex nodes), Generators (dice/encounter/item/NPC), Sessions (log/recap), Settings, and the Live Session table view. The design system (tokens, `ui/` primitives), export/import of the whole campaign to JSON, a PWA manifest + service worker, and English/German i18n via `svelte-i18n` are all in place. Phases 1–5 are summarised under "Shipped" below and kept for history; the detailed forward plan now starts at **Phase 6**.

The honest state of it: **we have a solid CRUD skeleton, but every screen is still an island, and the one screen that matters most at the table — Live Session — has fallen behind the data model.** The next wave is not more screens. It's wiring the ones we have together and putting real Mausritter mice under the hood.

### Known defects to fix, not features to add

Two things surfaced in review that are bugs, not gaps, and they anchor Phase 6/7:

- **Live Session shows fixture data.** `LiveSession.svelte` still renders literal strings — "The granary raid", "Session 5", a "Court 3/6" faction pill — and reads only the hardcoded seed `party`, ignoring the real `sessions`, `beats`, `factions`, and `hirelings` stores that every other screen already uses.
- **The roll mechanic is the wrong game.** `doRoll()` treats 2d6 as a PbtA-style band (`>=8` success / `>=6` partial / else fail). Mausritter saves are **d20 roll-under**: roll a d20 against a STR/DEX/WIL score (GM picks which, based on the fictional situation), plain pass/fail — there is no natural-2/12 crit/fumble rule in core Mausritter (that's a 2d6 OSR convention from a different game). As built, the app actively misteaches the rules on both the die and the crit mechanic.

## Shipped (Phases 1–5)

Kept as a record of how we got here. Full detail lives in git history; this is the summary.

- **Phase 1 — real session end to end.** Roster CRUD for player mice and hirelings; per-entity persisted stores (`persistedList.svelte.ts` + `storage.ts`); export/import of the whole campaign to a single JSON file (`campaignExport.ts`) so a campaign survives a browser wipe and can move between devices.
- **Phase 2 — prep tools.** Adventure beat tree (`BeatTree`, `BeatForm`) and a Sessions log (`SessionForm`, `sessions.svelte.ts`).
- **Phase 3 — bestiary & generators.** Rules-accurate Bestiary stat blocks; dice roller and encounter/item/NPC generators (`lib/generators/tables.ts`).
- **Phase 4 — factions & hex map.** Faction list + relationship graph (`FactionGraph`) + clocks; hex-crawl canvas (`HexCanvas`) with per-hex nodes (`HexNodeForm`).
- **Phase 5 — polish & cross-cutting.** Playwright + Cucumber BDD harness stood up; per-screen i18n (English/German); Settings screen wired to theme/language/export-import; PWA manifest + service worker (`lib/pwa.ts`) for offline use at the table.

The IndexedDB migration flagged in the original Phase 1 was *not* done — the app is still `localStorage`-only. That's fine at current data volume; it's re-flagged as cross-cutting debt below because Phases 8–9 grow the volume and add reference integrity concerns.

---

## Phase 6 — Fix the table: make Live Session tell the truth

Live Session is the one screen used *during* play, and right now it's a prop, not a tool — it shows fixture data while every other screen has moved on to real stores. **No new screens here, only wiring, and it ships before anything in Phase 7+.**

- **Live Session reads real state.** The header pulls the in-progress `Session` (title/number) from `sessions.svelte.ts` and the active `Beat` (status `active`) from `beats.svelte.ts` instead of literal strings. Corrective, not additive — do it immediately.
- **Faction clocks live at the table, not just on the Factions screen.** Surface the 1–2 faction clocks nearest to full (or those tied to the active beat once Phase 9 links them) as tappable pills that increment/decrement in place. Ticking a clock is a constant mid-scene GM reflex ("the Court definitely heard that"); today it requires leaving the table view entirely.
- **Hirelings appear in Live Session.** They have HP and can die exactly like player mice, but are currently invisible at the table. Same card component, second data source.
- **Fix the roll to be an actual Mausritter save.** Replace "Roll 2d6" with "Save": pick a mouse, pick STR/DEX/WIL, roll a **d20** *under* the score, report pass/fail. No crit/fumble rule — plain pass/fail is correct Mausritter. Depends on Phase 7's attribute fields, so sequence it right after those land. This is a correctness fix — the current band logic (and die) teaches the wrong system.

## Phase 7 — Give mice the stats Mausritter actually runs on

You cannot run saves, carrying capacity, or the death spiral without this. It's foundational and blocks half of Phase 6 and 8, so in practice it lands in parallel with — or just before — Phase 6's save-roll item.

- **STR / DEX / WIL on `PartyMember` and `Hireling`.** Add the three attribute scores to the data model and to `PartyForm`/`HirelingForm`. Everything below depends on this; it's the first commit of the phase.
- **HP-then-STR damage overflow, with the real death spiral.** Damage drains HP first; at 0 HP, further damage drains STR directly — there is no separate wound counter. Any hit that drains STR triggers a STR save (at the *new*, reduced STR): pass and the mouse keeps fighting; fail and it gains **Injured** plus **Incapacitated** (out of the fight), with death after 6 untended exploration turns unless treated. STR reduced to exactly 0 is immediate death, no save. Add `dealDamage(id, amount)` that encodes HP→STR overflow, exposed as the primary damage control in Live Session (a bare stepper isn't enough — "apply 3 damage to Wren" should be one action, with the app doing the HP→STR math and triggering the save so the GM isn't doing arithmetic mid-combat).
- **Fatal Wounds is deterministic, not a random table.** There is no "roll a Fatal Wounds table" mechanic in Mausritter — death/Injured/Incapacitated is the branching outcome of the STR save above, not a dice lookup. When STR hits 0, surface a one-tap prompt confirming the mouse's death (permanent, roster-altering) rather than rolling for an outcome. This is the moment a "whimsical but real danger" game gets real, and it's easy to fumble under pressure — the app should catch it, not the GM's memory.
- **Standardized condition vocabulary.** Replace the free-text `{tone, label}` condition shape with the rulebook's fixed list (Exhausted, Frightened, Hungry & Thirsty, Injured — plus Unconscious/Incapacitated from the death spiral above), each carrying its actual mechanical note (mostly disadvantage on specific saves) and occupying an inventory slot while active. Live Session gets a tap-to-add condition chip picker instead of a text field. Cheaper than the items above and removes a class of "GM has to remember what this rule does" friction.
- **XP-from-spending downtime.** Mausritter awards XP for *spending* pips in downtime (carousing, gear, keepsakes), not for kills — a defining, non-obvious rule. Add a per-mouse "Downtime" action: enter pips spent at the settlement, app computes XP gained and flags a level-up at the threshold. A between-session tool, so it sequences after the live-play plumbing; must exist before this campaign's mice start leveling.

## Phase 8 — Inventory, gear, and hirelings that cost something

Mausritter's whole itemization identity is the fixed-size slot grid and pip-charge tracking, not weight or an infinite bag. The app has neither today, so every table still needs a paper inventory card next to the tablet — defeating the point.

- **Item model + slot inventory.** A proper `items.svelte.ts` store (`{id, name, slots, charges/maxCharges, notes}`), and each mouse/hireling gets the fixed body/paws slot grid from the character sheet instead of a free list. Enforce "you're full" as a soft warning (Overburdened condition), never a hard block. This is the largest single item in this wave — route the interaction through `ux-ui-designer` before building; a slot grid on a phone is a real design problem, not just a list.
- **Wear/charge pips on items.** Torches, rations, rope and similar consumables get a pip track (☐☐☐☐) that ticks down with use, tap-to-cross-off in Live Session. This is the actual "pip" system on Mausritter's item cards and is completely absent today — right now "pips" in this codebase means only currency.
- **Hireling wages + loyalty saves.** Add a daily wage to `Hireling`; a "pay day" prompt at session start/end that decrements the shared pip purse; and a one-tap loyalty save in Live Session for the "will they follow you into the tunnel" moment (2d6 vs. loyalty, same roll-under pattern as attribute saves). Hirelings currently have a loyalty *number* with no mechanic that ever reads it.
- **Sequencing:** after Phase 7's save mechanic exists — loyalty checks and item-use saves reuse that same roll-under primitive. Build the primitive once, reuse it three times.

## Phase 9 — Weave the world together

The integration debt, and the single biggest reason the app is four documents rather than one campaign tool. Beats, Hexes, Factions, and Bestiary are currently unrelated lists that share a color palette. Ranks as high as Phase 6 in GM value; it touches every screen a little rather than one screen a lot, and can run concurrently with Phase 8.

- **Beats reference hexes and factions.** `Beat` gains optional `hexNodeId` and `factionIds[]`; the relationship surfaces back on Hex Map and Factions ("beats touching this hex / faction"). This is what makes prep connective instead of three separate documents about the same campaign.
- **Hex encounters draw from the real Bestiary.** `HexNode` gains an optional list of `bestiaryEntryId` + weight, and the flat "d8 flavor text" `ENCOUNTER_TABLE` in `tables.ts` is replaced by generation that reads real `BestiaryEntry` records — so a rolled encounter links straight to a stat block, not a string. Turns Generators from a flavor-text toy into a tool a GM trusts for HP/attacks.
- **Hexes link to factions.** Optional "controlled by" / "contested by", drawn as a colored ring/tag on the canvas (mirroring the faction graph's disposition ring), so a GM can glance at the map and see whose territory the party is walking into.
- **Generated content is keepable.** The NPC/monster generators currently produce results that vanish on next click. Add "save to roster as hireling" / "save to bestiary" so an NPC improvised at the table doesn't have to be re-typed from memory next session.

## Phase 10 — Close the loop: sessions that write themselves

Prep and live-play are covered by 6–9; this phase is the *after* — `CLAUDE.md`'s "next session starts fast."

- **Session auto-recap draft.** When a GM ends a Live Session, generate a draft `Session` pre-filled with which beats changed status, which faction clocks moved, which mice took damage / gained conditions / leveled up, and any Fatal Wounds rolls. The GM edits prose on top instead of reconstructing the night from memory. Highest-leverage item here once 6–9 give it something real to summarize.
- **Campaign timeline view.** A read-only chronological feed merging sessions, clock changes, and beat completions ("when did the Owl Bridge toll go up?"). Nice-to-have, prep-mode.
- **Scars & death ledger.** A small persisted list of permanent Fatal Wounds outcomes per mouse, shown on the roster card. Cheap once Phase 7's Fatal Wounds prompt exists, and good for table drama.

## Cross-cutting, not a phase

- **IndexedDB migration.** Re-flagged from the original Phase 1; still not done, still fine for now (`persistedList.svelte.ts` on `localStorage` handles current volume). Revisit once Phase 8's item store and Phase 9's cross-links land — not speculatively before.
- **Referential integrity on delete.** `factions`/`factionEdges` already do this right (`removeEdgesForFaction`). Every Phase 9 cross-link (beat→hex, hex→faction, hex→bestiary) needs the same cascade-or-null-out discipline, or deleting a hex silently orphans a beat's reference — and per `CLAUDE.md` a dangling ID must degrade gracefully, not crash.
- **Testing.** Every item keeps the established Vitest + Playwright/Cucumber pairing. The save mechanic especially deserves a Gherkin scenario — e.g. "Given Wren has 0 HP and a STR save fails, When the GM applies 3 more damage, Then Wren's STR drops and a Fatal Wounds prompt appears" — since it's a rules-correctness surface, not just UI.

## Explicitly out of scope (would be scope creep)

- **Full character-creation wizard** (rolling starting stats/background/items). GMs in this campaign already have their mice — this is new-campaign onboarding, not running-this-campaign. Revisit only if zero-to-one setup becomes a target use case.
- **Weather/season/calendar systems.** Mausritter has light seasonal downtime rules, but nothing at this table has asked for it. Don't build ahead of real need.
- **Multi-campaign / co-GM real-time sync.** No backend by design (`CLAUDE.md`); the "hand off to a co-GM" story is the export/import flow already shipped, not sync.

## Sequencing notes

- **Phase 6 and 7 are the real "do first."** Live Session showing fixture data and rolling the wrong dice are defects; the attribute model that fixes the roll is foundational for Phases 8–10. Treat 6/7 as one intertwined effort — 7's stats, then 6's wiring on top.
- **Phase 9 should not slip to "someday."** It's the difference between four solid CRUD screens and one campaign tool. It's mostly ID-linking and light UI, so run it alongside Phase 8 if capacity allows.
- **Route interaction-heavy work through `ux-ui-designer` first:** Phase 6/7's damage-input control (it does HP→STR math for the GM) and especially Phase 8's slot-grid inventory, which is the easiest thing in this wave to get wrong on a phone.
- **Content accuracy through `gm-product-owner`:** the condition vocabulary, Fatal Wounds table, and any new Bestiary/faction content must stay rules-accurate to Mausritter.
