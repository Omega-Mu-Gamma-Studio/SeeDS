# SeeDS

**A 3D interactive data structures visualizer for CS22302 — Data Structures**

Built by [Omega Mu Gamma Studio](https://github.com/Omega-Mu-Gamma-Studio) · the team behind [KMapX](https://kmapx.vercel.app), [EG Suite](https://eg-suite.vercel.app), [GateLab](https://gatelab.vercel.app), and [Java-chan](https://github.com/Omega-Mu-Gamma-Studio/Java-Chan)

🔗 **[Live App — Standard Mode](https://see-ds.vercel.app)** · **[Playground Mode](https://see-ds.vercel.app/playground/)**

---

## What is SeeDS?

SeeDS is a browser-based 3D visualizer for data structures, built to cover the full CS22302 syllabus. It turns abstract pointer diagrams and traversal pseudocode into animated, interactive 3D scenes — structures you can manipulate, break, and explore in real time.

Every module is built around the same principle as the rest of Omega Mu Gamma Studio:

> **The broken structure is the explanation.**

A dangling pointer glowing red teaches memory management better than any footnote. A cycle lighting up teaches linked list failure modes better than any paragraph. SeeDS builds the failure first, then the fix.

---

## Modes

### Standard Mode
The full visualizer. Collapsible structure panel on the left, C code editor in the middle, 3D scene on the right. Select a data structure, load a scenario, step through operations, and explore error states.

**Standard Mode features:**
- Collapsible left panel with all data structures grouped by unit — click to expand groups, click a scenario to load it instantly
- Custom C syntax highlighter — no Monaco, no Ace, pure DOM + regex tokenizer
- Template selector dropdown — jump to any predefined C implementation
- `.c` / `.h` file upload via button or drag-and-drop — analyze your own code
- **Analyze & Visualize** button — runs a full pipeline (tokenizer → parser → struct detector → error detector → op generator → confidence scorer)
- Results panel: detected errors, summary, and confidence score
- Step-by-step playback — ⏮ Reset · ⏭ Step · ▶/⏸ Play/Pause
- Playback speed controls: 0.5× · 1× · 2× · 5×
- Progress bar and step counter (e.g. `3 / 7`)
- Node hover tooltips — hover any 3D node to see its value, memory address, connections, and error type
- Status bar — live DS type, operation count, error count, and FPS
- Light / dark theme toggle
- Fullscreen mode
- Camera reset button

### Playground Mode
A Scratch-style brick-based code construction interface. Students assemble a data structure by snapping together pre-written function "bricks." As each brick is placed, the 3D scene updates live — the structure builds itself in real time.

**Playground Mode features:**
- 20% / 30% / 50% three-panel layout: brick library · live C code · 3D scene
- Brick library panel — DS selector at the top, function bricks below; bricks are locked, available, or placed depending on dependency state
- Dependency engine — bricks unlock in logical order; placing the wrong one shows *why* it fails
- Hover any brick before placing to see a plain-English explanation, the C code, dependencies, and what changes in the 3D scene
- Live C code panel — updates as each brick is placed; no typing required
- 3D scene updates live with every brick
- All 8 structure renderers available in Playground: Linked List, Binary Tree, Stack, Queue, Graph, Hash Table, AVL Tree, Heap
- **6-theme color engine** (ThemeEngine + ThemePicker): **Void**, **Forest**, **Synthwave**, **Ember**, **Arctic**, **Slate** — syncs CSS custom properties and Three.js material palettes simultaneously
- Theme persists across sessions (localStorage)

---

## What It Covers

SeeDS maps directly to the CS22302 syllabus. The table below reflects the actual state of the app.

### Standard Mode — Live Scenarios

| Group | Structure | Live Scenarios |
|-------|-----------|---------------|
| Lists | Linked List | ✓ Normal · ↺ Cycle · ⚠ Dangling · ⛁ Memory Leak · 🐛 With Bugs |
| Lists | Doubly List | ✓ Doubly Linked · ❌ Broken Prev |
| Lists | Circular List | ↻ Circular · ❌ Broken Tail |
| Stack & Queue | Stack | ✓ Stack ADT · ⛔ Overflow |
| Stack & Queue | Queue | ✓ Queue ADT · ⛔ Underflow |
| Trees | Binary Tree | ✓ BST Search · ❌ BST Violation · 💥 Null Deref |
| Trees | AVL Tree | ✓ AVL Tree · ⚖ Unbalanced · ↺ Right-Left Case |
| Trees | Heap | ✓ Min-Heap · ✓ Max-Heap · ❌ Heap Violation |
| Graphs | Graph + BFS | ✓ Graph + BFS · → Directed Graph · ⚡ Disconnected |
| Hash & Arrays | Hash Table | ✓ Separate Chaining · 💥 Collision |
| Hash & Arrays | Array | ✓ Linear Search · ✓ Binary Search |
| Sorting | Sort Race | ▶ Bubble / Merge / Quick · ▶ Insertion Sort |

### Standard Mode — Coming Soon

| Group | Item |
|-------|------|
| Stack & Queue | Circular Queue · DeQueue |
| Trees | Expression Tree |
| Graphs | Topological Sort · Dijkstra's · Prim's MST · Kruskal's MST |
| Hash & Arrays | Open Addressing |
| Sorting | Merge Sort · Shell Sort · Radix Sort |

### Error Types Detected & Visualized

The error panel identifies and highlights: `dangling_pointer` · `cycle` · `memory_leak` · `missing_null` · `bst_violation` · `null_dereference` · `double_free` · `out_of_bounds` · `buffer_overflow`

Each error is clickable — clicking it highlights the relevant node in the 3D scene.

---

## Syllabus Coverage

| CS22302 Topic | Status |
|---------------|--------|
| Singly, Doubly, Circular Linked Lists | ✅ Live |
| Stack and Queue ADT, Applications | ✅ Live |
| Binary Tree, BST, AVL Tree | ✅ Live |
| Heaps (Min + Max) | ✅ Live |
| Graphs — BFS, Directed, Disconnected | ✅ Live |
| Hashing — Separate Chaining, Collision | ✅ Live |
| Linear Search, Binary Search | ✅ Live |
| Sorting — Bubble, Insertion, Merge, Quick (Sort Race) | ✅ Live |
| Circular Queue, DeQueue | 🚧 Coming Soon |
| Expression Tree | 🚧 Coming Soon |
| Topological Sort, Dijkstra, Prim, Kruskal | 🚧 Coming Soon |
| Open Addressing | 🚧 Coming Soon |
| Polynomial ADT, Multi Lists | 🚧 Coming Soon |

---

## Tech Stack

- Vanilla JavaScript + Three.js (vendored, no CDN dependency)
- No build step — runs directly in the browser
- No external libraries — custom C tokenizer, parser, and syntax highlighter built in-house
- Deployed on Vercel

---

## Running Locally

```bash
git clone https://github.com/Omega-Mu-Gamma-Studio/SeeDS.git
cd SeeDS
```

**Standard Mode:** open `index.html` via a local server (e.g. VS Code Live Server, or `npx serve .` from the repo root).

**Playground Mode:** navigate to `/playground/` from the same server (`http://localhost:3000/playground/`).

> The app uses ES modules — a local server is required. Opening `index.html` directly as a `file://` URL will not work.

---

## Repository Structure

```
SeeDS/
├── index.html                  Standard Mode entry point
├── playground/
│   ├── index.html              Playground Mode entry point
│   ├── bricks/                 Brick definitions (one JSON per DS)
│   ├── styles/                 Playground-only CSS
│   └── src/
│       ├── core/               PlaygroundApp, ThemeEngine, constants
│       ├── state/              PlaygroundState, DependencyEngine
│       ├── renderer/           SceneManager, StructureRenderer
│       ├── structures/         8 structure renderers (Playground)
│       └── ui/                 BrickPanel, CodePanel, HoverCard, ThemePicker
├── src/
│   ├── core/                   app.js, eventBus, constants
│   ├── analyzer/               tokenizer → parser → structDetector → errorDetector → opGenerator → confidenceScorer
│   ├── renderer/               SceneManager, NodeMesh, EdgeMesh, LabelSprite, ErrorHighlight, AnimationLoop, PlaybackController
│   ├── structures/             10 structure modules (Standard Mode)
│   └── ui/                     AlgoPanel, CodePanel, ErrorPanel, InfoTooltip, PlaybackBar, StatusBar, Toolbar
├── data/                       JSON scenario files (36 scenarios)
├── styles/                     Standard Mode CSS
├── vendor/three/               Three.js (vendored)
└── docs/                       architecture, error-types, json-schema (in progress)
```

---

## Part of Omega Mu Gamma Studio

SeeDS is one of five tools from Omega Mu Gamma Studio, a student-built suite of open-source engineering and CS education tools.

| Tool | What it does |
|------|-------------|
| SeeDS | 3D data structure visualizer (CS22302) — *this repo* |
| [KMapX](https://kmapx.vercel.app) | Karnaugh map simplifier with don't-care support |
| [EG Suite](https://eg-suite.vercel.app) | 3D Engineering Graphics simulator (ME22201) |
| [GateLab](https://gatelab.vercel.app) | 3D digital logic playground (CS22303) |
| [Java-chan](https://github.com/Omega-Mu-Gamma-Studio/Java-Chan) | Anime-guided Java tutor (CS22301) |

---

## Team

| Name | Role |
|------|------|
| [@albertofelix08](https://github.com/albertofelix08) | Architecture, 3D engine, project lead |
| [@aaronmcgeo](https://github.com/aaronmcgeo) | Structures, animations, co-lead |
| [@ashikhabrigid](https://github.com/ashkihabrigid) | Logic verifier, domain & correctness expert |

*A project by [Omega Mu Gamma Studio](https://github.com/Omega-Mu-Gamma-Studio) — a multipurpose creative studio building games, interactive experiences, and developer tools.*

---

## License

MIT License · © 2026 Omega Mu Gamma Studio
