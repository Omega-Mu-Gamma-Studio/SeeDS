# SeeDS

**A 3D interactive data structures visualizer for CS22302 — Data Structures**

Built by [Omega Mu Gamma Studio](https://github.com/Omega-Mu-Gamma-Studio) · the team behind [KMapX](https://kmapx.vercel.app), [EG Suite](https://eg-suite.vercel.app), [GateLab](https://gatelab.vercel.app), and [Java-chan](https://github.com/Omega-Mu-Gamma-Studio/Java-Chan)

🔗 **[Live App — Standard Mode](https://see-ds.vercel.app)** &nbsp;·&nbsp; **[Playground Mode](https://see-ds.vercel.app/playground/)**

---

## What is SeeDS?

SeeDS is a browser-based 3D visualizer for data structures and their bugs — built to cover the complete CS22302 syllabus. It turns abstract pointer diagrams and traversal pseudocode into animated, interactive 3D scenes you can manipulate, break, and explore in real time.

Every module is built around the same philosophy as the rest of Omega Mu Gamma Studio:

> **The broken structure is the explanation.**

A dangling pointer glowing red teaches memory management better than any footnote. A cycle lighting up teaches linked list failure modes better than any paragraph. A heap violation rendered node-by-node teaches property invariants better than a textbook theorem. SeeDS builds the failure first, then the fix.

---

## Modes

SeeDS has two fully independent interfaces, each designed for a different stage of learning.

### Standard Mode

The full visualizer. A collapsible structure panel on the left, a C code editor in the middle, and a live 3D scene on the right. Select a data structure, load any of the 55 pre-built scenarios, paste or upload your own C code, and step through operations frame by frame.

**Features:**

- Collapsible left panel with all data structures grouped by unit — click to expand a group, click a scenario to load it instantly
- Custom C syntax highlighter — no Monaco, no Ace, pure DOM + regex tokenizer built in-house
- Template selector dropdown — jump to any predefined C implementation instantly
- `.c` / `.h` file upload via button or drag-and-drop — load and analyze your own code
- **Analyze & Visualize** button — runs a full 6-stage analysis pipeline: tokenizer → parser → struct detector → error detector → op generator → confidence scorer
- Results panel: clickable detected errors, plain-English summary, and confidence score
- Step-by-step playback — ⏮ Reset · ⏭ Step · ▶/⏸ Play/Pause
- Playback speed controls: 0.5× · 1× · 2× · 5×
- Progress bar and step counter (e.g. `3 / 7`)
- Node hover tooltips — hover any 3D node to see its value, memory address, connections, and error type
- Status bar — live DS type, operation count, error count, and FPS
- Light / dark theme toggle
- Fullscreen mode
- Camera reset button

### Playground Mode

A Scratch-style brick-based interface. Students build a data structure function by function — snapping together pre-written C "bricks" — while the 3D scene updates live with every brick placed. No typing, no blank-page problem, just structured discovery.

**Features:**

- 20% / 30% / 50% three-panel layout: brick library · live C code · 3D scene
- Brick library panel — DS selector at the top, function bricks below; bricks are locked, available, or placed depending on dependency state
- Dependency engine — bricks unlock in logical order; placing the wrong one tells you *why* it fails
- Hover any brick before placing to see a plain-English explanation, the C code, its dependencies, and what changes in the 3D scene
- Live C code panel — updates in real time as each brick is placed; no typing required
- 3D scene updates live with every brick
- All 8 structure renderers available in Playground: Linked List, Binary Tree, Stack, Queue, Graph, Hash Table, AVL Tree, Heap
- **6-theme color engine** (ThemeEngine + ThemePicker): **Void** · **Forest** · **Synthwave** · **Ember** · **Arctic** · **Slate** — syncs CSS custom properties and Three.js material palettes simultaneously
- Theme persists across sessions (localStorage)

---

## What It Covers

SeeDS maps directly to the CS22302 syllabus. Every structure listed below is live in the app with at least one scenario — most have multiple, including bug scenarios.

### Syllabus Coverage

| CS22302 Topic | Status | Scenarios |
|---|---|---|
| Singly Linked List | ✅ Live | Normal · Cycle · Dangling Pointer · Memory Leak |
| Doubly Linked List | ✅ Live | Normal · Broken Prev Pointer |
| Circular Linked List | ✅ Live | Normal · Broken Tail |
| Stack ADT | ✅ Live | Normal · Stack Overflow |
| Queue ADT | ✅ Live | Normal · Underflow |
| Circular Queue | ✅ Live | Normal · Full · Wrap-around |
| DeQueue (Double-Ended Queue) | ✅ Live | Normal · Mixed Operations |
| Binary Tree (BST) | ✅ Live | BST Search · BST Violation · Null Dereference |
| AVL Tree | ✅ Live | Balanced · Unbalanced · Right-Left Case |
| Expression Tree | ✅ Live | In-Order Traversal · Post-Order Traversal |
| Heap (Min + Max) | ✅ Live | Min-Heap · Max-Heap · Heap Violation |
| Graph + BFS | ✅ Live | Undirected · Directed · Disconnected |
| Topological Sort | ✅ Live | Normal · Cycle Detection |
| Dijkstra's Algorithm | ✅ Live | Shortest Path · Directed · Negative Edge |
| Prim's MST | ✅ Live | Minimum Spanning Tree |
| Kruskal's MST | ✅ Live | Minimum Spanning Tree |
| Hashing — Separate Chaining | ✅ Live | Normal · Collision |
| Hashing — Open Addressing | ✅ Live | Linear Probing · Quadratic · Collision · Delete · Overflow |
| Linear Search | ✅ Live | Array Search |
| Binary Search | ✅ Live | Binary Search |
| Sorting — Bubble / Quick / Insertion | ✅ Live | Sort Race · Insertion Sort |
| Merge Sort | ✅ Live | Normal · Already-Sorted Input |
| Shell Sort | ✅ Live | Normal · Worst Case |
| Radix Sort | ✅ Live | Normal · 2-Digit Variant |

**55 scenario files · 21 structure modules · Full syllabus coverage.**

### Error Types Detected & Visualized

The analyzer identifies and 3D-highlights the following error types — each is clickable in the error panel, jumping the camera to the offending node:

| Error Type | What It Catches |
|---|---|
| `dangling_pointer` | Pointer to freed memory |
| `cycle` | Linked list with no null terminator |
| `memory_leak` | malloc() with no matching free() |
| `missing_null` | Missing null terminator on list end |
| `bst_violation` | Node placed in the wrong BST subtree |
| `null_dereference` | Dereferencing a null or uninitialized pointer |
| `double_free` | Calling free() on an already-freed pointer |
| `out_of_bounds` | Array access beyond allocated size |
| `buffer_overflow` | Writing past the end of a buffer |

---

## Tech Stack

| Layer | Technology |
|---|---|
| 3D rendering | [Three.js](https://threejs.org) (vendored — no CDN dependency) |
| Language | Vanilla JavaScript (ES Modules) |
| C analysis pipeline | Custom tokenizer, parser, struct detector, error detector, op generator, confidence scorer — all built in-house |
| C syntax highlighting | Custom DOM + regex tokenizer — no Monaco, no Ace |
| Styling | Plain CSS with custom properties (no framework) |
| Build system | None — runs directly in the browser |
| Deployment | [Vercel](https://vercel.com) |

No `npm install`. No bundler. No external runtime dependencies. Open the HTML file in a local server and it works.

---

## Running Locally

```bash
git clone https://github.com/Omega-Mu-Gamma-Studio/SeeDS.git
cd SeeDS
```

**Standard Mode:** open `index.html` via a local server.

```bash
# Option 1 — VS Code Live Server (click "Go Live" in the status bar)
# Option 2 — npx
npx serve .
# Then open http://localhost:3000
```

**Playground Mode:** navigate to `/playground/` from the same server.

```
http://localhost:3000/playground/
```

> **Important:** SeeDS uses ES Modules. Opening `index.html` directly as a `file://` URL will **not** work — a local server is required for both modes.

---

## Repository Structure

```
SeeDS/
├── index.html                   Standard Mode entry point
├── playground/
│   ├── index.html               Playground Mode entry point
│   ├── bricks/                  Brick definitions — one JSON per structure
│   ├── styles/                  Playground-only CSS (layout, bricks, hovercard, themes)
│   └── src/
│       ├── core/                PlaygroundApp.js, ThemeEngine.js, constants.js
│       ├── state/               PlaygroundState.js, DependencyEngine.js
│       ├── renderer/            SceneManager.js, StructureRenderer.js
│       ├── structures/          8 Playground structure renderers
│       └── ui/                  BrickPanel.js, CodePanel.js, HoverCard.js, ThemePicker.js
├── src/
│   ├── core/                    app.js, eventBus.js, constants.js
│   ├── analyzer/                tokenizer.js → parser.js → structDetector.js
│   │                              → errorDetector.js → opGenerator.js → confidenceScorer.js
│   ├── renderer/                SceneManager.js, NodeMesh.js, EdgeMesh.js, LabelSprite.js,
│   │                              ErrorHighlight.js, AnimationLoop.js, PlaybackController.js
│   ├── structures/              21 structure modules (Standard Mode)
│   └── ui/                      AlgoPanel.js, CodePanel.js, ErrorPanel.js,
│                                  InfoTooltip.js, PlaybackBar.js, StatusBar.js, Toolbar.js
├── data/                        55 JSON scenario files
├── styles/                      Standard Mode CSS
├── vendor/three/                Three.js (vendored)
├── assets/                      favicon.svg
└── docs/                        architecture, error-types, json-schema (in progress)
```

---

## Part of Omega Mu Gamma Studio

SeeDS is one of five tools built by Omega Mu Gamma Studio, a student-run open-source engineering and CS education studio at St. Xavier's Catholic College of Engineering.

| Tool | What it does |
|---|---|
| **SeeDS** | 3D data structure visualizer & bug detector (CS22302) — *this repo* |
| [KMapX](https://kmapx.vercel.app) | Karnaugh map simplifier with don't-care support |
| [EG Suite](https://eg-suite.vercel.app) | 3D Engineering Graphics simulator (ME22201) |
| [GateLab](https://gatelab.vercel.app) | 3D digital logic playground (CS22303) |
| [Java-chan](https://github.com/Omega-Mu-Gamma-Studio/Java-Chan) | Anime-guided interactive Java tutor (CS22301) |

---

## Team

| Name | Role |
|---|---|
| [@albertofelix08](https://github.com/albertofelix08) | Architecture · 3D engine · C analysis pipeline · Project lead |
| [@aaronmcgeo](https://github.com/aaronmcgeo) | UI integration · Structures · Co-lead |
| [@ashikhabrigid](https://github.com/ashkihabrigid) | Logic verification · Domain & correctness expert |

---

## License

MIT License · © 2026 Omega Mu Gamma Studio
