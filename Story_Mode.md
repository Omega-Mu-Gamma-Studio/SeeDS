# Story Mode Proposal — "Everything Has Its Place"

**Status:** Implemented — all 7 locations, all 9 NPCs, Field Badges, Journal, and the Tiny Choice system are live. This doc remains the authoritative source for plot, character bios, and per-beat scripts.
**Scope:** Ambient background lore layered on top of the existing Island → Campus → CS Block → Dorm hierarchy
**Depends on:** Existing Passport/Landmark system (`PRD.md` §6.1), existing `Island.jsx` hotspot pattern
**Tone:** YA gothic-mystery with warmth. Grief, obsession, and disappearance are on the table thematically — nothing graphic, nothing requiring a content warning beyond "this is a little sad and a little eerie on purpose." Suitable for the existing student audience; written to feel like the campus ghost story everyone half-believes, not a horror set piece.

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

## 2. The Plot

Working order name: **the Cartographers**.

Long before the current University existed, the island hosted a private research collective who believed — with the specific, quiet intensity of people who've decided something and stopped questioning it — that if a system of knowledge was organized precisely enough, nothing kept in it could ever really be lost. Not facts. Not people. They built a single, physical structure to hold everything: shelving, chains, towers, tunnels, every part cross-referenced to every other part, expanding for years.

It wasn't only books. Partway through the project, the Cartographers' own founder — referred to in what survives only as "the First Archivist" — began entering personal effects belonging to colleagues who'd died during the build. Journals. Letters. A pocket watch. The official story, such as it is, calls this "sentimental cataloguing." What's actually written in the surviving fragments is closer to a belief that the structure could hold *them*, not just their belongings — that grief was a filing problem, if you were disciplined enough about it.

Nobody agrees on exactly what happened next — a storm, a fire, or (the version the old dockhands prefer) the structure simply got too large and too interconnected to keep standing under its own logic, and came down in a single night. Some of the Cartographers are recorded as having left the island afterward. Some aren't recorded as having done anything at all — no departure, no burial, nothing, which on a small island is its own kind of statement. The First Archivist isn't mentioned again by name anywhere on record.

The University was built nearby, years later, by people who mostly didn't ask. It's a functioning, sunny, completely normal campus. The Ruins are what's left of the Archive. The three lighthouses were never spaced for shipping lanes — a student who visits all three over the semester can work out, unprompted, that they triangulate exactly onto the Ruins, like they were built to watch it rather than warn ships away from it. Something about the harvest, the tides, and the ridge shrine's offerings still runs on a rhythm nobody currently on staff set up and nobody's willing to just stop doing.

This is intentionally never resolved. No jump scare, no final reveal cutscene, no "and then everyone died" — it's the campus urban legend that turns out to have more supporting evidence than legends usually do, and it stays that way. The existing flavor line in `Island.jsx` — "Gothic spires up on the cliff. Everything else down here pretends that's normal" — already sets this tone; this proposal just gives it seven places to live.

---

## 3. Characters

### 3.1 The Gamma Cousins (Non-Romanceable)

The Gamma Cousins stay exactly what they are — subject tutors, never narrators of this plot. Per `GAMMA_COUSINS.md` §3 rule 5, nothing here should ever change what a cousin says about a lesson, and no cousin should ever explain or reference the plot directly (breaking rule 1 — a joke that requires already knowing the lore isn't a joke, it's homework).

Optional, light touch only: if a cousin is the student's active advisor at the moment a journal entry unlocks, she can get one extra aside line underneath it in her voice — pure flavor, never required to understand the entry, easy to skip in v1.

One cousin gets a slightly closer thread, if you want it: **Miyu**. Her established teaching quirk is origami/calligraphy — folding, precision, repeated structure — which happens to rhyme with "an order obsessed with organizing everything correctly." A surviving fragment at the Ruins (see §4.1) has a partial name ending in "...ren" scratched into stone. Miyu's own family name is never stated in `GAMMA_COUSINS.md`, so this is a deliberately unconfirmable coincidence — the game never says she's related to the First Archivist, and she never brings it up. It's there for the players who go looking, not a plot point anyone is required to notice.

### 3.2 The Islanders (Romanceable — 6 Total, 3 Men, 3 Women)

These are students and young islanders (18–22) who live and work across the island. They're age-appropriate peers for the player, and their arcs are about connection, vulnerability, and growth — not quests. No heart meters, no grinding. Each has a single "Tiny Choice" moment at the end of their story where the player can decide to pursue romance or remain friends.

| NPC | Age | Location | Vibe | Arc Summary |
|---|---|---|---|---|
| Lena (F) | 20 | The Ruins | Intense, curious, reckless | Archaeology student obsessed with the island's pre-university history. She learns to trust someone with her obsession. |
| Kai (M) | 21 | The Landing | Easygoing, warm, secretly poetic | Fisherman's apprentice and marine biology student. Slow-burn friendship that turns into quiet seaside moments. |
| Tommy (M) | 19 | Windmill Row | Gruff exterior, soft heart | Margit's grandson, helps on the farm, hates the university. Opens up about family guilt. |
| Yuki (F) | 20 | North Light | Quiet, observant, secretive | Lighthouse keeper's assistant, on a gap year. Earn her trust by respecting her silence. |
| Silas (M) | 21 | Harbor Light | Playful, clever, anxious | Engineering student, works part-time maintaining the lighthouse. Humor masks deep anxiety. |
| Elena (F) | 22 | South Light | Melancholic, romantic, grieving | Sister of the original lighthouse keeper who died. Shared grief turns into connection. |

**The Tiny Choice System:**

Throughout the layers, each NPC's dialogue is friendly but ambiguous — you're building a beautiful friendship. At the end of their Layer 3 scene, the player gets two dialogue options:

- **Option A (Friendship):** "I'm glad you trusted me. That's what friends are for." → The NPC smiles warmly. The relationship stays platonic and deep.
- **Option B (Romance):** "I feel like I've known you forever. I don't want this to just be friendship." → The NPC blushes. A quiet, chaste moment (holding hands, a soft smile, a promise to see where it goes).

**Consequences:**

- If you choose Romance with one NPC, the others don't get jealous — their dialogue shifts to warm friendship.
- If you choose Friendship with everyone, the final scene at the Ridge Shrine has all 6 NPCs standing with you as found family.

### 3.3 Non-Romanceable but Important

| NPC | Age | Location | Role |
|---|---|---|---|
| Ezra | 60s | The Landing | Kai's grandfather, retired fisherman. Passes down wisdom and old stories. |
| Margit | 50s | Windmill Row | Tommy's grandmother, farmer. Her arc is about grief, forgiveness, and family secrets. |
| The Woman in White | Ageless | The Ridge Shrine | Mystical guardian of the shrine's truth. Not human — a manifestation of the island's memory. |

The First Archivist is the only named (partially named) figure from the old order, and is never seen — only referenced in fragments, logbooks, and carvings across all seven locations. Keep her a rumor, not a character with lines. That's what makes her land.

---

## 4. Locations

Seven hotspots total, in addition to the existing University. All badge names/icons below are placeholders — reskin freely.

### 4.1 The Ruins (west-central)

The collapsed Archive itself. The physical center of the whole plot.

**Associated NPC:** Lena (romanceable)
**Badge:** Trespasser (Technically) — ivy-wrapped archway icon.

| Unlocks at | Title | Entry |
|---|---|---|
| 0 | Shelving, Not a House | What's left isn't a house or a hall — it's shelving, room after room of it, stone rows still standing in some places, collapsed into rubble in others. Even the rubble looks like it fell in a pattern. |
| 2 | The Directory | A surviving wall has a carved directory of some kind — location names and numbers, clearly a system, completely undecipherable now. One line has been scratched out hard enough to gouge the stone. |
| 4 | Four Doors, All Shut | A chamber deep in that must once have connected to at least four other rooms — archways in every wall — and every archway is bricked shut from this side, not the other. |
| 6 | Someone's Been Digging | A patch of rubble has been cleared recently. Tool marks, a stacked pile of stones set aside deliberately. Grounds crew swears it isn't them. Nobody's filed a report either way. |

**NPC Dialogue Beats:**

| Layer | Beat |
|---|---|
| 1 | Lena is crouched by a collapsed archway, brushing dirt off a stone. "Oh! You're not a professor, are you? Thank god. They'd yell at me for being here. I'm trying to figure out what this place actually was—before the university." |
| 2 | Lena has a theory. She spreads out sketches: "Look—the layout of the ruins matches the street plan of something a lot more organized than a farm. But the university records just call it 'prior land use, unspecified.' Nobody writes it that vague by accident." |
| 3 | Lena finds a data slate, mostly corroded, one line still legible. "It's a note-to-self. Not even signed. Just: 'catalogued everything except what mattered.'" She sits back. "I don't think anyone buried anything, exactly. I think somebody just... stopped being able to finish. And nobody after them wanted to pick it back up." (Tiny Choice moment here.) |

**Badge Unlock:** "The Ruin's Secret"

### 4.2 The Landing (dock city, SW harbor)

The loud, ordinary, everyday location — the counterweight to everywhere else. This is where gossip about the other six places actually circulates.

**Associated NPC:** Kai (romanceable)
**Badge:** Salt Air — anchor icon.

| Unlocks at | Title | Entry |
|---|---|---|
| 0 | An Address That Isn't There | A crate on the pier has a delivery address stamped on it that doesn't match anywhere on the current island map. The shipping company says it's a printing error. It's been a printing error for as long as anyone remembers. |
| 2 | The Quiet Pier | Dockhands have a superstition about not whistling near the third pier from the east. Nobody working there now can say why — it's just what you do, the way you don't walk under a ladder. |
| 4 | A Column for Something Else | An old harbormaster's ledger, mostly cargo tallies, has one column labeled with a word that isn't a cargo type. It's never filled in past the first few pages. |
| 6 | Directions to a Building That Isn't There | A new arrival this week asked directions to a building by a name nobody's used in living memory — and one of the oldest dockhands, without thinking about it, pointed the right way anyway. |

**NPC Dialogue Beats:**

| Layer | Beat |
|---|---|
| 1 | Kai is untangling a net, whistling. "New face! You look lost. Or just curious. Both are good." He offers you dried fish. "I'm Kai. I work here, study marine bio, and occasionally fall into the water. Want a tour?" |
| 2 | Kai is staring at the water. "My grandfather—Ezra—he used to tell me stories about the island. About a 'hum' in the water. I thought it was just old man talk. But lately... I've been hearing it too." |
| 3 | Kai takes you to a hidden tide pool at low tide — old stonework just visible under the water. "I used to think it was just current against the rocks. Now I'm not so sure it's nothing." He shrugs, half-embarrassed. "Grandpa's never once told it the same way twice. Maybe that's the actual answer — some things you just keep telling, instead of solving." (Tiny Choice moment here.) |

**Badge Unlock:** "The Hum's Keeper"

### 4.3 Windmill Row (coastal farming village, east)

Quiet fields and a working windmill — deliberately the calmest location on the island, until it isn't.

**Associated NPC:** Tommy (romanceable)
**Badge:** Field Notes — wheat-stalk icon.

| Unlocks at | Title | Entry |
|---|---|---|
| 0 | Turning Anyway | The windmill turns steadily even on days with no wind worth mentioning. Locals call it "just how it's built." Nobody's opened it up to check in decades. |
| 2 | Too Precise for the Land | The crop rows here are laid out in a grid too exact for the actual slope of the land — like the fields were planned before anyone looked at the ground they'd be planted on. |
| 4 | The Private Shrine | One of the older villagers keeps a small, private shrine behind her house — not for any holiday anyone recognizes, dedicated to "whoever kept the lights." She won't say more than that. |
| 6 | The Cancelled Festival | This year's harvest festival was quietly called off, no explanation given, no date rescheduled. Everyone seems relieved rather than disappointed, which is its own kind of answer. |

**NPC Dialogue Beats:**

| Layer | Beat |
|---|---|
| 1 | Tommy is fixing a fence, looking annoyed. "Another student. Great. If you're here for 'authentic island photos,' the wheat field is that way." But his tone softens: "Look, I just... this place is all I've known. My family's been here forever." |
| 2 | Tommy is burning papers — but he stops when he sees you. "They're from my grandfather. He worked for some company before the university." He hands you a singed photograph. |
| 3 | Tommy is at the edge of the field, looking at the ruins. "I used to hate this place. But now... I just want to know the truth. Will you come with me?" (Tiny Choice moment here.) |

**Badge Unlock:** "The Burned Photograph"

### 4.4 North Light (northern cliff)

One of three lighthouses — see §4.7 for the combined arc.

**Associated NPC:** Yuki (romanceable)
**Badge:** Kept the Light (North) — beam icon.

| Unlocks at | Title | Entry |
|---|---|---|
| 0 | No Keeper on the Roster | The light works — bulb changed, glass clean — but no one on the current campus staff list is assigned to it, and nobody's claiming the job. |
| 3 | The Logbook | A logbook by the door has entries going back further than anyone currently enrolled. One page lists ships turned back "before the collapse" — not shipwrecks avoided. Ships turned away from something. |
| 6 | Longer Than It Needs To | The most recent entry, dated this week, just notes that the light's been staying on a little longer than it needs to lately. It doesn't sound worried. It sounds like an old habit being kept up. |

**NPC Dialogue Beats:**

| Layer | Beat |
|---|---|
| 1 | Yuki is sitting on the cliff, journal in hand. She startles: "Oh! Sorry. I'm Yuki. I help with the light. It's... quiet here. I like that. You?" |
| 2 | Yuki shows you her journal: "I've been mapping the island's energy patterns. The lighthouse—it's not just for ships. It's... a focus point. Something under the island responds to it." |
| 3 | Yuki is crying softly. She hands you a letter: "I found this in the cottage. It's from the original keeper—a man named Elias. He wrote about 'the Loom.' And then he disappeared." (Tiny Choice moment here.) |

**Badge Unlock:** "The Light's Keeper"

### 4.5 South Light (southern coast)

Second of three. See §4.7.

**Associated NPC:** Elena (romanceable)
**Badge:** Kept the Light (South) — beam icon, different tint.

| Unlocks at | Title | Entry |
|---|---|---|
| 0 | The Other Tower | Smaller than North Light, and better hidden — you'd walk past the path to it twice before noticing. Its lamp is lit anyway. |
| 3 | A Different Hand | This logbook's handwriting changes partway through — a second author, decades later, with the same obsessive habit of logging everything down to the minute. They never sign a full name. Only initials. |
| 6 | The Initials Again | The same initials from South Light's logbook turn up, once, carved small into a beam at the Ruins (see §4.1) — easy to miss, in exactly the spot where a fourth archway would have opened onto open air. |

**NPC Dialogue Beats:**

| Layer | Beat |
|---|---|
| 1 | Elena is sitting on the rocks, staring at the water. "I'm Elena. My brother kept this light, before me. He died a few years back — a fall, they said. I keep the light now. Seemed like it needed someone." |
| 2 | Elena shows you her brother's logbook — same obsessive, minute-by-minute logging as North and Harbor Light's keepers. "Near the end he was writing pages a night. Then it just stops. No last entry, no goodbye. Just stops." |
| 3 | Elena finds a small cache he'd hidden — photos, notes, a ring that was never hers or his. "I used to want it to mean something happened to him. Some answer I could be angry at." She turns the ring over once. "Lately I think he just went looking for something and didn't stop in time to notice he'd gone too far out. I don't need it to be more than that anymore." (Tiny Choice moment here.) |

**Badge Unlock:** "The Sister's Ring"

### 4.6 Harbor Light (southeast)

Third of three, closest to the Landing. See §4.7.

**Associated NPC:** Silas (romanceable)
**Badge:** Kept the Light (Harbor) — beam icon, third tint.

| Unlocks at | Title | Entry |
|---|---|---|
| 0 | Everyone Assumes It's Decorative | Close enough to the Landing's noise and lights that most people assume Harbor Light is purely ornamental at this point. It isn't. It's on a working schedule, same as the other two. |
| 3 | Not Built for Ships | A faded builder's plaque gives a construction date that lines up, almost exactly, with the Archive's collapse — not before it, as a warning system would be, but after. |
| 6 | The Triangle | (Unlocks automatically once a student has seen the Unit-6 beat at all three lighthouses.) Lay the three towers out on any map of the island and they don't point out to sea at all — they point inward, to the same spot. The Ruins sit dead center of the three. |

**NPC Dialogue Beats:**

| Layer | Beat |
|---|---|
| 1 | Silas is painting the lighthouse a terrible shade of pink. "Beautiful, right? I call it 'Sunset Panic.' I'm Silas. Engineering student. Lighthouse maintainer. Chaos agent." |
| 2 | Silas shows you a maintenance hatch: "I found this. It's not on any blueprint. I think it leads... down. Like, way down." |
| 3 | Silas cracks the hatch. He looks at you: "I'm scared, honestly. But I can't do this alone. Will you come with me?" Inside: an old terminal, still humming. (Tiny Choice moment here.) |

**Badge Unlock:** "The Hidden Hatch"

### 4.7 The Three Lighthouses — Shared Arc

Design each as its own small hotspot with its own badge and its own logbook flavor, so a student can enjoy any one of them alone. The Unit-6 "Triangle" entry only fires once all three Unit-6 beats have individually been seen — a natural, unforced payoff for students who've been thorough, and something that never needs a popup or a hint arrow pointing at it. If a student never puts it together, that's fine; the individual entries stand alone.

### 4.8 The Ridge Shrine (atop the mountain, apart from the University's own peak)

Small, weatherworn, deliberately unclaimed by any current religious or campus group. This is where the metaphorical stories of computer science pioneers live — not as biographies, but as island-shaped echoes.

**Associated Character:** The Woman in White (non-romanceable, mystical)
**Badge:** Left Something Behind — small carved-stone icon.

| Unlocks at | Title | Entry |
|---|---|---|
| 0 | Practical Offerings | Whatever's left here is never decorative — a coil of rope, a sealed jar, a pair of gloves. Never flowers, never trinkets. Someone's need, not a tribute. |
| 2 | The Scratched Name | A name carved into the base has been scratched out — the same rough, deliberate gouge as the wall at the Ruins. Whether it's the same name is impossible to tell. |
| 4 | Facing the Wrong Way | The shrine faces inland, directly toward the Ruins, not out toward the sea the way every other shrine on this kind of island usually does. |
| 6 | Fresh Flowers | For the first time on record, there are flowers here instead of a practical object — recent, not yet wilted. Nobody on staff will admit to leaving them. |

**The Three Metaphorical Stories (Unlock at Unit 6):**

At the shrine, after collecting all Field Badges, the player encounters three carvings — each a metaphor for a pioneer's journey. They are not named directly. The player must interpret them.

| Carving | Metaphor | Pioneer | Player Reflection |
|---|---|---|---|
| The Weaver | A woman sits at a loom, weaving numbers instead of cloth. She dreams of machines that can think. | Ada Lovelace | The island itself is a weave. Every location, every connection, every story—it's a pattern. Patterns aren't just observed. They're made. By people. By dreams. By love. |
| The Engineer | A man builds a machine of brass and gears. It's beautiful, but incomplete. He's surrounded by fragments. | Charles Babbage | The island is also incomplete. It's always being built. The ruins, the lighthouses, the farms—they're all fragments of a larger machine. And I'm the one who has to finish it. |
| The Broken Code | A man cracks a code made of light and shadow. The code fights back — it reflects his own face. He's breaking himself. | Alan Turing | Everything is a code. And I'm the one decoding it. But am I also being decoded? Am I also part of the pattern? |

**The Final Revelation:**

After all three carvings are read, The Woman in White appears and asks:

> "You've walked the island. You've seen the connections. You've felt the patterns. Now tell me — what did you learn?"

The player chooses one of three responses. The ending changes accordingly:

| Choice | Ending |
|---|---|
| "That we're all weavers." (Ada's path) | The island hums with a song. The lighthouses flash in rhythm. "The pattern is complete." |
| "That we're all engineers." (Babbage's path) | The ruins glow. The fragments connect. "The machine is built." |
| "That we're all codes." (Turing's path) | The wind changes. The island sees itself clearly. "The cipher is solved." |

**Badge Unlock (Final):** "The Shrine's Witness"

---

## 5. The Final Group Scene (Regardless of Romance)

After the shrine's final revelation, all 6 romanceable NPCs gather at the Ridge Shrine — regardless of whether the player chose romance or friendship with any of them. They stand together, looking out at the island.

- If the player chose Romance with one NPC, that NPC stands closest to them, holding their hand.
- If the player chose Friendship with everyone, they stand in a loose circle — a found family.

One of them (whoever the player has the highest bond with, or the first NPC they met) says:

> "We all came here looking for something. Some of us found it. Some of us are still looking. But we found each other. And that's not nothing."

The scene fades to black.

---

## 6. Keeping This Maintainable

- Total content: 7 locations × 3-4 beats each ≈ 27 short journal entries, each independent, no branching dialogue tree, no state machine beyond "which beats has this student seen." Same authoring effort class as writing a unit's landmark blurbs.
- NPC dialogue: 6 romanceable characters × 3 layers = 18 scenes, each with a Tiny Choice moment at the end. Plus 3 non-romanceable NPCs with shorter interactions.
- Because unlocks key off `unitsCompleted` (0-6), the whole arc paces itself across the semester with zero new scheduling logic.
- The only cross-location dependency in the whole system is the Unit-6 Lighthouse Triangle payoff (§4.7) — everything else is fully independent, so you can ship fewer than seven locations for v1 and add the rest later without breaking anything already live.

---

## 7. Suggested Next Steps

1. Confirm final hotspot placement/coordinates on `island.png` for all seven locations and add matching `<Hotspot>` entries in `Island.jsx`, same pattern as the existing University one.
2. Add `src/data/locations/*.json` following the shape in §1.
3. Add `storyStore.js` (visited locations + seen beat ids), independent of `progressStore`.
4. Add a "Field Badges" section to the Passport panel + a small Journal panel/tab.
5. Add NPC dialogue data — either in the same location JSON or a separate `npcData.js` file.
6. Implement the "Tiny Choice" system (two dialogue options at the end of each NPC's Layer 3).
7. Decide whether the optional Miyu thread (§3.1) and the per-cousin aside lines are in scope for v1, or a v1.1 nice-to-have — nothing in §4 depends on them.
8. Write the three metaphorical shrine stories as full vision-text (500+ words each, poetic prose) for the Unit 6 shrine encounter.
