# SeeDS

**A 3D interactive data structures visualizer for CS22302 — Data Structures**

Built by [Omega Mu Gamma Studio](https://github.com/Omega-Mu-Gamma-Studio) · the team behind [KMapX](https://kmapx.vercel.app), [EG Suite](https://eg-suite.vercel.app), [GateLab](https://gatelab.vercel.app), and [Java-chan](https://github.com/Omega-Mu-Gamma-Studio/Java-Chan)

🔗 **[Live App](https://see-ds.vercel.app)**

---

## What is SeeDS?

SeeDS is a browser-based 3D visualizer for data structures, built to cover the full CS22302 syllabus. It turns abstract pointer diagrams and traversal pseudocode into animated, interactive 3D scenes — structures you can manipulate, break, and explore in real time.

Every module is built around the same principle as the rest of the Omega Mu Gamma Studio:

> **The broken structure is the explanation.**

A dangling pointer glowing red teaches memory management better than any footnote. A cycle lighting up teaches linked list failure modes better than any paragraph. SeeDS builds the failure first, then the fix.

---

## What It Covers

SeeDS maps directly to the CS22302 syllabus across all five units.

| Unit | Topic | Status |
|------|-------|--------|
| I | Lists — Singly, Doubly, Circular, Polynomial ADT, Radix Sort | ✅ Live |
| II | Stacks and Queues — Operations, Circular Queue, DeQueue | ✅ Live |
| III | Trees — BST, AVL, Heaps, Expression Trees, B-Tree | 🔧 In Progress |
| IV | Graphs — BFS, DFS, Dijkstra, Prim, Kruskal | 🔧 In Progress |
| V | Searching, Sorting, and Hashing | 🔧 Planned |

---

## Modes

### Standard Mode
The full visualizer. Code editor on the left, 3D scene on the right. Step through operations, trigger animations, and explore error states like dangling pointers, memory leaks, and cycles.

### Playground Mode *(Phase 3 — In Development)*
A Lego-style block-based code construction interface. Students assemble a data structure by snapping together pre-written function "bricks." As each brick is placed, the 3D scene updates live — the structure builds itself in front of them.

- Every brick is a real C function from the SeeDS codebase — nothing is fabricated
- No typing required — click or drag to place, the code writes itself
- Hover any brick before placing to see a plain-English explanation, the C code, dependencies, and what changes in the 3D scene
- Wrong brick order shows *why* it broke, not a silent failure
- Once complete, the brick panel collapses into a full syntax-highlighted C implementation
- "Open in Visualizer" hands the assembled structure off to Standard Mode for deeper exploration

---

## Key Features

- **3D visualizations** built with Three.js — nodes, arrows, pointers, and traversal animations
- **Error states as content** — dangling pointers, cycles, and memory leaks are first-class visual events
- **Step-by-step playback** — walk through operations one step at a time
- **Live code panel** — see the C implementation alongside the 3D scene
- **Playground Mode** *(in development)* — brick-based structure assembly with live 3D feedback

---

## Tech Stack

- Vanilla JavaScript + Three.js
- No build step — runs directly in the browser
- Deployed on Vercel

---

## CS22302 Syllabus Coverage

| Topic | Coverage |
|-------|----------|
| Singly, Doubly, Circular Linked Lists | ✅ |
| Polynomial ADT, Radix Sort, Multi Lists | ✅ |
| Stack and Queue ADT, Applications | ✅ |
| Circular Queue, DeQueue | ✅ |
| Binary Tree, BST, AVL, Expression Trees | 🔧 In Progress |
| Heaps, B-Tree, Threaded Trees | 🔧 In Progress |
| Graphs — BFS, DFS, Topological Sort | 🔧 In Progress |
| Dijkstra, Prim, Kruskal | 🔧 In Progress |
| Searching — Linear, Binary | 🔧 Planned |
| Sorting — Bubble, Selection, Insertion, Shell, Merge | 🔧 Planned |
| Hashing — Separate Chaining, Open Addressing | 🔧 Planned |

---

## Part of the Omega Mu Gamma Studio

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
| [@ashikhabrigid] | Logic verifier, Domain & correctness expert |

*A project by [Omega Mu Gamma Studio](https://github.com/Omega-Mu-Gamma-Studio) — a multipurpose creative studio building games, interactive experiences, and developer tools.*

---

## License

MIT License · © 2026 Omega Mu Gamma Studio
