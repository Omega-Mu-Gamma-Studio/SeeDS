# Story Mode Proposal — "Field Notes" (working title)

**Status:** Design proposal, not yet implemented
**Scope:** Ambient background lore layered on top of the existing Island → Campus → CS Block → Dorm hierarchy
**Depends on:** Existing Passport/Landmark system (`PRD.md` §6.1), existing `Island.jsx` hotspot pattern

---

## 1. The core idea, restated back to you

- No forced quests. Nothing blocks a lesson, and nothing requires the student to "go do a task."
- The island (outside the University building) becomes a set of a few explorable hotspots — lighthouse, ruins, and whatever else we wire up — the same way `Island.jsx` already has one hotspot for the University.
- Visiting a location doesn't do anything on its own. Visiting a location **while a predefined story beat is active** unlocks:
  - a **Field Badge** in the Passport (separate from the existing landmark seals, which stay tied to lesson completion), and
  - a **Journal entry** — a short piece of lore text, timestamped, kept in a simple chronological log.
- Beats are predefined by us, not randomly generated, and are gated on something we already track — the cleanest hook is **units completed** (0 through 6), since that's a number the app already has and it naturally paces content across a whole semester without needing a new trigger system.
- This is intentionally decoupled from the CS content, the same way the cousins are decoupled from lesson correctness (`GAMMA_COUSINS.md` §3, rule 5) — a student who never explores the island loses zero graded/functional value. It's pure texture for the students who like poking around.

That gives you a light, optional ARG-ish layer instead of a second gameplay system to maintain.

---

## 2. Mechanic details

### 2.1 Field Badges (Passport)

- New section in the Passport panel, next to the landmark seals: "Field Badges."
- One badge per island location, first-visit-during-any-beat unlocks it (not "visit while beat 3 is active only" — the badge is just "you found this place," the journal entry is the thing gated on timing).
- Simple state: `visited: boolean` per location, no seal/wax-crest treatment needed (that visual language stays reserved for landmark completion, so students don't confuse "finished a unit" with "wandered around").

### 2.2 Journal

- New panel (could live as a tab inside the Passport panel, or its own icon next to it — Passport is progress, Journal is story, worth keeping visually distinct even if physically adjacent).
- Each entry: location, title, body (2-4 short paragraphs, diary/found-document tone), and the unit-count at which it unlocked.
- Entries appear in the order discovered, not forced chronological story order — a student who visits the Ruins before the Lighthouse gets the Ruins entry first, and that's fine, because entries are written to stand alone (see §3).
- No re-locking, no penalty for missing one — if a student skips a beat window entirely (didn't visit that location before finishing another unit), just show a slightly later variant or nothing. Nothing about this should feel like a missed collectible.

### 2.3 Suggested data shape (mirrors your existing unit JSON pattern)

```json
{
  "id": "lighthouse",
  "name": "The Lighthouse",
  "hotspot": { "x": 71, "y": 22, "width": 10, "height": 14 },
  "beats": [
    {
      "id": "lighthouse-01",
      "unlocksAtUnit": 0,
      "title": "A Light Nobody Asked For",
      "body": "..."
    },
    {
      "id": "lighthouse-02",
      "unlocksAtUnit": 2,
      "title": "The Logbook",
      "body": "..."
    }
  ]
}
```

- `unlocksAtUnit`: the number of units completed so far. When a student visits the location, show the highest-numbered beat whose `unlocksAtUnit` is `<= unitsCompleted` that they haven't seen yet.
- This is the same authoring shape as `landmarks` in `unit1.json` etc., so it should feel familiar to extend and won't need a new mental model — just a new `src/data/locations/*.json` set and a small `storyService.js` alongside `lessonService.js`.
- Keep it fully separate from `progressStore`/landmark sealing logic. A new `storyStore.js` (visited locations, seen beat ids) is cleaner than bolting onto the existing store — matches the separation-of-concerns the PRD already uses for Passport vs. cousin state.

---

## 3. The background plot

Given the existing flavor line already sitting in `Island.jsx` — *"Gothic spires up on the cliff. Everything else down here pretends that's normal"* — there's clearly already an intended "something's a little off, in a fun way" tone for the island. This proposal leans into that rather than introducing a new tone.

**Premise:** Long before the current University existed, the island hosted a private research collective — call them **the Cartographers** — who tried to build a single, perfect physical structure to store and cross-reference all knowledge on the island: a literal architecture of shelves, chains, towers, and tunnels, built to "hold everything and never lose a thread." It got too big, too interconnected, and it came down — nobody agrees whether it was a storm, a fire, or just its own weight. The University was built nearby afterward, mostly ignoring what was left.

The fun part for your specific game: **the Cartographers' obsession — "everything has its right structure, or it collapses" — is a thin, unforced echo of the actual course content** (stacks, queues, trees, graphs, hashing). Nobody in-world calls it that; it's just flavor text that happens to rhyme with what the player is learning that semester. No character should ever say "this is like a linked list" — that would break rule #1 in `GAMMA_COUSINS.md` §3 (metaphor has to work as flavor first, not as a wink that requires the concept already understood).

This gives you a plot that:
- never needs to resolve (it's an atmosphere, not a mystery-box with a mandatory ending),
- paces naturally across 6 units without forcing sequence,
- and can involve the Gamma Cousins as background color (a cousin idly mentioning the ruins, a stray line in a lesson intro) without ever coupling their dialogue to it.

I'm proposing four non-University locations based on what's visible on the island art (lighthouse, ruined structure, tree line, and a small shoreline/dock area) — rename freely once your hotspots are actually placed; the story beats don't care about the exact label.

---

## 4. Per-location suggestions

### 4.1 The Lighthouse

**Mood:** quiet, a little lonely, oddly well-maintained for something nobody talks about.

- **Badge:** "Kept the Light" — small lighthouse-beam icon.
- **Beat 0 (first visit, any time):** The lighthouse works — bulb changed, glass clean — but there's no keeper on the roster and no one on campus claims the job. A logbook by the door has entries older than anyone currently enrolled.
- **Beat @ Unit 1-2:** A page from the logbook, half-legible, lists ships turned back "before the collapse" — not shipwrecks avoided, ships turned away from something. No further explanation.
- **Beat @ Unit 3-4:** The logbook's handwriting changes partway through — new author, decades later, same obsessive habit of logging *everything*, down to the minute. Whoever it is never signs a name, only initials that don't match any known founder.
- **Beat @ Unit 5-6:** The most recent entry is dated this week. It just says the light's been staying on a little longer than it needs to lately, and that's fine, probably.

### 4.2 The Ruins

**Mood:** overgrown, structurally worrying in a way nobody's condemned it for, weirdly geometric under the vines.

- **Badge:** "Trespasser (Technically)" — small ivy/archway icon.
- **Beat 0:** What's left isn't a house or a hall — it's shelving. Stone shelving, room after room of it, some sections still standing in neat rows, others collapsed into rubble that still, if you squint, looks like it fell in a pattern rather than randomly.
- **Beat @ Unit 1-2:** A surviving wall has a carved directory of some kind — location names and numbers, clearly a system, completely undecipherable now. One line is scratched out hard enough to gouge the stone.
- **Beat @ Unit 3-4:** Deeper in, a chamber that must once have connected to at least four other chambers (archways in every wall) — and every single one of those archways is bricked shut from this side, not the other.
- **Beat @ Unit 5-6:** Someone's cleared a small patch of the rubble recently — tool marks, a stacked pile of stones set aside deliberately, no sign of who or why. Campus grounds crew says it isn't them.

### 4.3 The Grove / Treeline

**Mood:** peaceful on the surface, the kind of quiet that makes you notice how quiet it is.

- **Badge:** "Off the Path" — small leaf/root icon.
- **Beat 0:** The trees here grow in unnervingly straight lines in places — like something was planted on purpose long before it was ever a forest, and the forest just grew up around the plan.
- **Beat @ Unit 1-2:** Roots have pushed up small chunks of worked stone in a few places — foundations, maybe, or markers. Nobody's ever bothered to map which.
- **Beat @ Unit 3-4:** A clearing near the center has a ring of stones too evenly spaced to be natural, and grass that won't grow inside the ring no matter the season.
- **Beat @ Unit 5-6:** One of the straight-line tree rows leads, if you follow it far enough, directly toward the Ruins — in a perfectly straight shot, like it was aimed.

### 4.4 The Cove / Dock

**Mood:** the most "normal" location — everyday, sunlit, a little contrast to the others.

- **Badge:** "Salt Air" — small anchor/wave icon.
- **Beat 0:** Half a boat is bolted, permanently and pointlessly, to the end of the dock as some kind of decoration — nobody currently on staff remembers ordering that or why only half a boat.
- **Beat @ Unit 1-2:** At low tide, a line of old pilings is visible a good distance offshore — a second dock, once, further out than anyone builds now, like the shoreline used to be somewhere else entirely.
- **Beat @ Unit 3-4:** A weathered plaque, mostly sun-bleached blank, still has enough of a shape left to tell it was never actually about ships — dedication plaques for people don't usually have this shape.
- **Beat @ Unit 5-6:** Local fishing boats give one specific patch of water past the old pilings a wide, casual berth — not fear, just habit, "that's just what you do," nobody remembers being taught to do it.

---

## 5. Keeping it PG-16 and low-effort to maintain

- Nothing here is graphic — it's "atmospheric unresolved mystery," the tone of a place with more history than anyone's bothered to explain, not horror. Comfortable to leave permanently unresolved.
- Total content ask: 4 locations × 4 beats × a few short paragraphs = 16 short entries, each independent, no branching dialogue tree, no state machine beyond "which beats has this student seen." Very authorable alongside your existing lesson-JSON workflow.
- Because beats key off `unitsCompleted` (0-6), the whole thing paces itself across the semester automatically — no separate calendar/scheduling system needed.
- Easy later extension if you want it: swap in a cousin-specific one-liner under an entry based on the currently active advisor (e.g., Florence gets a dry aside, Simi gets an amused one) — purely optional flavor, same rule as everywhere else: never required to understand the entry.

---

## 6. Suggested next steps

1. Finalize actual hotspot count/placement on `island.png` (confirm these four, or however many you actually want) and add matching `<Hotspot>` entries in `Island.jsx`, same pattern as the existing University one.
2. Add `src/data/locations/*.json` following the shape in §2.3.
3. Add `storyStore.js` (visited locations + seen beat ids), independent of `progressStore`.
4. Add "Field Badges" section to the Passport panel + a small Journal panel/tab.
5. Write the actual entry copy (drafts above are usable as-is or as a starting point — adjust to match whatever the art actually shows once hotspots are placed).