# Story Mode Proposal — "Everything Has Its Place"

**Status:** Design proposal, not yet implemented
**Scope:** Ambient background lore layered on top of the existing Island → Campus → CS Block → Dorm hierarchy
**Depends on:** Existing Passport/Landmark system (`PRD.md` §6.1), existing `Island.jsx` hotspot pattern
**Tone:** YA gothic-mystery. Grief, obsession, and disappearance are on the table thematically — nothing graphic, nothing requiring a content warning beyond "this is a little sad and a little eerie on purpose." Suitable for the existing student audience; written to feel like the campus ghost story everyone half-believes, not a horror set piece.

---

## 1. How it works (mechanics recap)

- **No forced quests.** Locations are optional hotspots on the Island map, same pattern as the existing University hotspot in `Island.jsx`. Nothing here gates a lesson, and nothing requires the student to "go do a task."
- **Passport Badges.** Each location gets one badge, earned on first visit, ever — living in a new "Field Badges" section of the Passport, kept visually distinct from the wax-crest landmark seals (those stay reserved for "finished a unit's lessons," this is just "found this place").
- **Journal.** A new panel (tab inside Passport, or its own icon). Every time a student visits a location, if there's a beat they haven't seen yet and they've completed enough units to unlock it, a new dated entry is appended. Entries are short, self-contained, and never re-locked or penalized if missed — a student who only ever visits three of the seven locations just has a thinner journal, not a broken one.
- **Trigger:** beats are gated on **units completed** (0 through 6), which the app already tracks. This paces the whole story across a semester automatically, with no new scheduling system needed.
- **Decoupled from lesson content**, same rule as the cousins (`GAMMA_COUSINS.md` §3, rule 5): a student who never explores the island loses nothing functional. This is pure texture for the students who like poking around.

Suggested data shape (mirrors the existing `landmarks` array pattern in `src/data/units/*.json`):

```json
{
  "id": "ruins",
  "name": "The Ruins",
  "hotspot": { "x": 34, "y": 46, "width": 12, "height": 16 },
  "beats": [
    { "id": "ruins-01", "unlocksAtUnit": 0, "title": "Shelving, Not a House", "body": "..." },
    { "id": "ruins-02", "unlocksAtUnit": 2, "title": "The Directory", "body": "..." }
  ]
}
```

A new `storyStore.js` (visited locations + seen beat ids) should stay fully separate from `progressStore` — same separation-of-concerns the PRD already uses for Passport vs. cousin state.

---

## 2. The plot

**Working order name:** the Cartographers.

Long before the current University existed, the island hosted a private research collective who believed — with the specific, quiet intensity of people who've decided something and stopped questioning it — that if a system of knowledge was organized *precisely enough*, nothing kept in it could ever really be lost. Not facts. Not people. They built a single, physical structure to hold everything: shelving, chains, towers, tunnels, every part cross-referenced to every other part, expanding for years.

It wasn't only books. Partway through the project, the Cartographers' own founder — referred to in what survives only as **"the First Archivist"** — began entering personal effects belonging to colleagues who'd died during the build. Journals. Letters. A pocket watch. The official story, such as it is, calls this "sentimental cataloguing." What's actually written in the surviving fragments is closer to a belief that the structure could hold *them*, not just their belongings — that grief was a filing problem, if you were disciplined enough about it.

Nobody agrees on exactly what happened next — a storm, a fire, or (the version the old dockhands prefer) the structure simply got too large and too interconnected to keep standing under its own logic, and came down in a single night. Some of the Cartographers are recorded as having left the island afterward. Some aren't recorded as having done anything at all — no departure, no burial, nothing, which on a small island is its own kind of statement. The First Archivist isn't mentioned again by name anywhere on record.

The University was built nearby, years later, by people who mostly didn't ask. It's a functioning, sunny, completely normal campus. The **Ruins are what's left of the Archive**. The **three lighthouses were never spaced for shipping lanes** — a student who visits all three over the semester can work out, unprompted, that they triangulate exactly onto the Ruins, like they were built to watch it rather than warn ships away from it. Something about **the harvest, the tides, and the ridge shrine's offerings** still runs on a rhythm nobody currently on staff set up and nobody's willing to just stop doing.

**This is intentionally never resolved.** No jump scare, no final reveal cutscene, no "and then everyone died" — it's the campus urban legend that turns out to have more supporting evidence than legends usually do, and it stays that way. The existing flavor line in `Island.jsx` — *"Gothic spires up on the cliff. Everything else down here pretends that's normal"* — already sets this tone; this proposal just gives it seven places to live.

---

## 3. Characters

- **The Gamma Cousins stay exactly what they are** — subject tutors, never narrators of this plot. Per `GAMMA_COUSINS.md` §3 rule 5, nothing here should ever change what a cousin says about a lesson, and no cousin should ever explain or reference the plot directly (breaking rule 1 — a joke that requires already knowing the lore isn't a joke, it's homework).
- **Optional, light touch only:** if a cousin is the student's active advisor at the moment a journal entry unlocks, she can get one extra aside line underneath it in her voice — pure flavor, never required to understand the entry, easy to skip in v1.
- **One cousin gets a slightly closer thread, if you want it: Miyu.** Her established teaching quirk is origami/calligraphy — folding, precision, repeated structure — which happens to rhyme with "an order obsessed with organizing everything correctly." A surviving fragment at the Ruins (see §4.1) has a partial name ending in "...ren" scratched into stone. Miyu's own family name is never stated in `GAMMA_COUSINS.md`, so this is a deliberately unconfirmable coincidence — the game never says she's related to the First Archivist, and she never brings it up. It's there for the players who go looking, not a plot point anyone is required to notice.
- **The First Archivist** is the only named (partially named) figure from the old order, and is never seen — only referenced in fragments, logbooks, and carvings across all seven locations. Keep her a rumor, not a character with lines. That's what makes her land.
- **No other new named NPCs are needed.** Dockhands, the grounds crew, "an elder in the village," "whoever's leaving flowers" — these stay anonymous, background-mentioned voices, which keeps the mystery diffuse (it's the island's memory, not one person's story) and keeps the authoring load small.

---

## 4. Locations

Seven hotspots total, in addition to the existing University. All badge names/icons below are placeholders — reskin freely.

### 4.1 The Ruins (west-central)
The collapsed Archive itself. The physical center of the whole plot.

**Badge:** *Trespasser (Technically)* — ivy-wrapped archway icon.

| Unlocks at | Title | Entry |
|---|---|---|
| 0 | Shelving, Not a House | What's left isn't a house or a hall — it's shelving, room after room of it, stone rows still standing in some places, collapsed into rubble in others. Even the rubble looks like it fell in a pattern. |
| 2 | The Directory | A surviving wall has a carved directory of some kind — location names and numbers, clearly a system, completely undecipherable now. One line has been scratched out hard enough to gouge the stone. |
| 4 | Four Doors, All Shut | A chamber deep in that must once have connected to at least four other rooms — archways in every wall — and every archway is bricked shut from this side, not the other. |
| 6 | Someone's Been Digging | A patch of rubble has been cleared recently. Tool marks, a stacked pile of stones set aside deliberately. Grounds crew swears it isn't them. Nobody's filed a report either way. |

### 4.2 The Landing (dock city, SW harbor)
The loud, ordinary, everyday location — the counterweight to everywhere else. This is where gossip about the other six places actually circulates.

**Badge:** *Salt Air* — anchor icon.

| Unlocks at | Title | Entry |
|---|---|---|
| 0 | An Address That Isn't There | A crate on the pier has a delivery address stamped on it that doesn't match anywhere on the current island map. The shipping company says it's a printing error. It's been a printing error for as long as anyone remembers. |
| 2 | The Quiet Pier | Dockhands have a superstition about not whistling near the third pier from the east. Nobody working there now can say why — it's just what you do, the way you don't walk under a ladder. |
| 4 | A Column for Something Else | An old harbormaster's ledger, mostly cargo tallies, has one column labeled with a word that isn't a cargo type. It's never filled in past the first few pages. |
| 6 | Directions to a Building That Isn't There | A new arrival this week asked directions to a building by a name nobody's used in living memory — and one of the oldest dockhands, without thinking about it, pointed the right way anyway. |

### 4.3 Windmill Row (coastal farming village, east)
Quiet fields and a working windmill — deliberately the calmest location on the island, until it isn't.

**Badge:** *Field Notes* — wheat-stalk icon.

| Unlocks at | Title | Entry |
|---|---|---|
| 0 | Turning Anyway | The windmill turns steadily even on days with no wind worth mentioning. Locals call it "just how it's built." Nobody's opened it up to check in decades. |
| 2 | Too Precise for the Land | The crop rows here are laid out in a grid too exact for the actual slope of the land — like the fields were planned before anyone looked at the ground they'd be planted on. |
| 4 | The Private Shrine | One of the older villagers keeps a small, private shrine behind her house — not for any holiday anyone recognizes, dedicated to "whoever kept the lights." She won't say more than that. |
| 6 | The Cancelled Festival | This year's harvest festival was quietly called off, no explanation given, no date rescheduled. Everyone seems relieved rather than disappointed, which is its own kind of answer. |

### 4.4 North Light
One of three lighthouses — see §4.7 for the combined arc.

**Badge:** *Kept the Light (North)* — beam icon.

| Unlocks at | Title | Entry |
|---|---|---|
| 0 | No Keeper on the Roster | The light works — bulb changed, glass clean — but no one on the current campus staff list is assigned to it, and nobody's claiming the job. |
| 3 | The Logbook | A logbook by the door has entries going back further than anyone currently enrolled. One page lists ships turned back "before the collapse" — not shipwrecks avoided. Ships turned away from something. |
| 6 | Longer Than It Needs To | The most recent entry, dated this week, just notes that the light's been staying on a little longer than it needs to lately. It doesn't sound worried. It sounds like an old habit being kept up. |

### 4.5 South Light
Second of three. See §4.7.

**Badge:** *Kept the Light (South)* — beam icon, different tint.

| Unlocks at | Title | Entry |
|---|---|---|
| 0 | The Other Tower | Smaller than North Light, and better hidden — you'd walk past the path to it twice before noticing. Its lamp is lit anyway. |
| 3 | A Different Hand | This logbook's handwriting changes partway through — a second author, decades later, with the same obsessive habit of logging everything down to the minute. They never sign a full name. Only initials. |
| 6 | The Initials Again | The same initials from South Light's logbook turn up, once, carved small into a beam at the Ruins (see §4.1) — easy to miss, in exactly the spot where a fourth archway would have opened onto open air. |

### 4.6 Harbor Light
Third of three, closest to the Landing. See §4.7.

**Badge:** *Kept the Light (Harbor)* — beam icon, third tint.

| Unlocks at | Title | Entry |
|---|---|---|
| 0 | Everyone Assumes It's Decorative | Close enough to the Landing's noise and lights that most people assume Harbor Light is purely ornamental at this point. It isn't. It's on a working schedule, same as the other two. |
| 3 | Not Built for Ships | A faded builder's plaque gives a construction date that lines up, almost exactly, with the Archive's collapse — not before it, as a warning system would be, but after. |
| 6 | The Triangle | *(Unlocks automatically once a student has seen the Unit-6 beat at all three lighthouses.)* Lay the three towers out on any map of the island and they don't point out to sea at all — they point inward, to the same spot. The Ruins sit dead center of the three. |

### 4.7 The Three Lighthouses — how the shared arc works
Design each as its own small hotspot with its own badge and its own logbook flavor, so a student can enjoy any one of them alone. The Unit-6 "Triangle" entry only fires once all three Unit-6 beats have individually been seen — a natural, unforced payoff for students who've been thorough, and something that never needs a popup or a hint arrow pointing at it. If a student never puts it together, that's fine; the individual entries stand alone.

### 4.8 The Ridge Shrine (atop the mountain, apart from the University's own peak)
Small, weatherworn, deliberately unclaimed by any current religious or campus group.

**Badge:** *Left Something Behind* — small carved-stone icon.

| Unlocks at | Title | Entry |
|---|---|---|
| 0 | Practical Offerings | Whatever's left here is never decorative — a coil of rope, a sealed jar, a pair of gloves. Never flowers, never trinkets. Someone's need, not a tribute. |
| 2 | The Scratched Name | A name carved into the base has been scratched out — the same rough, deliberate gouge as the wall at the Ruins. Whether it's the same name is impossible to tell. |
| 4 | Facing the Wrong Way | The shrine faces inland, directly toward the Ruins, not out toward the sea the way every other shrine on this kind of island usually does. |
| 6 | Fresh Flowers | For the first time on record, there are flowers here instead of a practical object — recent, not yet wilted. Nobody on staff will admit to leaving them. |

---

## 5. Keeping this maintainable

- Total content: 7 locations × 3-4 beats each ≈ 27 short entries, each independent, no branching dialogue tree, no state machine beyond "which beats has this student seen." Same authoring effort class as writing a unit's landmark blurbs.
- Because unlocks key off `unitsCompleted` (0-6), the whole arc paces itself across the semester with zero new scheduling logic.
- The only cross-location dependency in the whole system is the Unit-6 Lighthouse Triangle payoff (§4.7) — everything else is fully independent, so you can ship fewer than seven locations for v1 and add the rest later without breaking anything already live.

---

## 6. Suggested next steps

1. Confirm final hotspot placement/coordinates on `island.png` for all seven locations and add matching `<Hotspot>` entries in `Island.jsx`, same pattern as the existing University one.
2. Add `src/data/locations/*.json` following the shape in §1.
3. Add `storyStore.js` (visited locations + seen beat ids), independent of `progressStore`.
4. Add a "Field Badges" section to the Passport panel + a small Journal panel/tab.
5. Decide whether the optional Miyu thread (§3) and the per-cousin aside lines are in scope for v1, or a v1.1 nice-to-have — nothing in §4 depends on them.