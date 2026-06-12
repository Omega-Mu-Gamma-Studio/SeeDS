# SeeDS — Playground Mode

This folder contains **Phase 3: Playground Mode** — a fully isolated, interactive learning interface built alongside the existing standard visualizer (Phase 1/2).

## What it is

A Scratch-style brick-based interface where students build C data structures function by function. Three panels:
- **20% left** — Brick library (DS selector + function bricks)
- **30% middle** — Live C code panel (updates as bricks are placed)
- **50% right** — Three.js 3D scene (updates live with each brick)

## How to run it locally

Open `playground/index.html` directly in your browser (via a local server — e.g. VS Code Live Server or `npx serve .` from the repo root). Then navigate to `/playground/`.

Standard mode (`index.html`) is completely unaffected.

## Build order

Follow the spec document exactly:
1. `Phase 3a` — Linked List, Binary Tree
2. `Phase 3b` — Stack, Queue
3. `Phase 3c` — Graph, Hash Table, AVL Tree, Heap

Start with `src/state/PlaygroundState.js` and `src/state/DependencyEngine.js` — everything else reads from them.

## Isolation rules

- **Do NOT import from `../src/`** — that's standard mode code.
- **Only `../vendor/three/` is shared** with standard mode.
- All brick data lives in `bricks/*.json`. Nothing is hardcoded in JS files.

## File map

```
playground/
├── index.html                  Entry point
├── styles/
│   ├── playground.css          20/30/50 layout
│   ├── bricks.css              Brick button states
│   └── hovercard.css           Hover popup
├── bricks/
│   └── *.json                  Brick definitions — one per DS
└── src/
    ├── core/
    │   ├── PlaygroundApp.js    Main controller (wire everything here)
    │   └── constants.js        DS type names and labels
    ├── state/
    │   ├── PlaygroundState.js  Single source of truth ← start here
    │   └── DependencyEngine.js Brick lock/available/placed logic
    ├── renderer/
    │   ├── SceneManager.js     Three.js scene/camera/lights/loop
    │   └── StructureRenderer.js Maps scene_events → structure renderers
    ├── structures/
    │   ├── LinkedList.js       Phase 3a — implement first
    │   ├── BinaryTree.js       Phase 3a
    │   ├── Stack.js            Phase 3b
    │   ├── Queue.js            Phase 3b
    │   ├── Graph.js            Phase 3c
    │   ├── HashTable.js        Phase 3c
    │   ├── AVLTree.js          Phase 3c
    │   └── Heap.js             Phase 3c
    └── ui/
        ├── BrickPanel.js       20% panel — DS selector + brick list
        ├── CodePanel.js        30% panel — live C code
        └── HoverCard.js        Hover popup singleton
```

## Refer to the spec

Full implementation spec: `SeeDS_Phase3_Implementation_Guide.pdf` (in the project drive).
Pay attention to Section 05 (architecture), Section 09 (build order), and Section 10 (common mistakes).
