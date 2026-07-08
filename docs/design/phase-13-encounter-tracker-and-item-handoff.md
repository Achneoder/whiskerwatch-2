# Live-combat HP tracker + item hand-off — interaction spec (Phase 13)

**Mode: Live play**, both features. Same bar as Phase 11's reaction-roll/
rules-drawer and Phase 12's adventure picker: the GM's phone/tablet is
propped next to dice, one hand is free at most, attention is split across
kids talking over each other. Nothing here should require reading a
paragraph or aiming carefully. Both features extend surfaces that already
exist (`LiveSessionEncounterCard`, `LiveSessionInventoryModal`) rather than
introducing new screens, and both reuse interaction patterns the GM has
already learned from `LiveSessionCard` — a fight shouldn't feel like a
different app from the rest of Live Session.

---

## Part 1 — Live-combat HP tracker for rolled encounters

### The gap

`LiveSessionEncounterCard.svelte` rolls one `BestiaryEntry` and renders it
via the read-only `StatBlock` — HD/HP/Armor/attacks as reference text, no
state. The moment the fight starts, the GM has nothing to tap; today they
fall back to a scrap of paper or their memory to track "the Rat Court
Enforcer is down to 3 HP." That's the exact gap Phase 8/11's slot-grid and
charge-tap surfaces closed for inventory — this closes it for the one
remaining live-session interaction that still requires leaving the app.

### Design decision: instances, not a single counter

A rolled encounter becomes one or more **tracked instances** — each a small
independent HP pool, because Mausritter encounters are routinely groups
("3 Ratlings," "a Ratling and its Tunnel Widow") and a single shared HP bar
across a group would be actively wrong (you can't have "the ratlings are at
14/20 HP combined," you have three separate 4-HP creatures and the GM needs
to know which ones are still standing).

**How instances get created — no new roll, no interrupting stepper.**
Rolling an encounter (the existing `onrollencounter`) spawns exactly **one**
instance immediately, at zero extra taps — the common case (a solo Sewer
Owl, say) needs nothing further. Groups are built by tapping a small
**"+ Add another"** chip that appears next to the roll button once a result
exists: each tap clones one more instance of the *same* rolled creature at
full HP. This is deliberately not a quantity stepper shown up front —
a stepper interrupts the roll with a decision the GM often doesn't know the
answer to until they've looked at their notes ("was it 2 or 3 ratlings in
this room?"); tapping "+" three times while glancing at a hex note is
faster and more forgiving of getting it wrong (see removal, below) than
committing to a count before anything's on screen.

Re-rolling the encounter (tapping the same "Roll an encounter" button again)
clears every existing instance and any reaction result, then spawns one
fresh instance of the new creature — identical to how re-rolling already
clears `reactionResult` today. A different active hex (new beat, or the same
beat re-linked) also clears instances, mirroring the existing
`$effect` that resets `encounterResult`/`reactionResult` on `activeHex.id`
change.

### Data model (transient, screen-scoped — no store, no persistence)

Combat state is exactly as ephemeral as `encounterResult`/`reactionResult`
already are: it lives for one fight, in one sitting, and a refresh or a new
mount starts clean. No `EncounterInstance` ever touches IndexedDB.

```ts
// LiveSession.svelte
interface EncounterInstance {
  id: string; // crypto.randomUUID()
  label: string; // "Ratling 1", "Ratling 2", ... — always numbered, even
                 // when there's only one, so adding a second never requires
                 // renaming the first (see rationale below)
  hp: number;
  maxHp: number;
}

let encounterInstances = $state<EncounterInstance[]>([]);

function spawnInstance(entry: BestiaryEntry): EncounterInstance {
  const n = encounterInstances.length + 1;
  return { id: crypto.randomUUID(), label: `${entry.name} ${n}`, hp: entry.hp, maxHp: entry.hp };
}

function rollHexEncounter() {
  if (!activeHex) return;
  encounterResult = generateEncounterFor(activeHex.id, hexNodes, bestiary);
  reactionResult = null;
  encounterInstances = encounterResult ? [spawnInstance(encounterResult)] : [];
  openInstanceDrawer = null;
}

function addAnotherInstance() {
  if (!encounterResult) return;
  encounterInstances = [...encounterInstances, spawnInstance(encounterResult)];
}
```

**Why always-numbered, even for a solo creature:** the alternative — bare
"Ratling" until a second one shows up, then renaming the first to "Ratling
1" — means the label a GM already read and started using mid-sentence
changes under them. Numbering from instance one is a negligible cost (a
"Sewer Owl 1" reads fine) in exchange for zero rename logic and zero
mid-fight identity confusion.

### Damage/heal interaction — reuse `LiveSessionCard`'s drawer, don't reinvent it

Each instance gets the *same* hurt/heal interaction already shipped for
mice: a chip grid (1–6), a hurt/heal mode toggle, and a custom-amount
`Stepper` for anything bigger. The brief is explicit that this should be
recognizable, not reimagined — a GM who's already learned "tap Hurt, tap a
number chip" for Wren shouldn't have to learn a second gesture for a
Ratling.

**Engineering note (not just a visual echo — extract the shared piece):**
`LiveSessionCard.svelte` currently inlines its chip-grid + mode-toggle +
custom-stepper markup (lines ~195–234) directly in the component. Rather
than copy that block into a second component, pull it into a shared
`HurtHealDrawer.svelte` (`src/components/ui/`) taking `mode`, `chips`,
`customAmount`, and the four callbacks (`onmode`, `onchip`, `oncustomtoggle`,
`onapplycustom`) as props, and have both `LiveSessionCard` and the new
encounter-instance row render it. This isn't scope creep — it's the same
reasoning Phase 9 used to extract `StatBlock` out of `Bestiary.svelte` once
a second surface needed it: two independent copies of stat/interaction
markup is exactly the kind of drift Phase 9's design doc flagged as a
mistake to avoid repeating.

**What's dropped versus the mouse version, deliberately:**
- No STR bar, no STR-save prompt, no death-spiral, no cause-of-death dialog.
  Monsters don't roll STR saves or take Fatal Wounds in Mausritter — that's
  entirely a player/hireling mechanic. HP simply floors at 0.
- No conditions row, no bag pill, no loyalty pill — an `EncounterInstance`
  isn't a `PartyMember`/`Hireling`, it has no inventory or morale to track
  here (a defeated monster's loot is what the *item hand-off* feature below
  is for, on the mouse who picks it up).
- HP bar uses `HpBar` `size="md"` (20px pips), not `size="live"` (30px pips,
  reserved for player/hireling primary HP). This is a deliberate hierarchy
  choice, not an oversight: the highest-stakes glance at the table is
  "is my player okay," so player/hireling HP keeps the most visually
  dominant treatment; monster HP is still touch-legible and easy to read at
  a glance, just visually subordinate to the party's own bars.

### Layout — one card per encounter, N compact rows inside it

`LiveSessionEncounterCard` keeps its existing structure (roll button →
`StatBlock` reference → reaction roll) and gains an instance list between
the stat block and the reaction button. The stat block stays singular and
shared (HD/attacks/special text is identical across every instance of the
same creature — repeating it three times would be pure noise); only HP is
tracked per instance.

```
┌─ ENCOUNTER · Tunnel Junction ───────────────────────┐
│ [ Roll an encounter ]  (re-tap to reroll)           │
│                                                      │
│ Gnawing Court Ratling            [Vermin]           │
│ HD 2   HP 4   Armor 1                               │
│ Rusty blade (d6)                                    │
│ Pack tactics: +1 to hit when two+ ratlings attack…  │
│                                                      │
│ [ + Add another Ratling ]                           │
│                                                      │
│ ┌──────────────────────────────────────────────┐   │
│ │ Ratling 1                              [ x ]  │   │  <- always-available
│ │ HP ▓▓▓▓░░░░ 2/4                                │   │     remove (see below)
│ │ [ Hurt ]                                       │   │
│ └──────────────────────────────────────────────┘   │
│ ┌──────────────────────────────────────────────┐   │
│ │ ~~Ratling 2~~          DEFEATED               │   │
│ │ [ Remove ]                                     │   │
│ └──────────────────────────────────────────────┘   │
│ ┌──────────────────────────────────────────────┐   │
│ │ Ratling 3                              [ x ]  │   │
│ │ HP ▓▓▓▓▓▓▓▓ 4/4                                │   │
│ │ [ Hurt ]                                       │   │
│ └──────────────────────────────────────────────┘   │
│                                                      │
│ [ Roll reaction ]                                   │
└──────────────────────────────────────────────────────┘
```

Row markup (new `LiveSessionEncounterInstance.svelte`, sibling to
`LiveSessionCard.svelte`, following the same "one component per repeated
card" convention):

```svelte
<div class="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-sunk)] p-[var(--sp-3)] flex flex-col gap-2">
  <div class="flex items-center justify-between gap-2">
    <span class="font-bold text-[length:var(--text-body)] {defeated ? 'line-through text-[var(--text-faint)]' : ''}">
      {instance.label}
    </span>
    {#if defeated}
      <StatusPill tone="danger" size="sm">{$_('liveSession.encounter.defeated')}</StatusPill>
    {:else}
      <!-- always-available small remove ("this one fled / I added one too many"),
           separate from the defeated/mark-dead flow below -->
      <button
        type="button"
        onclick={() => onremove(instance.id)}
        aria-label={$_('liveSession.encounter.removeAria', { values: { label: instance.label } })}
        class="min-w-[var(--tap)] min-h-[var(--tap)] grid place-items-center rounded-[var(--radius-md)] text-[var(--text-faint)] cursor-pointer bg-transparent border-none"
      >
        <Icon icon={X} />
      </button>
    {/if}
  </div>

  {#if !defeated}
    <HpBar value={instance.hp} max={instance.maxHp} size="md" tone="hp" label={$_('liveSession.hp')} />
    <Button variant="danger" size="sm" onclick={() => ontoggledrawer(instance.id)}>
      {$_('liveSession.hurt')}
    </Button>
    {#if drawerOpen}
      <HurtHealDrawer mode={mode} onmode={...} onchip={(n) => onapply(instance.id, n)} ... />
    {/if}
  {:else}
    <Button variant="secondary" size="sm" onclick={() => onremove(instance.id)}>
      {$_('liveSession.encounter.remove')}
    </Button>
  {/if}
</div>
```

- `defeated` is simply `instance.hp === 0` — computed, not a separate flag,
  so there's no way for it to drift out of sync with the HP value.
- **The always-available small "×" (top-right, while alive)** is a
  deliberate addition beyond the strict "mark-dead once HP hits 0" ask: real
  play has creatures flee, or a GM taps "+ Add another" once too many. This
  costs one small icon button and closes an obvious real-table gap; it is
  *not* the mark-dead action (that only appears once `hp === 0`).
- **The mark-dead/remove action, once `hp === 0`:** the row automatically
  flips to a dimmed, strikethrough "Defeated" state — no separate "mark
  dead" tap is needed because reaching 0 HP *is* death for a monster (no
  STR save, no Fatal Wounds, per the brief). The one action available is
  **Remove**, a plain secondary button, full width of the row for an easy
  target. This is the single action the brief calls for ("mark-dead/remove
  action... simpler than the player-character death flow") — reaching 0
  already communicates "dead"; removal just clears it from the tracker.
- **Removal has the same undo affordance as everything else in Live
  Session** (damage, heal, charge-burn all already use `announce(...,
  undo)`) — tapping Remove splices the instance out and shows the shared
  screen-bottom notice ("Ratling 2 removed — Undo") for ~6s, restoring it at
  its last HP if tapped. No `ConfirmDialog` — that component is reserved for
  the player/hireling death flow, which is irreversible and asks for a cause
  of death; removing a monster instance is cheap, common, and already
  undoable, so a confirmation step would only add friction to a low-stakes,
  frequent action.

### Single-drawer-at-a-time, extended (not duplicated)

`LiveSession.svelte` already enforces "at most one card's drawer open across
the whole screen" via one `openDrawer = $state<{ id: string; kind: 'damage'
| 'condition' } | null>`. Encounter instance ids are also
`crypto.randomUUID()`-generated, so they share the same id-space safely —
**reuse `openDrawer` for instance rows too**, rather than introducing a
second "one thing open" state machine. Opening an instance's Hurt drawer
closes any open party/hireling drawer and vice versa, which is the right
behavior anyway (the GM's attention is on one card at a time).

```ts
// LiveSession.svelte — extends the existing pattern, no new state shape
function damageInstance(id: string, amount: number) {
  const before = encounterInstances;
  encounterInstances = encounterInstances.map((i) => (i.id === id ? { ...i, hp: Math.max(0, i.hp - amount) } : i));
  const inst = encounterInstances.find((i) => i.id === id);
  announce('encounter:' + id, $_('liveSession.damageApplied', { values: { amount } }), () => (encounterInstances = before));
  if (inst?.hp === 0) logEvent({ kind: 'death', name: inst.label, role: 'monster' }); // see logging note below
}

function healInstance(id: string, amount: number) {
  const before = encounterInstances;
  encounterInstances = encounterInstances.map((i) => (i.id === id ? { ...i, hp: Math.min(i.maxHp, i.hp + amount) } : i));
  announce('encounter:' + id, $_('liveSession.healApplied', { values: { amount } }), () => (encounterInstances = before));
}

function removeInstance(id: string) {
  const before = encounterInstances;
  const removed = before.find((i) => i.id === id);
  encounterInstances = before.filter((i) => i.id !== id);
  if (removed) {
    announce('encounter:' + id, $_('liveSession.encounter.removed', { values: { label: removed.label } }), () => (encounterInstances = before));
  }
}
```

**Recap-log note:** `liveSessionLog.svelte.ts`'s `death` event kind is
currently party/hireling-scoped (`role: 'party' | 'hireling'`) and feeds the
session recap's "Party"/"Hirelings" grouping in `SessionRecapReview`. A
defeated monster is *not* a death worth drafting into the recap the same
way ("Wren died" is a huge session fact; "a Ratling died" is not — the
recap already exists to capture what mattered, and every individual monster
kill would be noise). **Recommendation: don't log monster defeats to
`liveSessionLog` at all.** If the GM wants "cleared a Ratling nest" in the
recap, that's exactly what the free-text prose area of `SessionForm`
(post-draft) is for. This keeps Phase 13 from having to touch
`liveSessionLog.svelte.ts`'s event union or `SessionRecapReview`'s grouping
logic at all.

### Connecting to loot hand-off, without new coupling

The brief asks me to consider whether "fight ends → hand off loot" should
feel connected. It should feel connected *in guidance*, not in engineered
state — wiring the encounter tracker to the inventory modal (e.g.
auto-opening a specific mouse's bag when the last instance is removed) would
guess at something the app can't know (which mouse picked up the loot, or
whether there was loot at all — that's still entirely GM narration). Instead:
once `encounterInstances.length` reaches 0 *after having had at least one*
(i.e., the fight is now empty, not "never rolled"), the encounter card shows
a small dismissible one-line tip in place of the empty instance list:

```
Fight's over. Tap a mouse's Bag to hand off any loot →
```

This is copy-only — no new state beyond "was this card ever non-empty,"
reusing the same tone as the app's other one-line contextual nudges (the
Dashboard's "Nothing urgent" line is the closest precedent: a plain-language
sentence, not a component). It costs nothing to build and directly answers
the pairing question without inventing a cross-feature state machine.

### Responsiveness

- Phone (≤480px): the card is already full-width inside `LiveSession`'s
  `max-w-160` column; instance rows stack full-width, one per row — no grid,
  since 2-up would make each row too narrow for the name + HP bar + button
  to read comfortably at live-play sizing.
- Tablet/desktop: same single-column row stack. A 2-column row grid was
  considered for wider screens but rejected — a GM scanning "who's still up"
  benefits from a single top-to-bottom reading order more than from
  horizontal density, and it keeps the component free of a breakpoint
  branch, consistent with how `LiveSessionCard` itself has none.
- All tap targets (`Hurt`, `Remove`, the corner `×`, every chip in
  `HurtHealDrawer`) are `min-h-[var(--tap)]` (44px), matching every other
  Live Session control.

### Accessibility checklist

- Each row's remove/mark-dead button has an `aria-label` including the
  instance's label (`"Remove Ratling 2"`), not just "Remove" — with 3+ rows
  on screen, a generic label read out of context would be ambiguous.
- `HpBar` reuses its existing `label`/`showValue` — no accessibility work
  needed there, it's the same component already audited for Phase 7/8.
- Defeated state is communicated by both the `StatusPill` text ("Defeated")
  and the strikethrough — never color alone.
- Undo notices reuse the existing single `notice` region and its established
  pattern (text + an inline "Undo" button), already screen-reader-friendly
  as shipped.

---

## Part 2 — Item hand-off between party members

### The gap

`LiveSessionInventoryModal.svelte` is explicitly charge-ticking only — "no
add/edit/remove/reslot." That was the right initial scope, but "Wren hands
Pip the rope" is one of the most common things that actually happens at a
Mausritter table (loot after a fight, splitting a stack of items before a
scouting split, a hireling handing off a torch as it burns out), and today
the GM has to either remember to fix it in two Roster forms later or just
let the character sheets silently drift from what happened in the fiction.

### Design decision: a per-item side control, not a select-then-act mode

The existing charge-burn interaction is a *single tap on the whole item
cell* — tap "Torch," it burns a pip. That's shipped, tested, and — more
importantly — it's a **high-frequency action** at the table (torches,
rations, wear tracks tick constantly through a session). Any redesign that
turns "tap to burn" into "tap to select, then tap Burn" adds a tap to the
single most common inventory interaction in the app, which is exactly the
kind of regression Live Session's whole design bar exists to prevent.

So the cell is restructured into two **non-overlapping, always-visible
zones** rather than one big tap target with a hidden second mode:

```
┌─────────────────────────────┬────┐
│  Torch                      │ ⇄  │   <- chargeable: main zone still burns
│  ● ● ● ○ ○ ○                │    │      a charge on tap, unchanged
└─────────────────────────────┴────┘
┌─────────────────────────────┬────┐
│  Iron rations                │ ⇄  │   <- non-chargeable: main zone is
│                              │    │      inert (as today), only the
└─────────────────────────────┴────┘      side zone is interactive
```

- **Left/main zone**: identical behavior to today. Chargeable items burn a
  charge on tap (`onburn`, unchanged); non-chargeable items remain a static
  display (unchanged).
- **Right zone**: a fixed 44px-wide strip, full cell height, visually
  distinct (`border-l`, `bg-[var(--surface-sunk)]` against the main zone's
  `bg-[var(--surface)]`) so it reads as a separate control at a glance, not
  a sub-region of the name you might fat-finger by accident. Icon: lucide
  `ArrowLeftRight`, `Icon` component at `size="prep"` (16px — this is a
  secondary, occasional action, not a primary live-play control, matching
  how the adventure-picker chip's chevron was sized in Phase 12).
- This is a genuine sibling `<button>`, not a nested interactive element
  inside the burn button — avoiding the invalid-HTML/inaccessible
  button-in-a-button shape a corner-overlay icon would have produced.

```svelte
<div class="min-h-19 flex items-stretch rounded-[var(--radius-md)] border border-[var(--border-strong)] overflow-hidden">
  {#if item.maxCharges != null}
    <button type="button" onclick={() => onburn(item.id)} aria-label={chargeCellAria(item)}
      class="flex-1 min-w-0 flex flex-col items-center justify-center gap-1 p-[var(--sp-2)] text-center cursor-pointer bg-[var(--surface)] border-none">
      <span class="text-[length:var(--text-sm)] font-bold leading-tight truncate w-full">{item.name}</span>
      {@render chargeDots(item)}
    </button>
  {:else}
    <div class="flex-1 min-w-0 flex items-center justify-center p-[var(--sp-2)] text-center bg-[var(--surface)]">
      <span class="text-[length:var(--text-sm)] font-bold leading-tight truncate w-full">{item.name}</span>
    </div>
  {/if}
  <button type="button" onclick={() => onrequestmove(item.id)}
    aria-label={$_('inventory.moveAria', { values: { name: item.name } })}
    class="w-11 min-w-[var(--tap)] shrink-0 flex items-center justify-center border-l border-[var(--border)] bg-[var(--surface-sunk)] text-[var(--accent)] cursor-pointer">
    <Icon icon={ArrowLeftRight} />
  </button>
</div>
```

Empty cells (`{@render empty()}`) are unchanged — nothing to move from a
slot with no item.

### Recipient picker — inline within the same modal, not a new screen

Tapping the ⇄ strip doesn't open a second `Modal` (stacking modals is
disorienting and the brief is explicit: "not a new full-screen flow"). It
swaps the modal's body content in place, the same way `endSessionOpen`
swaps `LiveSession`'s whole view for `SessionRecapReview` — a full replace
of the visible content, same container, no double-chrome:

```
┌─ INVENTORY · Wren ──────────────────────────── × ─┐
│ Move Torch to:                          ← Back    │
│                                                    │
│  ┌──────────────────────────────────────────┐    │
│  │ Pip                              6/10     │    │
│  └──────────────────────────────────────────┘    │
│  ┌──────────────────────────────────────────┐    │
│  │ Sables (hireling)          9/10 ⚠ full    │    │
│  └──────────────────────────────────────────┘    │
│                                                    │
│  (only Wren's other active party + hirelings      │
│   are listed — never the sender)                  │
└────────────────────────────────────────────────────┘
```

- Title switches from the modal's normal `name` (`"Wren"`) to a
  `"Move {itemName} to:"` instruction — the one thing the GM needs to read
  on this screen, kept to a single short line.
- A `← Back` control (not a new "×") returns to the item grid without
  completing a move — tapping the ⇄ strip is cheap to back out of.
- List: every other **active** party member and hireling (never the
  sender, never a fallen/deceased entry — matching `activeParty`/
  `activeHirelings`' existing filters used everywhere else in
  `LiveSession.svelte`). Hirelings get a small `(hireling)` qualifier or
  `Tag` so a same-named mix-up can't happen — mirroring how
  `SaveDock`/roster surfaces already distinguish role via a `Tag`.
- Each row is a full-width `<button>`, `min-h-[var(--tap)]`, showing name +
  a slot-usage count (`usedSlots(recipient.items)/MAX_SLOTS`) — the GM's
  actual question before tapping is "does this mouse have room," so that
  number is front and center, not hidden behind a second tap.
- **Tapping a row executes the move immediately** — no second confirm step,
  matching the adventure-picker precedent ("switching is cheap and
  reversible... it doesn't need one"). A move is undoable the same way
  everything else in Live Session is (see below), so a confirm dialog would
  be pure friction for a reversible action.

### Slot-cap handling — warn, never block

Per the existing rule in `lib/items.ts` (`isOverCapacity` is "purely
informational... nothing... should ever use this to block adding an
item" — Phase 8's overburdened banner is a warning, not a gate), the move
**must not** be blocked by the 10-slot cap. A GM handing off the party's one
torch mid-fight because someone's hands are free doesn't deserve to be told
"no" by the app; Mausritter's own answer to over-capacity is narrative
(you're overburdened, not "the bag physically won't close").

So: any row where `usedSlots(recipient.items) + item.slots > MAX_SLOTS`
still works exactly the same on tap — it just carries a visible warning
first, using the exact same non-blocking-warning visual language as
`ItemSlotGrid`'s overburdened banner (`warning` tone, not `danger` — this
isn't an error):

```svelte
<button type="button" onclick={() => onmove(item.id, recipient.id)}
  class="min-h-[var(--tap)] w-full flex items-center justify-between gap-2 px-[var(--sp-3)] py-2 rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface)] cursor-pointer">
  <span class="flex items-center gap-2">
    <span class="font-bold text-[length:var(--text-body)]">{recipient.name}</span>
    {#if recipient.kind === 'hireling'}<Tag size="sm">{$_('liveSession.hirelingTag')}</Tag>{/if}
  </span>
  <span class="ww-num text-[length:var(--text-sm)]" class:text-[var(--warning)]={wouldOverburden}>
    {usedSlots(recipient.items)}/{MAX_SLOTS}
    {#if wouldOverburden}<span class="ww-label ml-1">{$_('inventory.willOverburden')}</span>{/if}
  </span>
</button>
```

No row is ever disabled or grayed out — every recipient is always tappable,
warning or not, per the "never blocks" rule.

### Executing the move + undo

`LiveSession.svelte` needs one new function, symmetric with how damage/heal
already snapshot-and-restore across the party/hireling split:

```ts
type Owner = { source: Source; id: string };

function moveItem(from: Owner, itemId: string, to: Owner) {
  const fromMember = memberOf(from.source, from.id);
  const toMember = memberOf(to.source, to.id);
  if (!fromMember || !toMember) return;
  const item = fromMember.items.find((i) => i.id === itemId);
  if (!item) return;

  const beforeFrom = fromMember.items;
  const beforeTo = toMember.items;

  const updateOwner = (owner: Source, id: string, items: Item[]) =>
    owner === 'party' ? updateMember(id, { items }) : updateHireling(id, { items });

  updateOwner(from.source, from.id, beforeFrom.filter((i) => i.id !== itemId));
  updateOwner(to.source, to.id, [...beforeTo, item]);

  announce(
    'item:' + itemId,
    $_('liveSession.itemMoved', { values: { item: item.name, to: toMember.name } }),
    () => {
      updateOwner(from.source, from.id, beforeFrom);
      updateOwner(to.source, to.id, beforeTo);
    },
  );
  movePickerFor = null; // closes the recipient sub-view, back to the grid
}
```

This is a genuine move (spliced out of one array, pushed into the other),
never a copy, and it's undoable with the same "snapshot both sides, restore
both sides" shape `handleDamage`/`handleHeal` already use across the
party/hireling boundary — no new undo mechanism needed. After a successful
move, the picker closes and the modal returns to the (now-updated) item
grid for the sender, so the GM sees the slot freed up immediately.

### State additions

```ts
// LiveSession.svelte
let movePickerFor = $state<string | null>(null); // the item id currently being moved, or null

// LiveSessionInventoryModal.svelte — new props
interface Props {
  // ...existing props unchanged...
  recipients: { id: string; name: string; kind: 'party' | 'hireling'; items: Item[] }[];
  movingItemId: string | null;
  onrequestmove: (itemId: string) => void;
  onmove: (itemId: string, recipientId: string) => void;
  oncancelmove: () => void;
}
```

`recipients` is computed in `LiveSession.svelte` from `activeParty` +
`activeHirelings`, filtered to exclude whichever member currently owns the
open modal — the modal itself stays presentational and doesn't reach back
into the party/hireling stores directly, matching its existing "screens own
data-loading" boundary from `CLAUDE.md`.

### Responsiveness

- Phone (≤480px): the item grid is already 2 columns
  (`grid-cols-2`); each cell grows slightly taller to fit the new 44px-wide
  side strip without cramping the name/charge-dots text, but stays within
  the same `min-h-19` baseline (the strip is a width addition, not a height
  one). The recipient picker is a single-column list full-width, same as
  the item grid's parent container, no horizontal scrolling ever.
- Tablet/desktop: same layout; the modal's fixed `width={520}` (per `Modal`)
  gives more breathing room but nothing here needs a breakpoint branch.

### Accessibility checklist

- The ⇄ strip has its own `aria-label` ("Move Torch") distinct from the
  burn button's ("Burn a charge on Torch, 3 of 6 remaining") — a screen
  reader user landing on either button hears which action it performs
  without needing surrounding visual context.
- Recipient rows are real `<button>`s, `min-h-[var(--tap)]`, so they get
  focus/Enter/Space for free, consistent with every other list-of-choices
  pattern already in the app (the Phase 12 adventure-picker rows, Pay Day's
  hireling rows).
- The overburden warning is never color-only — it always pairs the
  `--warning` tint with the literal text "will be overburdened," matching
  `ItemSlotGrid`'s existing banner copy pattern.
- `← Back` is a real button with a clear label, not an icon-only control —
  this is a rare-enough action (backing out of a move) that spelling it out
  costs nothing and removes any ambiguity with the modal's own "×" close.

---

## i18n keys (add to `en.json` / `de.json`)

```json
"liveSession": {
  "encounter": {
    "defeated": "Defeated",
    "remove": "Remove",
    "removed": "{label} removed",
    "removeAria": "Remove {label}",
    "addAnother": "+ Add another {name}",
    "fightOverTip": "Fight's over. Tap a mouse's Bag to hand off any loot."
  },
  "itemMoved": "{item} moved to {to}"
},
"inventory": {
  "move": "Move",
  "moveAria": "Move {name}",
  "moveTo": "Move {item} to:",
  "back": "Back",
  "willOverburden": "will be overburdened"
}
```

## Explicitly out of scope for Phase 13

- **Auto-generated loot** — nothing here rolls or suggests items when a
  monster is removed. The Item generator already exists in Generators for
  that; wiring it into the encounter tracker would be a real feature but a
  different, larger one (it needs a UI for "what did this creature drop,"
  which isn't asked for here).
- **Copy instead of move, or moving to a non-active/deceased member** — a
  move only ever debits the sender and credits an active recipient; there is
  no "give a copy" action and no way to hand something to a fallen mouse.
- **Blocking a move or a re-quantified split of stacked items** — Mausritter
  items aren't stackable quantities in this data model (`Item` is one
  object per physical item), so "move 3 of my 5 rations" isn't a case that
  exists; each `Item` moves as a whole unit.
- **Persisting `EncounterInstance`s across a refresh** — same rule as
  `encounterResult`/`reactionResult` today: a live-combat tracker is
  scoped to the current sitting, not campaign state.
- **Changing `liveSessionLog`/`SessionRecapReview` to mention monster
  kills** — deliberately left to GM prose in the recap, per the reasoning
  above; if this turns out to be wanted later, it's a small, separable
  follow-up, not a reason to hold up either must-have here.

## Files a frontend engineer will touch

- `src/components/screens/LiveSession.svelte` — `encounterInstances` state
  and its mutators (`spawnInstance`, `addAnotherInstance`, `damageInstance`,
  `healInstance`, `removeInstance`), extending `openDrawer` to cover
  instance ids, `movePickerFor` state and `moveItem`, `recipients` derived
  list, threading new props to `LiveSessionEncounterCard` and
  `LiveSessionInventoryModal`.
- `src/components/screens/LiveSessionEncounterCard.svelte` — renders the
  instance list + "+ Add another" chip + the post-fight tip, in addition to
  its existing roll/stat-block/reaction content.
- `src/components/screens/LiveSessionEncounterInstance.svelte` (new) — one
  instance row: label, `HpBar`, Hurt/Remove buttons, embeds
  `HurtHealDrawer`.
- `src/components/ui/HurtHealDrawer.svelte` (new, extracted) — the
  chip-grid + mode-toggle + custom-`Stepper` block, pulled out of
  `LiveSessionCard.svelte` so both it and
  `LiveSessionEncounterInstance.svelte` share one implementation.
  `LiveSessionCard.svelte` updates to use it (behavior-identical, this is a
  pure extraction).
- `src/components/screens/LiveSessionInventoryModal.svelte` — the two-zone
  cell markup, the recipient-picker sub-view, new props listed above.
- `src/lib/i18n/en.json` / `de.json` — the keys above.
- Tests: `LiveSessionEncounterCard.test.ts` (new instance-list cases),
  `LiveSessionEncounterInstance.test.ts` (new),
  `HurtHealDrawer.test.ts` (new — extracted logic deserves its own direct
  coverage rather than only being exercised indirectly),
  `LiveSessionInventoryModal.test.ts` (move flow, overburden warning
  rendering, back navigation), `LiveSessionCard.test.ts` (confirm
  behavior-identical after the `HurtHealDrawer` extraction), plus two new
  Playwright/Cucumber scenarios: `features/encounter-hp-tracker.feature`
  ("Given the GM rolls an encounter, When they add two more and hurt one to
  0, Then it shows Defeated and Remove clears it") and
  `features/item-handoff.feature` ("Given Wren carries a torch, When the GM
  moves it to Pip, Then Pip's bag shows the torch and Wren's is empty; Given
  the recipient is already at 10/10, When the GM moves an item to them
  anyway, Then the move succeeds with an overburdened warning shown before
  the tap").
