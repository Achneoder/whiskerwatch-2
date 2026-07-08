# Live Session adventure picker — interaction spec (Phase 12, bullet 1)

**Mode: Live play.** GM's phone/tablet is propped next to dice, one hand is
free at most, attention is split across kids talking over each other. The bar
here is the same one Phase 11's reaction-roll and rules-drawer surfaces were
held to: zero reading required to operate it, tap targets sized for a thumb
that isn't aiming carefully, and — critically for *this* fix — the fast path
for the common case (one adventure running) must stay bit-for-bit as fast as
it is today. This is not a prep-mode surface; it must not gain a settings
toggle, a form, or persisted configuration. It exists for the length of one
sitting and then it's gone.

## The bug this fixes

`LiveSession.svelte` currently does:

```ts
const activeBeat = $derived(getBeats().find((b) => b.status === 'active') ?? null);
```

With two adventures each carrying an active beat, this silently returns
whichever beat happens to be first in storage order — not whichever one the
GM is actually running tonight. Beat title, the hex/encounter card, and (via
those) faction context all key off this one value, so the GM can be shown a
completely different plot thread's information without any indication
anything is wrong.

## Design decision: group by adventure, not by beat

The roadmap bullet says "when more than one beat is active." I'm scoping the
picker trigger to **two or more distinct adventures with an active beat**,
not "two or more active beats" literally. Reasoning: the GM's actual question
is "which adventure am I running tonight," not "which beat." If a single
adventure ever ends up with two beats simultaneously marked `active` (a
beat-tree data-hygiene edge case, not something Phase 12 is scoped to fix),
showing a picker listing the same adventure title twice would be confusing
noise, not help. In that case, falling back to array order within that one
adventure is harmless — there's no ambiguity about *which adventure* to run,
which is the only ambiguity this fix is responsible for closing.

## State model (transient, screen-scoped)

All new state lives in `LiveSession.svelte` as plain `$state`, alongside the
existing `rulesOpen`/`endSessionOpen` locals. Nothing persists — a fresh
mount of Live Session (i.e. a new sitting) always re-derives the default.

```ts
// Which adventure the GM has explicitly picked this sitting, if any.
// Null until the GM taps a choice; the *effective* selection (see below)
// falls back to the first option so there's always a valid activeBeat.
let selectedAdventureId = $state<string | null>(null);

// Every beat currently marked 'active', across every adventure.
const activeBeatsAll = $derived(getBeats().filter((b) => b.status === 'active'));

const adventures = getAdventures();

// One entry per adventure that has an active beat. If a beat's adventureId
// doesn't resolve to a real Adventure record (shouldn't happen once boot's
// migration has run, but storage can't be trusted blindly per CLAUDE.md),
// fall back to the beat's own title as the label so it never just vanishes
// from the list.
interface AdventureOption {
  id: string; // adventure id, or the beat id itself for the orphan-fallback case
  title: string;
  beat: Beat;
}

const activeAdventureOptions = $derived.by((): AdventureOption[] => {
  const seen = new Set<string>();
  const options: AdventureOption[] = [];
  for (const beat of activeBeatsAll) {
    const adventure = adventures.find((a) => a.id === beat.adventureId);
    const key = adventure?.id ?? beat.id;
    if (seen.has(key)) continue; // one option per adventure — first active beat wins, matching today's array-order fallback
    seen.add(key);
    options.push({ id: key, title: adventure?.title ?? beat.title, beat });
  }
  return options;
});

const needsPicker = $derived(activeAdventureOptions.length >= 2);

const effectiveAdventureId = $derived(
  needsPicker ? (selectedAdventureId ?? activeAdventureOptions[0].id) : null,
);

// This replaces today's bare `getBeats().find(b => b.status === 'active')`.
const activeBeat = $derived(
  needsPicker
    ? (activeAdventureOptions.find((o) => o.id === effectiveAdventureId)?.beat ?? null)
    : (activeBeatsAll[0] ?? null),
);

let pickerOpen = $state(false);
```

Everything downstream that already reads `activeBeat` (`activeHex`,
`LiveSessionEncounterCard`'s visibility, the beat title in the header) needs
**no changes** — the fix is entirely in how `activeBeat` gets computed.

### The 0/1 case is unchanged, byte for byte

When `activeAdventureOptions.length < 2`, `needsPicker` is `false`,
`activeBeat` resolves exactly the way it does today (`activeBeatsAll[0] ??
null`, i.e. the same `.find()` result), and — per the header spec below — no
new markup renders at all. Zero extra DOM, zero extra tap, zero behavior
change. This is the fast path and it must stay the fast path.

## Where it appears: `LiveSessionHeader.svelte`

The header's center column currently stacks three lines:

```
SESSION 4                    <- ww-label, accent
The Granary Job               <- session title, bold h3
Into the tunnels              <- beat title, muted caption
```

**When `needsPicker` is false:** no change to this component's markup or
props at all beyond what already exists.

**When `needsPicker` is true:** insert one new line between the session
title and the beat title — a small tappable chip identifying the *adventure*,
with the beat title line right below it still showing the beat itself. The
GM gets both pieces of context stacked, in the order they think about them
(which plot thread → which beat in it):

```
SESSION 4
The Granary Job
[ ▾ Granary raid ]            <- new: adventure picker chip
Into the tunnels
```

### Chip appearance (closed state)

- A small pill, visually a quieter sibling of `StatusPill`/`Tag`'s existing
  "accent, not solid" treatment (`text-[var(--accent)]`,
  `bg-[var(--accent-tint)]`, `border` at 30%-mixed accent) — the same tone
  already used for the `ww-label` eyebrow directly above it, so it reads as
  "part of the header," not a foreign control.
- Content: adventure title (truncate at ~20 characters on the smallest
  breakpoint) + a small `ChevronDown` (lucide, same 16px "prep" `Icon` size —
  this is a compact label, not a live-play primary control, so it doesn't
  need the 23px "live" icon size) that rotates 180° when open
  (`transition-transform duration-[calc(var(--dur-fast)*1ms)] ease-[var(--ease)]`).
- Real `<button>`, `min-h-[var(--tap)]` (44px — this is a live-play tap
  target, full stop, even though the visual pill is compact), horizontal
  padding `px-[var(--sp-3)]`, centered under the session title.
- `aria-haspopup="listbox"`, `aria-expanded={pickerOpen}`, `aria-label`
  templated as e.g. *"Choose adventure, currently Granary raid"* (see i18n
  below) — the visible text alone doesn't carry "this is a picker," so the
  accessible name has to say so explicitly.

### Expanded state (tap the chip)

Tapping the chip sets `pickerOpen = true` and reveals an inline list
directly below it — **not a `Modal`, not a scrim.** This is a 2–4 item
choice the GM needs to resolve in one glance and one tap; a full-screen
overlay is disproportionate ceremony for it, and the app already has a
lighter-weight "inline disclosure" idiom (the `<details>`/`<summary>`
fallen-party sections in `LiveSession.svelte` itself) that this should read
as a sibling of, not a departure from.

Structure:

```html
<div class="relative">
  <button ...chip...>
  {#if pickerOpen}
    <div role="listbox" aria-label="..." class="absolute left-1/2 top-full mt-1 -translate-x-1/2 z-10
         w-max min-w-[220px] max-w-[85vw] flex flex-col gap-1 p-1.5
         bg-[var(--surface-raised)] border border-[var(--border-strong)]
         rounded-[var(--radius-md)] shadow-[var(--shadow-modal)]">
      {#each activeAdventureOptions as option (option.id)}
        <button role="option" aria-selected={option.id === effectiveAdventureId}
                onclick={() => { selectedAdventureId = option.id; pickerOpen = false; }}
                class="flex flex-col items-start text-left min-h-[var(--tap)] px-[var(--sp-3)] py-1.5
                       rounded-[var(--radius-sm)] cursor-pointer
                       {option.id === effectiveAdventureId
                         ? 'bg-[var(--accent-tint)] text-[var(--accent)]'
                         : 'text-[var(--text)] hover:bg-[var(--surface-sunk)]'}">
          <span class="font-[family-name:var(--font-display)] font-bold text-[length:var(--text-body)] flex items-center gap-1.5">
            {#if option.id === effectiveAdventureId}<Icon icon={Check} />{/if}
            {option.title}
          </span>
          <span class="text-[length:var(--text-caption)] text-[var(--text-muted)] truncate max-w-full">
            {option.beat.title}
          </span>
        </button>
      {/each}
    </div>
  {/if}
</div>
```

- Each row shows **adventure title (bold) + its active beat title (muted,
  smaller)** stacked — two adventures can easily share a generic-sounding
  name at a glance ("The Court," "The Warband"), and the beat line is what
  actually disambiguates which session-in-progress this is. This costs
  nothing extra to compute; `option.beat` is already on hand.
- Selected row gets an accent tint fill + a small `Check` icon, mirroring
  `Tag`'s `solid`/tinted convention elsewhere in the app rather than
  inventing a new "selected" treatment.
- Row height `min-h-[var(--tap)]` (44px) — same tap-target floor as
  everything else in Live Session, deliberately generous given this is
  exactly the kind of under-table, one-handed tap that's easy to fumble.
- Tapping a row: sets `selectedAdventureId`, closes the list, done — no
  confirmation step. Switching is cheap and reversible (tap again to switch
  back), so it doesn't need one.
- Tapping the chip again while open closes it without changing selection.
- No outside-tap-to-dismiss handler. This matches the app's existing
  `<details>` disclosures, which don't auto-close either, and avoids adding
  a global click listener for a control that's already one tap to close
  explicitly.
- Positioning: `absolute`, centered under the chip via
  `left-1/2 -translate-x-1/2`, capped at `max-w-[85vw]` so it can never
  overflow a narrow phone screen regardless of adventure-title length;
  titles inside truncate rather than wrap to more than one line.
- `z-10` is enough to clear the header's own content but stay under
  `RulesDrawer`'s `z-100`/`z-101` and `Modal`'s `z-100` — this is header-local
  chrome, not a top-level overlay.

### Why not a `Modal`

A modal would work but is the wrong weight for this decision: it demands a
scrim tap or explicit close, adds a full animate-in/out cycle, and visually
declares "stop, this is a big decision" for something that's realistically a
2–3 item disambiguation the GM already knows the answer to before they even
tap (they know which game they're running tonight — this is confirming
intent, not gathering information). The inline pattern keeps the header the
single source of truth for "what am I looking at right now" without a
context switch.

## Props threading

`LiveSessionHeader` needs three new **optional** props so its 0/1 contract
is untouched when they're omitted:

```ts
interface Props {
  sessionNumber: number | null;
  sessionTitle: string | null;
  beatTitle: string | null;
  onexit?: (() => void) | undefined;
  onopenrules?: (() => void) | undefined;
  onendsession?: (() => void) | undefined;
  /** Only passed (non-empty) when 2+ adventures have an active beat. Omitted or empty ⇒ no picker renders at all. */
  adventureOptions?: { id: string; title: string }[] | undefined;
  /** The currently effective selection — always one of `adventureOptions`' ids when that list is non-empty. */
  selectedAdventureId?: string | null | undefined;
  onselectadventure?: ((id: string) => void) | undefined;
}
```

`LiveSession.svelte` passes:

```svelte
<LiveSessionHeader
  sessionNumber={lastSession?.number ?? null}
  sessionTitle={lastSession?.title ?? null}
  beatTitle={activeBeat?.title ?? null}
  adventureOptions={needsPicker ? activeAdventureOptions.map((o) => ({ id: o.id, title: o.title })) : undefined}
  selectedAdventureId={needsPicker ? effectiveAdventureId : null}
  onselectadventure={(id) => (selectedAdventureId = id)}
  {onexit}
  onopenrules={() => (rulesOpen = true)}
  onendsession={() => (endSessionOpen = true)}
/>
```

The header itself just does `{#if adventureOptions && adventureOptions.length > 1}` around the new chip block — keeping the "when do we show this" decision in one place (the screen, which owns the derived state) rather than duplicated between screen and header.

## i18n keys (add to `en.json` / `de.json` under `liveSession`)

```json
"adventurePicker": {
  "ariaLabel": "Choose adventure, currently {adventure}",
  "listAriaLabel": "Active adventures"
}
```

English source strings needed:
- `liveSession.adventurePicker.ariaLabel` → `"Choose adventure, currently {adventure}"`
- `liveSession.adventurePicker.listAriaLabel` → `"Active adventures"`

No visible copy is needed beyond the adventure/beat titles themselves — this
control has no label text on screen, only the chip's own content, matching
how `StatusPill`/`Tag` chips elsewhere in Live Session work (icon/value only,
`aria-label` carries the description).

## Responsiveness

- Phone (≤480px): chip and dropdown both cap width via `max-w-[85vw]`;
  dropdown centers under the chip regardless of where the chip sits inside
  the (already-centered) header column.
- Tablet/desktop: no change in behavior — same component, same breakpoint-
  free logic, since the header itself doesn't currently branch on viewport
  width. The dropdown's `w-max min-w-[220px]` means it won't look sparse on
  a wide screen just because two adventure titles are short.
- No layout shift for the common (0/1 active adventure) case on any
  breakpoint — the new block simply doesn't mount.

## Accessibility checklist

- Chip: real `<button>`, `aria-haspopup="listbox"`, `aria-expanded`,
  descriptive `aria-label` (visible text is just the title, not "this picks
  an adventure").
- List: `role="listbox"` with `aria-label`; rows are `role="option"` real
  `<button>`s with `aria-selected`.
- All tap targets (chip + each row) meet `--tap` (44px) minimum, consistent
  with the rest of Live Session's live-density tokens.
- Color: reuses `--accent` / `--accent-tint` / `--text-muted` tokens already
  vetted for contrast elsewhere in the app (same pairing as the header's own
  `ww-label` eyebrow) — no new color introduced.
- Keyboard: native buttons get Tab focus and Enter/Space activation for
  free; no custom key handling required for MVP (arrow-key roving focus
  would be a nice-to-have, not a blocker — this is a 2–4 item list operated
  primarily by touch).
- Motion: chevron rotation and list appearance both respect
  `prefers-reduced-motion` for free via the existing `--dur`/`--dur-fast`
  token overrides in `effects.css` (already zeroed under reduced-motion).

## Explicitly out of scope for this fix

- Persisting the pick across a reload — a live session is a same-sitting
  event per the roadmap; re-opening Live Session after a refresh re-derives
  the default (first option) same as before.
- Fixing a hypothetical single adventure with two simultaneously-active
  beats — that's a beat-tree data-hygiene question for the Adventure screen,
  not a Live Session lookup question, and today's harmless array-order
  fallback still applies within one adventure.
- Any change to `Adventure`/`Beat` data models — this is a pure read-side
  fix in `LiveSession.svelte`/`LiveSessionHeader.svelte`.

## Files a frontend engineer will touch

- `src/components/screens/LiveSession.svelte` — add the derived state block
  above (`activeBeatsAll`, `activeAdventureOptions`, `needsPicker`,
  `effectiveAdventureId`, `activeBeat`, `selectedAdventureId`), replace the
  current `activeBeat` derivation, thread the three new props to
  `LiveSessionHeader`. Needs `getAdventures` imported from
  `../../lib/stores/adventures.svelte`.
- `src/components/screens/LiveSessionHeader.svelte` — add the three optional
  props, the chip + inline listbox markup (guarded by
  `adventureOptions.length > 1`), local `pickerOpen` state, `Check`/
  `ChevronDown` icons from `lucide-svelte`.
- `src/lib/i18n/en.json` / `de.json` — add `liveSession.adventurePicker.*`.
- Tests: extend `LiveSession.test.ts`/`LiveSessionHeader.test.ts` with the
  0/1/2+ cases explicitly (this is a correctness bug fix — the 2+ case
  deserves its own regression test asserting the *right* beat's title/hex
  render after picking, not just that a chip appears), plus a
  `features/adventure-picker.feature` Playwright/Cucumber scenario: "Given
  two adventures each have an active beat, When the GM opens Live Session,
  Then a picker appears defaulted to the first adventure, When the GM taps
  the other adventure, Then the beat title and any hex encounter card update
  to match it."
