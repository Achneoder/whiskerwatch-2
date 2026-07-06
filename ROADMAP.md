# Whiskerwatch Roadmap

Where the app is, and what's next, ordered by what actually unblocks running a real campaign.

## Where we are

Built: the design system (tokens, `ui/` primitives) and two proof screens — **Dashboard** (prep) and **Live Session** (table) — wired to a real, localStorage-persisted party store. Everything else in `CLAUDE.md`'s domain list (Roster, Adventure, Bestiary, Factions, Hex Map, Generators, Settings) is a sidebar placeholder only.

## Before any new screen: data durability

This is the sharpest gap, and it should be fixed before the feature list below grows the amount of data at risk. The app has **no backend and no accounts** — a campaign lives entirely in one browser's storage. That means:

- Clearing browser data, a browser reinstall, switching devices, or private/incognito use silently deletes a campaign with no recovery path.
- There is currently no way to move a campaign from a laptop to a tablet, or hand one off to a co-GM.

**Do this first:** an export-to-file / import-from-file feature (a single JSON download of the whole campaign, restorable on any device) and a "your data lives only in this browser" notice somewhere a new user will actually see it. This isn't a nice-to-have — it's the difference between a tool a GM trusts with a campaign and one they're afraid to.

## Phase 1 — Make a real session runnable end to end

The Dashboard and Live Session currently show one hardcoded warband. A GM can't yet input *their own* campaign. This phase is about closing that gap, not adding new screens' worth of scope.

- **Roster**: create/edit/delete player mice and hirelings (name, role, HP/max, pips, conditions) — the `PartyForm`/`HirelingForm` from `CLAUDE.md`'s component conventions. This is what the Dashboard/Live Session warband list should read from instead of seed data.
- **Campaign data model**: generalize `party.svelte.ts`'s pattern into a proper store per entity (parties, hirelings, sessions) backed by IndexedDB once data volume grows past what localStorage comfortably holds (hex maps and bestiaries will).
- **Export/import** (see above) — depends on the data model existing, so it belongs at the end of this phase, not the very first commit.

## Phase 2 — Prep tools

What a GM actually does *between* sessions, once there's a real roster to plan around.

- **Adventure**: adventure outline broken into beats (`BeatTree`, `BeatForm`) — the prep-mode planning surface. Dense is correct here per the design system's density model.
- **Sessions**: a log of past sessions (date, summary, what happened) — the "Session #5" stat tile on the Dashboard is currently decorative; this phase makes it real, and gives the GM a fast recap-mode entry point right after a session ends.

## Phase 3 — Bestiary & Generators

The GM's improvisation toolkit — needed once actual sessions are being run, not before.

- **Bestiary**: monster/NPC stat blocks, rules-accurate to Mausritter. Route through the `gm-product-owner` subagent for content accuracy.
- **Generators**: dice roller (already have `DiceRoll` as a *display* primitive — this is the input/roll-request side), encounter generator, item generator, NPC generator. These are live-play-mode tools first — low friction, big touch targets — with a denser prep-mode variant for pre-rolling loot tables etc.

## Phase 4 — Factions & Hex Map

The most structurally complex screens — worth doing after the simpler CRUD screens above establish the data/form patterns to reuse.

- **Factions**: faction list + relationship graph (`FactionGraph`) + clocks, replacing the Dashboard's hardcoded faction cards.
- **Hex Map**: hex-crawl canvas (`HexCanvas`) with per-hex content (`HexNodeForm`). Likely the single biggest scope item on this roadmap — probably deserves its own design pass with `ux-ui-designer` before implementation starts, specifically for how a hex map behaves at live-play density (a canvas doesn't "fatten up" the way a button does).

## Phase 5 — Polish & cross-cutting debt

Things that are correctly deferred until there's a real app to apply them to, but shouldn't be deferred indefinitely.

- **Playwright + Cucumber BDD harness**: flagged as explicitly out of scope when Dashboard/Live Session shipped. `CLAUDE.md` requires it for every feature going forward — stand it up before Phase 1's Roster ships, or the testing bar silently erodes from the first new feature.
- **i18n**: `svelte-i18n` is a dependency and English/German is the stated target, but no screen has translated strings yet. Worth doing per-screen as each is built, not as one giant retrofit at the end.
- **Settings screen**: currently a placeholder; needs to surface the theme toggle (currently only reachable from the Dashboard sidebar), language switch, and the export/import from Phase 1.
- **Accessibility pass**: two known a11y lint warnings exist today (`Card`/`StatusPill` conditional `role`/`tabindex` — false positives from static analysis, but worth a real screen-reader pass once more interactive surfaces exist).
- **Offline/installability**: consider a PWA manifest + service worker so the app is reliably usable with no network at the table — fits the "no backend" philosophy and matters more once the app is depended on session to session.

## Sequencing notes

- Data durability (export/import) before Phase 1 finishes, not after — the cost of losing a real campaign only grows as more phases ship.
- The Playwright/Cucumber harness should land at the *start* of Phase 1, not the end of Phase 5 — every phase after it will otherwise add to the same debt.
- Hex Map is deliberately last: it's the highest-uncertainty design problem (a spatial canvas under the density system), and the CRUD patterns from Roster/Adventure/Bestiary will make it faster to build correctly once established.
