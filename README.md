<div align="center">

# 🌱 SeeDS 2.0

**A visual-first, mascot-guided learning platform for CS22302 — Data Structures**

*The code explains the visual. The visual explains the code.*

[![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white)](https://vite.dev/)
[![Zustand](https://img.shields.io/badge/Zustand-5-orange)](https://zustand-demo.pmnd.rs/)
[![Konva](https://img.shields.io/badge/Konva-9-0d83cd)](https://konvajs.org/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-0055ff)](https://www.framer.com/motion/)
[![License: PolyForm Noncommercial](https://img.shields.io/badge/License-PolyForm_Noncommercial-blue)](./LICENSE)

Built by [Omega Mu Gamma Studio](https://github.com/Omega-Mu-Gamma-Studio) — SeeDS is the studio's data-structures companion for CS22302, standing alongside the [Chan series](#part-of-omega-mu-gamma-studio) of anime-guided programming tutors and the rest of the studio's course tools.

</div>

---

## What is SeeDS?

SeeDS is a full rebuild of the studio's original Three.js data-structure visualizer. SeeDS 1.0's own beta testers gave it a consistent verdict: you had to already understand a concept to make sense of its visual, which is backwards for a *learning* tool. Every specific bug that came out of that round — a sphere showing the wrong node's value, a doubly linked list tooltip missing `prev`, a circular list that looked like a buggy cycle — traced back to the same root cause: a value in the data model with no unambiguous visual signal.

2.0 fixes that at the structural level, not by patching rendering code:

1. A concept is *taught* before it's *shown* — a 5-phase lesson model, not a diagram dropped on a student cold.
2. Every required visual signal is part of the lesson's **data schema**, so leaving one out is awkward to do by accident rather than just discouraged in a comment.

A cast of ten tutors — the **Gamma Cousins** — guide students through it, each with her own voice, and each lesson has real content behind her regardless of whether her specific dialogue pack has landed yet.

---

## The Teaching Model

Every lesson runs through five phases, in a fixed order:

| Phase | Name | What Happens |
|-------|------|----|
| **1** | Understand | The tutor explains the concept in plain English — no code, no visual yet |
| **2** | See the Code | Full working C implementation, syntax highlighted |
| **3** | See the Visual | Two-column code ↔ visual view with bidirectional hover mapping |
| **4** | See the Break | Same two-column layout, deliberately broken code and visual |
| **5** | Test | A click-target, multiple-choice, or code-fill challenge |

If a lesson's selected tutor hasn't written dialogue for it yet, the neutral default narrator's voice is shown instead — nothing ever breaks or shows blank text because a cousin's writing is incomplete.

---

## Curriculum — 22 Lessons Across 6 Units

All 22 lessons are authored, in the repo, and verified — concept text, C implementation, visual data, broken-code variant, and a test challenge for every one.

| Unit | Landmark(s) | Topics |
|------|-------------|--------|
| 1 | The Chainworks · The Stack & Queue Yard | Singly / Doubly / Circular Linked Lists, Stack, Queue |
| 2 | The Grove of Rotations | Binary Search Tree, AVL Tree, Expression Tree |
| 3 | The Heap Observatory | Min Heap, Max Heap, Heap Sort |
| 4 | The Bridge District | Directed Graphs, Undirected Graphs, BFS, DFS |
| 5 | The Hash Market | Hashing — Separate Chaining, Hashing — Open Addressing |
| 6 | The Sorting Stadium | Bubble, Quick, Merge, Shell, Radix Sort |

<details>
<summary>📖 View all 22 lessons</summary>

**Unit 1 — The Chainworks & The Stack and Queue Yard**
`1.1` Singly Linked List · `1.2` Doubly Linked List · `1.3` Circular Linked List · `1.4` Stack · `1.5` Queue

**Unit 2 — The Grove of Rotations**
`2.1` Binary Search Tree · `2.2` AVL Tree · `2.3` Expression Tree

**Unit 3 — The Heap Observatory**
`3.1` Min Heap · `3.2` Max Heap · `3.3` Heap Sort

**Unit 4 — The Bridge District**
`4.1` Directed Graphs · `4.2` Undirected Graphs · `4.3` Breadth-First Search · `4.4` Depth-First Search

**Unit 5 — The Hash Market**
`5.1` Hashing — Separate Chaining · `5.2` Hashing — Open Addressing

**Unit 6 — The Sorting Stadium**
`6.1` Bubble Sort · `6.2` Quick Sort · `6.3` Merge Sort · `6.4` Shell Sort · `6.5` Radix Sort

</details>

Units are more than a syllabus grouping — each is split into named **landmarks** (e.g. Unit 1 = "The Chainworks" + "The Stack & Queue Yard"), and finishing every lesson under a landmark seals it in the student's in-app Passport. See [Features](#features) below.

---

## Features

### 🎓 Learning System
- **5-phase lesson structure** on every lesson — Understand → Code → Visual → Break → Test
- **Konva-rendered visualizers**, dispatched per lesson by structure type: `NodeGraphRenderer` (lists, trees, graphs, hash chaining), `BarsRenderer` (comparison sorts), `BucketsRenderer` (radix sort), `ArrayTreeDualRenderer` (heaps, array + tree side by side), `GridRenderer` (number-grid view for sorting passes)
- **Bidirectional code ↔ visual hover mapping** in Phases 3 and 4
- A color-coding system (node blue, pointer orange, `NULL` gray, broken red, highlight yellow) applied consistently across every renderer

### 🧑‍🏫 The Gamma Cousins — Tutor System
Ten tutors, each with her own nationality-flavored voice and personality, plus a neutral default narrator every lesson can fall back to:

| Tutor | Origin | Catchphrase |
|-------|--------|-------------|
| Ananya | Indian | *"Bas! That's it. Done."* |
| Camille | French | *"Bizarre... mais ça marche."* |
| Florence | British | *"Right. That's that, then."* |
| Mack | Australian | *"No wukkas, mate — we got this."* |
| Mei | Singaporean | *"Can already. Let's go."* |
| Miyu | Japanese | *"Maa... ganbatte ne."* |
| Rosa | Italian | *"Perfetto! Capito?"* |
| Scout | Texan | *"Hold my sweet tea — I'm fixin' to teach."* |
| Simi | Nigerian | *"E no go easy, but you go learn-am o!"* |
| Valeria | Mexican | *"Ándale, ándale — let's leak some memory!"* |

- On first launch, the app is **gated** — a student must pick a tutor before anything else renders. That choice is changeable anytime afterward from Settings.
- **All 10 cousins have complete, fully-voiced 22-lesson dialogue packs** — 220 files, written and verified file-by-file, not a partial pass. If a specific override is ever missing, the lesson's neutral default is shown instead; nothing breaks.
- **All 10 cousins now have a real illustrated portrait** (ink-wash style), rendered full-frame instead of a small circular crop so the art keeps its atmosphere. The neutral default narrator still renders as an initial + expression badge, since it's a text-first fallback voice rather than a character.
- Progress tracking is entirely independent of which tutor is active — switching never touches saved progress.

### 🗺️ The Campus Map & Passport
- A nested, explorable navigation layer sits on top of the lesson engine: **Island → Campus → CS Block → Dorm**, each with its own real illustrated background (ink-wash, matching the cousin portraits' medium) — not a placeholder gradient.
- The Campus overview also shows three other studio departments as visibly locked buildings — an in-universe teaser for the studio's other apps, not an unfinished stub.
- A flat, syllabus-ordered debug view of the same progress data (`UnitPage`, at `/campus-map/full`) still exists for quickly checking lock state without walking the scenes.
- **The Passport** tracks a stamp per landmark on lesson completion, and **seals** (wax-crest state) once every lesson under a landmark is done — a distinct "you finished this whole place" moment on top of finishing a single lesson.

### 📖 Story Mode — Ambient Island Lore
A second, fully optional layer of hotspots sits on the same Island scene as the University — **seven explorable locations** (The Ruins, The Landing, Windmill Row, North Light, Harbor Light, South Light, the Ridge Shrine), each with its own illustrated background under `public/campus-art/story/`.

- **No forced quests.** Nothing here gates a lesson, and nothing requires a "task" — it's pure texture for students who like poking around, per `Story_Mode.md`.
- **Field Badges & Journal.** Visiting a location for the first time ever earns a Field Badge (`FieldBadgeToast`), tracked in a new "Field Badges" section of the Passport, kept visually distinct from the wax-crest landmark seals. A Journal panel appends a short, dated entry per beat as it unlocks.
- **Paced by unit progress, not a calendar.** Each location's beats unlock at specific `unitsCompleted` thresholds (0–6) — the story paces itself across the semester automatically as a student works through the curriculum, with zero new scheduling logic.
- **Nine NPCs**, six with a three-layer dialogue arc that ends in a "Tiny Choice" (Friendship or Romance, kept chaste and consequence-light), plus three non-romanceable supporting characters. All portraits live under `public/portraits/story/`.
- **Fully decoupled** from the lesson/cousin systems — its own `storyStore.js` (visited locations, seen beats, NPC layer progress, NPC choices) and `storyService.js` (content loading + unlock logic), independent of `progressStore`. A student who never explores the island loses nothing functional.
- The Unit-6 "Lighthouse Triangle" payoff at Harbor Light is the one cross-location dependency in the whole system — it only fires once the matching Unit-6 beats at North Light and South Light have also been seen.
- Full plot, character bios, and per-location beat scripts live in `Story_Mode.md`.

---

## Current Status

So nobody wastes time wondering what's actually done versus in progress:

**✅ Fully built and verified**
- All 22 lessons, all 6 units, real content throughout (concept, C code, dialogue, visual data)
- The 5-phase lesson engine and all five Konva visualizers, including the newer `GridRenderer` (number-grid view for Heap Sort and the Unit 6 sorting algorithms) and a hardened `NodeGraphRenderer` (Stack ADT rendering fixes)
- The neutral-default dialogue fallback chain, tutor selection/onboarding gate, and all 220 cousin dialogue files
- The Passport/landmark progress system, with sealing
- The nested campus-map shell (Island → Campus → CS Block → Dorm) with working locks, the Staff Room advisor switcher, and the Passport-from-Dorm hotspot
- **Story Mode** — all 7 island locations, all 9 NPCs, the Field Badges/Journal system, and the Tiny Choice arcs are implemented and live, with matching illustrated art wired in for every location and NPC (see [Features](#-story-mode--ambient-island-lore))
- **Illustrated backgrounds for all four campus-map scenes** (`public/campus-art/`) — these replaced the earlier CSS-gradient placeholders and are live in the app today
- **Illustrated portraits for all 10 Gamma Cousins** (`public/portraits/cousins/`), wired into `CousinAvatar` with a graceful fallback for anyone without one
- `npm run build` and `npm run lint` both run clean — zero errors, zero lint warnings

**🚧 Not yet started**
- **Character expression sprites.** `public/sprites/default/` and `public/sprites/cousins/{id}/` still exist only as empty, `.gitkeep`-only folders for the 6 planned expressions (`teaching` / `excited` / `thinking` / `oops` / `frustrated` / `idle`) per character. The portrait art above is a separate, already-shipped system; per-expression sprite sheets are a distinct piece of art that hasn't been produced yet.
- **Audio.** `public/audio/` is currently empty.

If you're picking a task off this list: dialogue is done, sprite art and audio are open and don't block each other or anything already shipped.

---

## Project Structure

```
SeeDS/
├── public/
│   ├── campus-art/          ← island / campus / cs-block / dorm illustrations (done)
│   │   └── story/           ← 7 Story Mode location backgrounds (done)
│   ├── portraits/
│   │   ├── cousins/         ← 10 cousin portraits (done)
│   │   └── story/           ← Story Mode NPC portraits (done)
│   ├── sprites/             ← per-expression sprite folders (not started, .gitkeep only)
│   └── audio/                ← (empty, not started)
├── src/
│   ├── pages/                ← Home, Island, Campus, CSBlock, Dorm, LessonPage,
│   │                            Settings, UnitPage (legacy flat debug map),
│   │                            LocationScene (Story Mode location + NPC scenes)
│   ├── components/
│   │   ├── layout/
│   │   ├── campus/           ← SceneFrame, Hotspot, art.js (nested campus-map scenes)
│   │   ├── cousin/           ← CousinAvatar, CousinPicker, SpeechBubble
│   │   ├── lesson/            ← Phase1Understand … Phase5Test, PhaseContainer, CodeBlock
│   │   ├── visualizers/       ← NodeGraphRenderer, BarsRenderer, BucketsRenderer,
│   │   │                         ArrayTreeDualRenderer, GridRenderer, VisualizerDispatch
│   │   ├── passport/          ← PassportButton, PassportPanel, LandmarkSealToast
│   │   ├── story/             ← FieldBadgeToast (Story Mode badge celebration)
│   │   └── ui/
│   ├── data/
│   │   ├── lessons/unit{1-6}/ ← 22 lesson files (core content + neutral dialogue)
│   │   ├── units/             ← per-unit metadata + landmark definitions
│   │   ├── cousins/           ← tutor identity files (palette, catchphrase, portrait path)
│   │   ├── dialogue/{cousinId}/ ← 220 per-lesson voiced dialogue overrides
│   │   ├── locations/         ← 7 Story Mode location files (hotspot coords + beats)
│   │   └── npcs/               ← 9 Story Mode NPC files (dialogue layers, Tiny Choice text)
│   ├── hooks/
│   ├── services/               ← lessonService.js, dialogueService.js (fallback chain),
│   │                              storyService.js (Story Mode content + unlock logic)
│   ├── store/                  ← lessonStore, progressStore, cousinStore, uiStore, storyStore
│   ├── utils/                  ← cHighlighter.js, rendererDispatch.js, xpCalculator.js
│   └── styles/                 ← tokens.css (the color-coding system)
├── PRD.md
├── GAMMA_COUSINS.md
├── Story_Mode.md
└── (standard repo files: package.json, vite.config.js, LICENSE, etc.)
```

For the full rationale behind this structure, the lesson/unit JSON schemas, and the QA checklist, see `PRD.md`. For every cousin's full personality and voice rules, see `GAMMA_COUSINS.md`. Both are required reading before authoring new lessons or dialogue.

---

## Getting Started

```bash
git clone https://github.com/Omega-Mu-Gamma-Studio/SeeDS.git
cd SeeDS
git checkout rebuild-2.0
npm install
npm run dev
```

Verified as of this README: `npm install` resolves cleanly, `npm run build` produces a working production bundle with zero errors, and `npm run lint` reports zero warnings.

### Stack

| Package | Why it's here |
|---|---|
| `react` / `react-dom` (19) | Core framework |
| `react-router-dom` (7) | Routes: `/`, `/island`, `/campus`, `/campus/cs`, `/campus/dorm`, `/campus-map` (redirect alias), `/campus-map/full` (legacy flat map), `/lesson/:lessonId`, `/settings` |
| `zustand` (5) | `lessonStore`, `progressStore`, `cousinStore`, `uiStore` |
| `framer-motion` (12) | Phase transitions, mascot expression changes, Passport panel slide-in |
| `konva` / `react-konva` (9) | The visualizer layer — per-shape hit detection for hover-highlight interaction |

No CSS framework (plain CSS + CSS Modules), no cloud backend (`localStorage` via Zustand persist is sufficient for a course-companion tool), no automated schema-validation library yet (QA is a manual checklist, `PRD.md` §12).

**A note on bundle size:** `lessonService.js` and `dialogueService.js` both use `import.meta.glob(..., { eager: true })`, bundling every lesson and dialogue file into the initial load. This keeps content authoring simple but means the bundle only grows as more content is written — worth revisiting (`eager: false` + dynamic `import()`) as it approaches the budget in `PRD.md` §15.

---

## Adding Content

- **New lesson:** add a file to `src/data/lessons/unit{N}/{N}.{M}.json` following the schema in `PRD.md` §8. Check §8.2 for required fields per structure type and §12 for the pre-merge checklist.
- **New unit:** define its `landmarks` array (`PRD.md` §8.6) and make sure every lesson is assigned to exactly one landmark — a unit without this silently produces no Passport progress.
- **New tutor dialogue:** open `src/data/dialogue/{cousinId}/`, add the file for that lesson ID if it doesn't exist yet, and write only the phase-level overrides — never touch the lesson's core file.
- **New tutor art:** cousin identity (including the `portrait` path) lives in `src/data/cousins/{id}.json`; sprite folders for the not-yet-started expression art already exist at `public/sprites/cousins/{id}/`, ready to receive the 6 expression PNGs when that art is produced.
- **New Story Mode beat or location:** add/edit a file in `src/data/locations/{id}.json` following the shape in `Story_Mode.md` §1 — no code change needed, `storyService.js` picks it up via `import.meta.glob`. New NPC dialogue layers or Tiny Choice text go in `src/data/npcs/{id}.json`.

Never hardcode a specific cousin's assets or dialogue path anywhere outside `services/dialogueService.js` and the sprite/portrait resolution logic in `components/cousin/CousinAvatar.jsx`.

---

## Part of Omega Mu Gamma Studio

SeeDS is one of the tools from Omega Mu Gamma Studio — a student-built suite of open-source engineering and CS education tools.

**The Chan series** (anime-guided programming tutors):

| Tool | Language |
|------|----------|
| [Java-Chan](https://github.com/Omega-Mu-Gamma-Studio/Java-Chan) | Java (CS22301) |
| [PlusPlus-Chan](https://plusplus-chan.vercel.app) | C++ |
| [Python-Chan](https://python-chan.vercel.app) | Python |
| [Rust-Chan](https://rust-chan.vercel.app) | Rust |
| [Go-Chan](https://go-chan.vercel.app) | Go |
| [Sharp-Chan](https://sharp-chan.vercel.app) | C# |
| [Kotlin-Chan](https://kotlin-chan.vercel.app) | Kotlin |

**Other studio tools:**

| Tool | What it does |
|------|-------------|
| **SeeDS** | Data-structures visualizer and bug detector — *this repo* |
| [KMapX](https://kmapx.vercel.app) | Boolean expression simplifier (Quine–McCluskey) |
| [EG Suite](https://eg-suite.vercel.app) | 3D Engineering Graphics simulator for ME22201 |
| [GateLab](https://gatelab.vercel.app) | 2D digital logic schematic playground (CS22303) |
| [ArchVisor](https://arch-visor.vercel.app) | Computer Organization & Architecture platform (CS22304) |
| [ThermOS](https://thermos-omg.vercel.app) | Interactive modules for Engineering Thermodynamics (ME22301) |
| [BlockBeats](https://github.com/Omega-Mu-Gamma-Studio/BlockBeats) | Block-based music production and DAW tutor |

---

## License

This project is licensed under the **[PolyForm Noncommercial License 1.0.0](https://polyformproject.org/licenses/noncommercial/1.0.0/)**.

You may use, modify, and share this software for **noncommercial purposes** only — personal study, hobby projects, education and research, and use by noncommercial organizations. **Commercial use of any kind is prohibited**, including as part of a paid product or service, without a separate agreement with Omega Mu Gamma Studio.

See the `LICENSE` file for the full, authoritative text.

© 2026 Omega Mu Gamma Studio
