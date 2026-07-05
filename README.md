# SeeDS 2.0

**A visual-first, mascot-guided learning platform for CS22302 Data Structures.**
Built by Omega Mu Gamma Studio.

> "The code explains the visual. The visual explains the code."

This is a **full rebuild** of the original SeeDS (a Three.js data structure
visualizer). It is not a reskin — no code is carried over by default. This
README exists so that anyone opening this repo cold — a collaborator, a future
contributor, or a fresh AI coding session with zero memory of how this project
came to be — can understand *why* the folders are shaped the way they are and
start building immediately, without needing the original design conversations
replayed to them.

**Read this file first. Then read `PRD.md` (full product spec) and
`GAMMA_COUSINS.md` (the tutor-character system) before writing any code.**

---

## 1. Why This Project Is Shaped the Way It Is

SeeDS 1.0 got beta feedback with one verdict that outweighed every individual bug:

> "It feels like you need to understand the concepts in order to get the visuals —
> isn't that supposed to be the other way around?"

Every specific bug in that round — a sphere showing the wrong node's value, a
doubly linked list tooltip missing the `prev` pointer entirely, a "normal" stack
demo that looked identical to an overflow, a circular linked list confused with
a buggy cycle — traced back to one root cause: **a value or state that existed
in the data model had no explicit, unambiguous visual signal.**

This rebuild doesn't fix that by writing more careful rendering code. It fixes
it by:
1. Restructuring the entire learning flow so a concept is *taught* before it's
   *shown* (the 5-Phase Model, §3).
2. Making the required visual signals part of the **data schema itself**
   (`PRD.md` §8), so leaving one out is awkward to do by accident, not just
   discouraged in a comment somewhere.

If you're building a new lesson or a new component and you're not sure why a
field is required or why something is split into two files instead of one —
the answer is almost always "a beta tester found a real bug caused by this
exact gap last time, and this structure exists to make that class of bug
harder to reintroduce."

---

## 2. Full Directory Structure & Why Each Part Exists

```
SeeDS/
├── public/
│   ├── sprites/
│   │   ├── default/                  ← neutral narrator's sprite set
│   │   └── cousins/{id}/             ← one folder per Gamma Cousin
│   └── audio/
├── src/
│   ├── pages/                        ← Home, Island, Campus, CSBlock, Dorm,
│   │                                    LessonPage, Settings (UnitPage kept
│   │                                    as a legacy debug view, §2.1)
│   ├── components/
│   │   ├── layout/
│   │   ├── campus/                   ← nested campus-map scene system (§2.2)
│   │   ├── cousin/
│   │   ├── lesson/
│   │   ├── visualizers/
│   │   ├── passport/                 ← Passport/Landmarks UI (§4)
│   │   └── ui/
│   ├── data/
│   │   ├── lessons/unit{1-6}/        ← 22 lesson files, core content + neutral dialogue
│   │   ├── units/                    ← per-unit metadata + landmarks (§4)
│   │   ├── cousins/                  ← tutor identity files
│   │   └── dialogue/{cousinId}/      ← per-lesson voiced dialogue overrides
│   ├── hooks/
│   ├── services/
│   ├── store/
│   ├── utils/
│   └── styles/
├── PRD.md
├── GAMMA_COUSINS.md
└── (standard repo files: package.json, vite.config.js, LICENSE, etc.)
```

### `public/sprites/`

Two subfolders, and the split is load-bearing:

- **`default/`** — the neutral narrator's sprite set (6 expressions: `teaching`,
  `excited`, `thinking`, `oops`, `frustrated`, `idle`). Not a placeholder — this
  is the **permanent fallback voice** every lesson is guaranteed to have.
- **`cousins/{id}/`** — one folder per Gamma Cousin, same 6 expressions each. A
  cousin can have sprites with zero written dialogue, or dialogue with
  placeholder sprites — art and writing don't have to finish in lockstep.

Any component rendering "the current tutor" resolves
`public/sprites/{selectedCousin}/{expression}.png`, falling back to
`public/sprites/default/{expression}.png` if that cousin has no sprites yet —
same fallback philosophy as dialogue, applied to art instead of text.

### `src/pages/`

`Home` (dashboard), `Island` → `Campus` → `CSBlock` → `Dorm` (the nested
campus-map flow, §2.1), `LessonPage`, `Settings`. `Settings` is where a user
changes their selected tutor **at any time** — but note the app also has a
**hard onboarding gate** (§4) before any of these routes render at all on
first launch.

`UnitPage` (the original flat, syllabus-ordered node map) still exists and
still works, routed at `/campus-map/full`. It's not dead code — it's a fast,
art-free debug view of raw landmark/lock state, useful for checking progress
logic without walking through three scenes to get there.

### 2.1 The Nested Campus Map

`/campus-map` now redirects to `/campus` — the flat node map has been
replaced as the *default* path by a nested, explorable sequence:

```
/island       → establishing shot, one hotspot ("The University")
/campus       → university overview: CS Dept + Dorms (unlocked),
                 3 other departments (locked, cross-studio teasers, §2.1.1)
/campus/cs    → CS Block hallway: one door per landmark, only the current
                 landmark's door unlocked; a Staff Room door always open
/campus/dorm  → a quiet scene; its desk hotspot opens the Passport
/lesson/:id   → unchanged — the nested map is a navigation layer *on top of*
                 the existing lesson engine, not a replacement for any of it
```

Every scene shares two components (`src/components/campus/`, §2.2) rather
than being bespoke per-screen markup. **All background art right now is a CSS
gradient placeholder** (`components/campus/art.js`) — swapping in a real
illustration per scene is a one-line change in that file, not a structural
rewrite, by design.

The CS Block hallway's lock logic is intentionally copy-identical to the
locking logic `UnitPage` already used, so the two views of progress (nested
scenes vs. the flat debug map) can never disagree about what's locked.

#### 2.1.1 Locked departments are a deliberate cross-studio teaser

The Campus overview shows the Conservatory, Engineering Hall, and
Architecture Studio as visibly locked buildings with a tooltip ("closed for
now"). This is intentional, not a stub waiting to be filled in for *this*
subject — SeeDS only ever needs the CS Department. The locked buildings exist
as a free, in-universe hint that this island hosts the rest of Omega Mu Gamma
Studio's apps (BlockBeats, GateLab/ArchVisor). If/when those get their own
campus-map presence, unlocking one is a matter of flipping a flag on its
`Hotspot`, not redesigning the scene.

### 2.2 `src/components/campus/`

The reusable scaffolding every campus-map scene is built from:

- **`SceneFrame`** — shared chrome (background, vignette, back button, title/
  caption). Every scene passes its own `art` value and drops `Hotspot`s in as
  children.
- **`Hotspot`** — one clickable (or locked) thing in a scene. Two variants:
  `building` (Campus overview) and `door` (CS Block hallway). Positioned by
  `x`/`y` percentage, not fixed pixels, so it stays glued to the right spot
  regardless of viewport size — this was a deliberate reaction to the
  percentage/aspect-ratio drift bugs the old flat map's fixed layout was
  prone to.
- **`art.js`** — the single file holding every scene's placeholder gradient.
  The only file that needs to change when real illustrations are ready.

### `src/components/cousin/`

Everything related to rendering *whichever* tutor is currently active, without
ever hardcoding which one: `CousinAvatar` (sprite + expression), `CousinPicker`
(the selection grid — used both at the onboarding gate and again from
Settings), `SpeechBubble` (displays already-resolved dialogue text; it has no
knowledge of the fallback chain itself, that logic lives in
`services/dialogueService.js`).

### `src/components/lesson/`

One component per phase of the 5-Phase Model (`Phase1Understand` through
`Phase5Test`), plus `PhaseContainer` and shared pieces (`CodeBlock`,
`PhaseIndicator`). Each phase component is dumb about *which* structure it's
displaying — it receives resolved lesson + dialogue data as props. Structure-
specific rendering lives one layer down, in:

### `src/components/visualizers/`

The Konva rendering layer. `VisualizerDispatch` reads a lesson's
`visual.rendererType` and picks the right renderer:

- **`NodeGraphRenderer`** — lists, trees, graphs, hash chaining
- **`BarsRenderer`** — comparison-based sorts
- **`BucketsRenderer`** — radix sort
- **`ArrayTreeDualRenderer`** — heaps, array + tree simultaneously

Adding a new visual metaphor means adding one new file here and one new case
in the dispatch — never touching an existing renderer.

### `src/components/passport/`

Renders the **Student Passport** — see §4 for the full mechanic. `PassportButton`
is the floating entry point (badges when new stamps exist since last opened),
`PassportPanel` shows every landmark and its stamp/seal state.

### `src/data/lessons/unit{1-6}/`

**Layer 1 — core lesson content.** Concept text, C code, visual data, broken-
code variant, challenge question/answer. Every `mascotDialogue` field here
holds the **neutral default** dialogue — real fallback content, not a
placeholder. Required schema per structure type is in `PRD.md` §8 (this is
where the DLL-`prev`-field and circular-vs-cyclic-bug requirements live — read
it before authoring a new lesson).

### `src/data/units/`

Per-unit metadata **and landmark definitions** — this folder does more than
navigation now. See §4 below; `PRD.md` §8.6 has the required schema.

### `src/data/cousins/` and `src/data/dialogue/{cousinId}/`

Identity (palette, catchphrase, sprite path) vs. voice (per-lesson dialogue
overrides), kept deliberately separate. **`dialogue/{cousinId}/` is the folder
to open when giving a cousin a personality pass on a specific lesson** — a
missing file there is not an error, it silently falls back to the lesson's own
neutral dialogue (`PRD.md` §5.3).

### `src/hooks/`, `src/services/`, `src/store/`

- **`services/dialogueService.js`** implements the fallback chain — checks
  `dialogue/{cousin}/{lesson}.json` first, falls back to the lesson's own
  neutral text. Uses `import.meta.glob` to auto-register every lesson/dialogue
  JSON at build time, so adding new content is a pure data change, never a code
  change.
- **`services/lessonService.js`** — same auto-registration pattern for lessons
  and units; also resolves which landmark a lesson belongs to.
- **`store/cousinStore.js`** — `selectedCousin`, `hasSelectedAdvisor` (the
  onboarding gate flag), `unlockedCousins`. Persisted to `localStorage` under
  `seeds:cousin`.
- **`store/progressStore.js`** — completed lessons, XP, level, streak, **and**
  the passport `stamps`/seal bookkeeping. Persisted under `seeds:progress`.
  Entirely independent of which cousin is active — switching tutors never
  touches progress.

### `src/utils/`, `src/styles/`

`cHighlighter.js` (C syntax highlighting), `rendererDispatch.js`,
`xpCalculator.js`; `styles/tokens.css` holds the color-coding system as CSS
variables (node blue, pointer orange, NULL gray, broken red, highlight yellow —
full list in `PRD.md` §11.3).

### A retired script

An earlier version of this repo included `scaffold.sh`, a bash script that
generated this directory structure and its blank stub files in one pass. It
did its job — this structure exists because of it — but it was a rough,
primitive first draft (string-templated file generation, no real
error-handling, brittle if re-run against a partially-hand-edited tree) and
has been removed rather than kept around as dead weight or a false promise of
"safe to re-run." The structure it produced is now maintained by hand, per the
conventions documented in this README and in `PRD.md`. If a proper authoring
tool ever gets built for lesson/dialogue scaffolding, it'll replace this
section with something worth pointing at — not a resurrection of the old script.

---

## 3. The 5-Phase Learning Model (quick reference)

Every lesson runs through five phases, in order. Full detail in `PRD.md` §4.

| Phase | Name | Shows |
|---|---|---|
| 1 | Understand | Mascot explains the concept in plain English. No code, no visual. |
| 2 | See the Code | Full working C implementation, syntax highlighted. |
| 3 | See the Visual | Two-column code ↔ visual, bidirectional hover mapping. |
| 4 | See the Break | Two-column broken code ↔ broken visual. |
| 5 | Test | Click-target, MCQ, or code-fill challenge. |

---

## 4. The Tutor System & The Passport (quick reference)

Full tutor detail and all 10 personalities in `GAMMA_COUSINS.md` — read that
file before writing any dialogue. Full technical spec of both systems below is
in `PRD.md` §5 and §6.1/§8.6.

**Tutors:**
1. Every lesson has neutral default dialogue baked into its core JSON.
2. On first launch, the app is **gated** — nothing else renders until the
   student picks a Gamma Cousin as their tutor (`cousinStore.hasSelectedAdvisor`).
3. That choice is changeable anytime afterward from Settings.
4. If the selected cousin has written dialogue for the current lesson, hers is
   shown; if not, the neutral default is shown instead. Nothing ever breaks
   from incomplete content.
5. Progress tracking is entirely independent of which cousin is active.

**The Passport:**
1. Units are subdivided into named **landmarks** (e.g. Unit 1 = "The
   Chainworks" + "The Stack & Queue Yard"), each with a short `visualHook`
   description and an explicit list of which lessons belong to it.
2. Completing a lesson stamps its landmark in the student's in-app Passport.
3. Once every lesson under a landmark is done, that landmark's stamp **seals**
   (wax-crest state) — a small, satisfying "you've finished this whole place"
   moment distinct from finishing just one lesson.
4. **Every unit file must define its `landmarks` array** (`PRD.md` §8.6) — a
   unit without one silently produces no passport progress for its lessons.
   This is a required part of authoring a new unit, not decoration to add later.

---

## 5. Setup

```bash
git clone https://github.com/Omega-Mu-Gamma-Studio/SeeDS.git
cd SeeDS
git checkout rebuild-2.0
npm install
npm run dev
```

Verified as of this README: `npm install` resolves cleanly and `npm run build`
produces a working production bundle with zero errors.

### Dependencies

```bash
npm install react react-dom react-router-dom zustand framer-motion konva react-konva
```

| Package | Why it's here |
|---|---|
| `react` / `react-dom` | React 19, core framework |
| `react-router-dom` | Routes: `/`, `/island`, `/campus`, `/campus/cs`, `/campus/dorm`, `/campus-map` (redirect alias), `/campus-map/full` (legacy flat map), `/lesson/:lessonId`, `/settings` |
| `zustand` | `lessonStore`, `progressStore`, `cousinStore`, `uiStore` |
| `framer-motion` | Phase transitions, mascot expression changes, Passport panel slide-in |
| `konva` / `react-konva` | The visualizer layer — chosen because Phase 3/4's hover-highlight interaction needs per-shape hit detection and easy re-styling, which Konva's shape-object model provides natively |

**Note:** `react-konva` is pinned to a version compatible with React 19's peer
dependencies (not the older `^18.x` line) — if you ever see a peer-dependency
warning on install, check this first before troubleshooting further.

### Dev dependencies

```bash
npm install -D vite @vitejs/plugin-react eslint @eslint/js eslint-plugin-react-hooks eslint-plugin-react-refresh globals @types/react @types/react-dom
```

No CSS framework (plain CSS + CSS Modules), no cloud backend (localStorage via
Zustand persist is sufficient for a course companion tool), no automated
schema-validation library for v1 (QA is a manual lightweight checklist —
`PRD.md` §12).

**A note on bundle size as content grows:** `lessonService.js` and
`dialogueService.js` both use `import.meta.glob(..., { eager: true })`, which
bundles every lesson and dialogue file into the initial load, always. This
keeps content-authoring simple (no manual import lists) but means the bundle
can only grow, never lazy-load, as more lessons and cousin dialogue packs are
written. Worth revisiting (`eager: false` + dynamic `import()`) if the bundle
approaches the `PRD.md` §15 budget of <1MB initial.

---

## 6. If You're Picking This Up Cold

If you're a contributor, or an AI assistant in a fresh session, starting from
just this repo:

1. Read this README fully (you just did).
2. Read `PRD.md` in full — the lesson JSON schema (§8), the unit/landmark
   schema (§8.6), the Passport system (§6.1), full feature list, architecture,
   and QA checklist all live there.
3. Read `GAMMA_COUSINS.md` in full — every tutor's personality, voice rules,
   and the design rules that apply to any dialogue you write for them.
4. Before authoring a new lesson: check `PRD.md` §8.2 for required node fields
   per structure type, and §12 for the pre-merge checklist.
5. Before authoring a new unit: make sure its `landmarks` array is defined and
   every one of its lessons is assigned to exactly one landmark (§8.6) — this
   is easy to forget and fails silently, not loudly.
6. Before writing a cousin's dialogue for a lesson: open her folder in
   `data/dialogue/{cousinId}/`, create the file for that lesson ID if it
   doesn't exist, write only the phase-level overrides — never touch the
   lesson core file.
7. Never hardcode a specific cousin's assets or dialogue path anywhere outside
   `services/dialogueService.js` and the sprite-resolution logic in
   `components/cousin/CousinAvatar.jsx`.

---

## 7. Current Status — What's Actively Being Worked On

Snapshot, so nobody (including future-you) wastes time wondering "is this done
or not" about the parts that are visibly incomplete:

- **Fully built and verified:** all 22 lessons authored with real content
  (concept, C code, dialogue, visual data) across all 6 units; the 5-Phase
  engine; the Konva visualizer layer (`NodeGraphRenderer`, `BarsRenderer`,
  `BucketsRenderer`, `ArrayTreeDualRenderer`); the neutral-default dialogue
  fallback chain; the cousin selection/onboarding gate; the Passport/Landmarks
  progress system; the nested campus-map navigation shell (Island → Campus →
  CS Block → Dorm, §2.1) with functional locking, the Staff Room advisor
  switcher, and the Passport-from-Dorm hotspot. Builds clean with
  `npm run build`, zero errors, zero lint warnings.
- **Explicitly a skeleton, not a finished scene — the nested campus map's
  art.** Every background in `/island`, `/campus`, `/campus/cs`, `/campus/dorm`
  is a CSS gradient placeholder (`components/campus/art.js`). The navigation,
  locking, and hotspot logic are real and tested; the *visuals* are
  intentionally unfinished pending real illustration.
- **Fully built and verified — cousin dialogue.** All 10 Gamma Cousins have
  complete, fully-voiced 22-lesson dialogue packs in
  `data/dialogue/{cousinId}/` (220 files total, verified file-by-file — not a
  partial pass). Every lesson now has a real per-cousin voice on top of the
  neutral default, not just the fallback. (An earlier draft of this README
  said this hadn't started yet — that was wrong and has been corrected here;
  if you're reading a stale copy of this file anywhere, this note is the one
  to trust.)
- **Not yet started — character sprites.** `public/sprites/default/` and
  `public/sprites/cousins/{id}/` exist as empty folders (`.gitkeep`
  placeholders only) for all 6 required expressions
  (`teaching`/`excited`/`thinking`/`oops`/`frustrated`/`idle`) per character.
  No actual artwork has been produced yet for anyone, including the default
  narrator — `CousinAvatar.jsx` currently has nothing to render.
- **Not yet started — background/environment art.** The Passport system's
  `visualHook` descriptions (e.g. "a workshop strung with actual chain-link"
  for The Chainworks) are written as text prompts for future illustration, not
  as delivered assets. The nested campus map (§2.1) now has a real place for
  this art to land — one file, `components/campus/art.js` — but the
  illustrations themselves (island establishing shot, campus overview, CS
  Block hallway, Dorm interior) don't exist yet, nor do landmark backgrounds
  or any lesson-specific environment art.

If you're a contributor picking a task off this list: dialogue packs are pure
JSON authoring (no code changes required, see §4/§6 above), sprites and
background art are asset production against the existing folder contracts
above, and neither blocks the other — they can be worked in parallel by
different people without stepping on each other's files.

---

## 8. License

**PolyForm Noncommercial 1.0.0.** SeeDS is licensed under the same
finished-product license tier as the studio's other shipped apps — this
supersedes an earlier plan to keep SeeDS under MIT as a "collaborative tool,"
and an earlier draft of this README incorrectly named it PolyForm **Shield**
instead — a meaningfully different license, corrected here.

In plain terms, and this distinction matters, so read it carefully rather than
pattern-matching to "oh, some open-source-adjacent license":

- **Noncommercial ≠ Shield.** PolyForm Shield permits commercial use broadly,
  restricting only *competing* against the licensor. PolyForm Noncommercial is
  stricter: **no commercial use of any kind is permitted**, full stop, by
  anyone other than the licensor. You can use, study, modify, and share this
  source freely for noncommercial purposes — personal learning, academic use,
  contributing back to the project — but nobody (including a fork, including a
  derivative product) may use this code, or a substantial part of it, as part
  of anything sold, monetized, or run as a commercial service, without a
  separate agreement with Omega Mu Gamma Studio.
- This is the correct license for a course-companion tool the studio wants
  freely usable by students and contributors, while keeping commercial
  exploitation of the codebase itself off the table.

See the `LICENSE` file in this repo for the full, authoritative text — this
paragraph is a plain-English summary, not a substitute for it. If anything
here reads differently than what's actually in `LICENSE`, `LICENSE` wins;
flag it and this section gets corrected again.

---

*Built by Omega Mu Gamma Studio. Full spec: `PRD.md`. Tutor roster:
`GAMMA_COUSINS.md`.*