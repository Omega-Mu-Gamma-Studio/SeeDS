# SeeDS 2.0

**A visual-first, mascot-guided learning platform for CS22302 Data Structures.**
Built by Omega Mu Gamma Studio.

> "The code explains the visual. The visual explains the code."

This is a **full rebuild** of the original SeeDS (a Three.js data structure
visualizer). It is not a reskin — no code is carried over by default. This README
exists so that anyone opening this repo cold — a collaborator, a future
contributor, or a fresh AI coding session with zero memory of how this project came
to be — can understand *why* the folders are shaped the way they are and start
building immediately, without needing the original design conversation replayed
to them.

**Read this file first. Then read `PRD.md` (full product spec) and
`GAMMA_COUSINS.md` (the tutor-character system) before writing any code.**

---

## 1. Why This Project Is Shaped the Way It Is

SeeDS 1.0 got beta feedback with one verdict that outweighed every individual bug:

> "It feels like you need to understand the concepts in order to get the visuals —
> isn't that supposed to be the other way around?"

Every specific bug in that round — a sphere showing the wrong node's value, a
doubly linked list tooltip missing the `prev` pointer entirely, a "normal" stack
demo that looked identical to an overflow, a circular linked list confused with a
buggy cycle — traced back to one root cause: **a value or state that existed in
the data model had no explicit, unambiguous visual signal.**

This rebuild doesn't fix that by writing more careful Three.js. It fixes it by:
1. Restructuring the entire learning flow so a concept is *taught* before it's
   *shown* (the 5-Phase Model, §3).
2. Making the required visual signals part of the **data schema itself** (§8 of
   `PRD.md`), so leaving one out is awkward to do by accident, not just
   discouraged in a comment somewhere.

If you're building a new lesson or a new component and you're not sure why a
field is required or why something is split into two files instead of one — the
answer is almost always "a beta tester found a real bug caused by this exact gap
last time, and this structure exists to make that class of bug harder to
reintroduce."

---

## 2. Full Directory Structure & Why Each Part Exists

```
SeeDS/
├── public/
│   ├── sprites/
│   │   ├── default/          
│   │   └── cousins/{id}/     
│   └── audio/
├── src/
│   ├── pages/
│   ├── components/
│   │   ├── layout/
│   │   ├── cousin/
│   │   ├── lesson/
│   │   ├── visualizers/
│   │   └── ui/
│   ├── data/
│   │   ├── lessons/unit{1-6}/
│   │   ├── units/
│   │   ├── cousins/
│   │   └── dialogue/{cousinId}/
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

Two subfolders, not one, and this split is load-bearing:

- **`default/`** — the neutral narrator's sprite set (6 expressions: `teaching`,
  `excited`, `thinking`, `oops`, `frustrated`, `idle`). This is not a placeholder
  character — it is the **permanent fallback voice** that every lesson is
  guaranteed to have. v1 launches on this voice alone.
- **`cousins/{id}/`** — one folder per Gamma Cousin (see `GAMMA_COUSINS.md`),
  each with the same 6 expression files. A cousin folder can exist and be empty
  of dialogue (see `data/dialogue/` below) while still having sprites — art and
  writing don't have to be finished in lockstep.

**Why this matters for anyone building UI:** any component that renders "the
current tutor" should never hardcode a specific character's sprite path. It
should resolve `public/sprites/{selectedCousin}/{expression}.png`, falling back
to `public/sprites/default/{expression}.png` if the selected cousin has no
sprites yet. Same fallback philosophy as dialogue (§2, `data/dialogue/` below),
applied to art instead of text.

### `src/pages/`

Standard React Router top-level views: `Home`, `UnitPage`, `LessonPage`, and
`Settings` — the last of which is new relative to prior studio apps, because
it's where a user changes their selected tutor **at any time**, not just once at
onboarding. Character choice must never be locked to a single moment in the app.

### `src/components/layout/`

Standard shell: `AppLayout`, `Sidebar` (lesson navigation + completion status),
`AnimatedBg`. Nothing SeeDS-specific here — same shape as prior studio apps.

### `src/components/cousin/`

Everything related to rendering *whichever* tutor is currently active, without
ever hardcoding which one:

- **`CousinAvatar`** — renders the selected cousin's sprite + current expression.
- **`CousinPicker`** — the "meet the cousins" selection UI, used on first launch
  and reachable again from Settings.
- **`SpeechBubble`** — displays resolved dialogue text. This component takes
  already-resolved text as a prop; it has no knowledge of the fallback chain
  itself (that logic lives in `services/dialogueService.js`, kept out of the UI
  layer on purpose so the resolution logic is testable independent of rendering).

### `src/components/lesson/`

One component per phase of the 5-Phase Model (`Phase1Understand` through
`Phase5Test`), plus `PhaseContainer` (the wrapper that shows whichever phase is
active) and `CodeBlock`/`PhaseIndicator` as shared pieces. Each phase component
is intentionally dumb about *which* structure it's displaying — it receives
resolved lesson + dialogue data as props and renders it. Structure-specific
rendering logic lives one layer down, in:

### `src/components/visualizers/`

This folder doesn't exist in any prior studio app, because no prior app needed
more than one visual metaphor. SeeDS does — a linked list and a bubble sort
should **not** be forced through the same "nodes and edges" rendering logic.

- **`VisualizerDispatch`** — reads a lesson's `visual.rendererType` field and
  picks the right renderer below. This is the *only* place that dispatch
  decision is made — no other component should ever branch on rendererType.
- **`NodeGraphRenderer`** — lists, trees, graphs, hash chaining (the classic
  spheres-and-arrows view)
- **`BarsRenderer`** — comparison-based sorts (bubble/quick/merge/shell)
- **`BucketsRenderer`** — radix sort's digit-bucket distribution
- **`ArrayTreeDualRenderer`** — heaps, shown simultaneously as array and tree

Adding a new visual metaphor later means adding one new file here and one new
case in the dispatch — it should never require touching an existing renderer.

### `src/components/ui/`

Generic, structure-agnostic UI: `BottomBar`, `ProgressBar`, `XPDisplay`,
`ThemeToggle`. Nothing here should ever import from `data/lessons` or
`data/dialogue` directly.

### `src/data/lessons/unit{1-6}/`

**This is Layer 1 — core lesson content.** Concept text, C code, visual data
(`nodes`/`edges` or `bars`/`buckets` depending on `rendererType`), broken-code
variant, and challenge question/answer. Every `mascotDialogue` field in these
files holds the **neutral default version** of that dialogue beat — not a
placeholder, but the real fallback content. See `PRD.md` §8 for the exact
required schema per structure type (this is where the DLL-`prev`-field and
circular-vs-cyclic-bug requirements live — read it before authoring a new
lesson).

### `src/data/units/`

One file per unit (`unit1.json`–`unit6.json`) holding just navigation metadata:
title, ordered lesson list, icon. Kept separate from lesson content so the
sidebar doesn't need to load all 22 full lesson files just to render a nav list.

### `src/data/cousins/`

**Identity only.** One JSON file per cousin (`scout.json`, `miyu.json`, etc.)
holding her name, palette hex codes, catchphrase, and sprite folder reference —
content that is true about her regardless of which lesson is being taught. This
should rarely change once written. Full personality/voice reference for writing
these lives in `GAMMA_COUSINS.md` — don't invent a cousin's traits from scratch
here, port them from that document.

### `src/data/dialogue/{cousinId}/`

**This is Layer 2 — the actual authoring surface for character voice.** One file
per lesson per cousin (e.g. `dialogue/scout/1.1.json`), containing only the
*voiced override* of that lesson's dialogue beats. **This is the folder to open
when you want to give a cousin a personality pass on a specific lesson** — you
never touch the lesson core file to do this.

Critically: **a missing file here is not an error.** If
`dialogue/miyu/1.7.json` doesn't exist, the app silently falls back to
`data/lessons/unit2/1.7.json`'s own neutral dialogue. This is what makes it safe
to have 10 cousin folders sitting mostly empty for months — nothing breaks, the
neutral voice just covers the gap. Build cousins one lesson at a time, in any
order, whenever you feel like it.

### `src/hooks/`, `src/services/`, `src/store/`

Standard separation:
- **`services/dialogueService.js`** is the one piece of code that actually
  implements the fallback chain described above — check `dialogue/{cousin}/{lesson}.json`
  first, fall back to `lessons/{lesson}.json` if it doesn't exist. This logic
  should live in exactly one place.
- **`store/cousinStore.js`** holds `selectedCousin` + `unlockedCousins`,
  completely decoupled from `store/progressStore.js` — switching tutors must
  never affect completed lessons, XP, or streak.
- **`hooks/useDialogue.js`** and **`hooks/useCousin.js`** are the React-facing
  wrappers around the services/store above — components should call these
  hooks, not reach into services or stores directly.

### `src/utils/`

`cHighlighter.js` (C syntax highlighting for the code panel), `rendererDispatch.js`
(the lookup table `VisualizerDispatch` uses), `xpCalculator.js`.

### `src/styles/tokens.css`

The color-coding system as CSS variables (node blue, pointer orange, NULL gray,
broken red, highlight yellow — full list in `PRD.md` §11.3). Any new component
should reference these variables, never hardcode a hex value inline.

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

## 4. The Tutor System (quick reference)

Full detail and all 10 personalities in `GAMMA_COUSINS.md` — read that file
before writing any dialogue. Summary of the mechanism:

1. Every lesson has neutral default dialogue baked into its core JSON.
2. A user selects a "Gamma Cousin" as their active tutor — changeable anytime
   from Settings, never locked.
3. If that cousin has a written dialogue file for the current lesson, her
   version is shown. If not, the neutral default is shown instead. Nothing ever
   breaks from incomplete content.
4. Progress tracking is entirely independent of which cousin is active.

---

## 5. Setup

```bash
git clone https://github.com/Omega-Mu-Gamma-Studio/SeeDS.git
cd SeeDS
npm install
npm run dev
```

### Dependencies

```bash
npm install react react-dom react-router-dom zustand framer-motion konva react-konva
```

| Package | Why it's here |
|---|---|
| `react` / `react-dom` | React 19, core framework |
| `react-router-dom` | Lesson/unit navigation |
| `zustand` | `lessonStore`, `progressStore`, `cousinStore`, `uiStore` |
| `framer-motion` | Phase transitions, mascot expression changes, node insertion animation |
| `konva` / `react-konva` | The visualizer layer — chosen specifically because Phase 3/4's hover-highlight interaction needs per-shape hit detection and easy re-styling, which Konva's shape-object model provides natively (raw Canvas or SVG would mean building hit-testing by hand) |

### Dev dependencies

```bash
npm install -D vite @vitejs/plugin-react eslint @eslint/js eslint-plugin-react-hooks eslint-plugin-react-refresh globals @types/react @types/react-dom
```

No CSS framework (plain CSS + CSS Modules, per `PRD.md` §10), no cloud backend
(localStorage via Zustand persist is sufficient for a course companion tool), no
automated schema-validation library for v1 (QA is a manual lightweight checklist
— see `PRD.md` §12 — not automated validation).

---

## 6. If You're Picking This Up Cold

If you're a contributor, or an AI assistant in a fresh session, starting from
just this repo:

1. Read this README fully (you just did).
2. Read `PRD.md` in full — it has the exact lesson JSON schema (§8), the full
   feature list, architecture, and QA checklist.
3. Read `GAMMA_COUSINS.md` in full — it has every tutor's personality, voice
   rules, and the design rules that apply to any dialogue you write for them.
4. Before authoring a new lesson: check `PRD.md` §8.2 for the required node
   fields for that structure type, and §12 for the pre-merge checklist.
5. Before writing a cousin's dialogue for a lesson: open her folder in
   `data/dialogue/{cousinId}/`, create the file for that lesson ID if it
   doesn't exist, and write only the phase-level dialogue overrides — don't
   touch the lesson core file.
6. Never hardcode a specific cousin's assets or dialogue path anywhere outside
   `services/dialogueService.js` and the sprite-resolution logic in
   `components/cousin/CousinAvatar.jsx` — every other component should be
   working with already-resolved data.

---

## 7. License

See `LICENSE`. (SeeDS is a collaborative studio tool — MIT.)

---

*Built by Omega Mu Gamma Studio. Full spec: `PRD.md`. Tutor roster: `GAMMA_COUSINS.md`.*