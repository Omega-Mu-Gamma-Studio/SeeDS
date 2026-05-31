<div align="center">

# 🌱 SeeDS

**See** your **D**ata **S**tructures — a 3D C code visualizer for students

[![Live Demo](https://img.shields.io/badge/Live%20Demo-see--ds.vercel.app-5b8ff7?style=for-the-badge&logo=googlechrome&logoColor=white)](https://see-ds.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-4fc97e?style=for-the-badge)](LICENSE)

*Paste your C code. Watch your data structure come alive in 3D. Catch bugs before your professor does.*

</div>

---

SeeDS is a browser-based tool for students taking Data Structures in C. Paste a `.c` file and SeeDS parses it, identifies the data structure, flags common pointer bugs with line numbers and suggested fixes, then renders an interactive 3D scene with step-by-step playback. No install, no account, no backend.

**[Open SeeDS →](https://see-ds.vercel.app)**

---

## How it works

1. **Paste or drag-drop** your `.c` file into the editor — or pick one of the built-in templates
2. Hit **▶ Analyze & Visualize**
3. SeeDS detects the data structure automatically (with a confidence score) and builds the 3D scene
4. **Rotate** the view by clicking and dragging; scroll to zoom
5. **Step through** pointer traversal with the playback bar at the bottom
6. **Click any error** in the results panel to highlight the buggy node directly in 3D

---

## Bug detection

SeeDS scans for the pointer and memory bugs C students hit most:

| Bug | What it catches |
|-----|-----------------|
| Dangling Pointer | `free()` called but pointer still in use |
| Memory Leak | `malloc()`'d block that never gets freed |
| Cycle / Loop | A `next` pointer that creates an infinite loop |
| Missing NULL Terminator | List tail doesn't end with `NULL` |
| NULL Dereference | Pointer dereferenced before a NULL check |
| Double Free | `free()` called twice on the same block |
| BST Violation | Left child > parent, or right child < parent |
| Out of Bounds | Array access past declared length |
| Buffer Overflow | Write past the end of an allocated block |

Every finding includes the line number, a plain-English explanation, and a suggested fix.

---

## Template library

No C file handy? Load a built-in example:

Singly Linked List · Doubly Linked List · Circular Linked List · Stack · Queue · Circular Queue · Deque · Binary Search Tree · AVL Tree · Max Heap · Hash Table · Graph · Array Operations · Sorting Race

---

## Tech stack

- **Vanilla JavaScript (ES Modules)** — no framework, no bundler
- **Three.js** — 3D rendering and orbit controls
- **Custom C tokenizer + parser** — full analysis pipeline, runs entirely client-side
- **Vercel** — hosting

---

## Roadmap

- [x] Linked List (singly, doubly, circular)
- [x] Stack, Queue, Deque
- [x] Binary Search Tree + AVL Tree
- [x] Graph, Hash Table, Max Heap
- [x] Sorting race visualization
- [x] 9 bug detection patterns
- [x] Syntax-highlighted C editor with drag-and-drop
- [x] Light / dark theme + fullscreen mode
- [ ] Red-Black Tree
- [ ] Trie
- [ ] Export visualization as image / GIF
- [ ] Share a visualization via URL

---

## Contributing

Active development is on the `lol` branch. PRs are welcome — especially new structure visualizations (Red-Black Tree, Trie, Skip List) and additional bug detection patterns.

1. Fork the repo
2. Branch off `lol`
3. Open a pull request

---

## License

[MIT](LICENSE) — free to use, study, modify, and share.

---

<div align="center">

Built by [@albertofelix08](https://github.com/albertofelix08) & [@aaronmcgeo](https://github.com/aaronmcgeo)

*If SeeDS helped you understand pointers, a ⭐ goes a long way*

</div>
