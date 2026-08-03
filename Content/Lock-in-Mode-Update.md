# SeeDS — Next Major Update: Content Audit + Lock-In Mode

**Status:** Planning / pre-development
**Source material:** CS22302 – Data Structures, official Question Bank (Units 1–5, all Parts A & B), St. Xavier's Catholic College of Engineering
**Driving idea:** SeeDS teaches concepts well. It doesn't yet train students to *reproduce* what the exam actually asks for — specific routines, written cold, under time pressure, with the edge cases graders dock marks for. This update closes that gap in two phases.

---

## Why two phases, not one

Lock-In Mode (the exam-drill layer) only works for topics that already have real lesson content behind them — it repurposes the existing 5-phase engine's code/visual/break assets rather than inventing new ones. Cross-checking the question bank against what's actually built in `main` shows that's true for Units 1–2, but **not** for large parts of Units 3–6. Building the drill layer on top of those gaps would mean re-doing the work twice. So:

- **Phase 1 — Content Audit & Fill:** author the missing base lesson content (5-phase JSONs + any new visualizer support they need).
- **Phase 2 — Lock-In Mode:** build the exam-drill layer on top of a now-complete lesson base, mapped directly to the question bank's own question shapes and mark values.

---

## Phase 1: Content Audit

Legend: 🟢 already built and question-bank-aligned · 🟡 built but incomplete/misaligned · 🔴 not built at all

### Unit 1 — Lists — 🟢 complete
Singly/doubly/circular linked lists, array vs. linked-list tradeoffs, all core routines. Fully matches question bank Unit-1 Part-A/B (headers, polynomial representation, `Insert`/`Delete`/`FindPrevious`-style routines). No action needed.

### Unit 2 — Stacks & Queues — 🟢 complete
Stack/queue ADTs, array + linked implementations. Matches question bank Unit-2 (balancing symbols, infix↔postfix↔prefix conversion, circular queues, deques). No action needed.

### Unit 3 — Trees — 🔴 major gaps
Currently built: **Min Heap / Max Heap / Heap Sort only** (3 lessons, "The Heap Observatory").

Question bank Unit-3 also requires:
- 🔴 General tree fundamentals — node declaration, and **tree anatomy questions**: root, parent/children, leaves, siblings, depth, height, degree, path-between-nodes (bank Part-B Q2 asks for all sixteen of these on a single given tree — this is a distinct *reading* skill, not a routine, and needs its own question type, see Phase 2)
- 🔴 Binary trees — node declaration, traversal algorithms (inorder/preorder/postorder), and the **reconstruct-tree-from-two-traversals** question type (bank Part-A Q6)
- 🔴 Binary Search Trees — insert, delete, `retrieve`/search routine (bank explicitly asks: *"Write the routine for retrieve in a binary search tree"*), and step-by-step insertion sequences (e.g. inserting D,A,T,A,S,T,R,U,C,T,U,R,E,S one at a time)
- 🔴 Expression trees — construction from an infix expression, evaluation
- 🔴 AVL Trees — balance factor computation, minimum-nodes-at-height-h, rotation logic, step-by-step insertion with rebalancing
- 🔴 Threaded Trees — concept + advantages
- 🔴 B-Trees — implementation + example
- ⚪ **Out of scope for drilling:** the height-sum proof question (Part-B Q13i) is a mathematical derivation, not a routine — flagging so it doesn't get force-fit into Lock-In Mode later (see Phase 2 notes).

**Net new lessons needed:** roughly 6–8, depending on how BST/AVL/Threaded are split.

### Unit 4 — Graphs — 🔴 major gaps
Currently built: directed/undirected graphs, BFS, DFS (4 lessons, adjacency-list representation only, "The Bridge District").

Question bank Unit-4 also requires:
- 🔴 The other three graph representations — **adjacency matrix**, **incidence matrix**, **edge list** — plus conversion between a drawn graph and each of these (bank has one Part-A question per representation type)
- 🔴 In-degree/out-degree computation
- 🔴 Strongly-connected / biconnected / Euler circuit concepts
- 🔴 Topological Sort — algorithm + routine
- 🔴 Dijkstra's algorithm — routine + shortest-path-to-all-vertices trace
- 🔴 Minimum Spanning Tree — both **Prim's and Kruskal's**, worked on the same graph
- 🔴 Articulation points via DFS

**Net new lessons needed:** roughly 6–7.

### Units 5 & 6 (app) = Unit-5 (question bank) — Searching, Sorting, Hashing — 🟡 partial, misaligned
Currently built: Separate Chaining + Open Addressing (Unit 5, "The Hash Market"); Bubble/Quick/Merge/Shell/Radix Sort (Unit 6, "The Sorting Stadium").

Question bank Unit-5 requires:
- 🔴 Linear Search, Binary Search — algorithm + routine + result verification (**not built at all** — no searching content currently exists anywhere in the app)
- 🔴 **Selection Sort**, **Insertion Sort** (missing — bank asks for both explicitly; app has Quick Sort and Radix Sort instead, which the bank doesn't ask about — harmless to keep, but shouldn't be mistaken for covering the gap)
- 🟢 Bubble Sort, Merge Sort, Shell Sort — already covered
- 🟡 Hashing basics (hash function, load factor, choosing a hash function, collision strategies) — conceptually implied by existing 2 lessons but not explicit as standalone content
- 🔴 Double Hashing (bank includes a worked numeric example: `h1(k)=k mod 23`, `h2(k)=1+(k mod 19)`)
- 🔴 Rehashing
- 🔴 Extendible Hashing (bank includes a worked example inserting 15 binary keys with M=4)

**Net new lessons needed:** roughly 6, plus 2 sort lessons.

### Total picture
Out of the full CS22302 syllabus, **Units 1–2 are exam-ready today**; everything else needs meaningful new lesson authoring before Lock-In Mode can legitimately cover it. Recommend treating this as the actual "next big update" scope, with Lock-In Mode landing unit-by-unit as each unit's base content clears — starting with Units 1–2 immediately, since nothing blocks them.

---

## Phase 2: Lock-In Mode — Design

### What it is
An exam-drill mode layered on top of the existing 5-phase lesson engine, reusing its code/visual/data assets but restructuring the *sequence* around reproduction-under-pressure rather than first-time understanding. It is **not** a rebuild of the lesson engine — `NodeGraphRenderer`, `CodeBlock`, and the JSON lesson schema all carry over largely as-is.

### Naming: Lock-In Mode (+ Boss Round inside it)
- **Lock-In Mode** is the umbrella name and the persistent practice space — fits the existing Island → Campus → CS Block → Dorm theme as a distinct room (candidate: a "Library" or "Exam Hall" hotspot inside CS Block), and the term already carries the right cultural meaning (focused, no-distractions grind) for the target audience.
- **Boss Mode was considered and rejected as the umbrella name** — it implies a single gated finale, which is the wrong shape for spaced-repetition drilling. Instead, **"Boss Round"** is kept as an internal escalation tier: once a student has drilled a data structure's individual operations enough times, they unlock a Boss Round — reproduce the *entire* routine set for that structure, unaided, in one timed pass. This gives both metaphors a job they're actually good at.
- Optional flavor: none of the ten Gamma Cousins are written as strictly "drill sergeant," but **Florence** (dry, sarcastic, unflappable) or **Miyu** (calm, then surgical precision) both fit a mode that's meant to feel deliberately different in tone from the rest of the app.

### The three drill tracks
Mapped directly to the question bank's own mark values, so difficulty tiers come from the syllabus itself rather than being invented:

| Track | Mark tier | Mechanic | Existing asset reused |
|---|---|---|---|
| **Quickfire** | 2-mark recall/reasoning | MCQ, short fill, "which DS fits this scenario" — rapid, timed, high volume | Phase 5's test-challenge schema |
| **Routine Writer** | 2-mark "write a routine for X" | Write the actual C function from a near-blank editor; diffed against canonical code *and* a specific list of commonly-missed lines/edge cases (empty structure, single-node, boundary updates) | Phase 2 (code) + Phase 4 (break/bug schema, repurposed as a "did you include this line" checklist) |
| **Full Trace** | 16-mark multi-step questions | Chained operation sequences with visual state checked after each step — covers both "perform these N operations on structure X" (e.g. the 15-part linked-list address-tracing question) and "insert this sequence into an initially empty Y" (BST/AVL/heap construction) | Phase 3 visual schema (`NodeGraphRenderer`, `ArrayTreeDualRenderer`), extended to accept a step sequence instead of one static state |

### One new component this actually requires
**Representation-conversion drills** (Unit 4's adjacency matrix / adjacency list / incidence matrix / edge list questions) don't fit any of the three tracks above cleanly — the input is a drawn graph and the output is a table/grid the student fills in. This needs a small new fill-the-grid widget; everything else in this plan reuses existing pieces.

### Exam-fidelity requirement worth calling out explicitly
Several Full Trace questions (e.g. the linked-list tracing question with explicit memory addresses 888/526/362...) allocate real marks to correct address bookkeeping, not just structural correctness. If Full Trace mode is going to be genuinely exam-faithful, addresses need to be first-class, checkable fields in the visual schema — not decorative labels. This should be designed in from the start rather than retrofitted.

### Explicitly out of scope for Lock-In Mode v1
Proof/derivation-style questions (e.g. the perfect-binary-tree height-sum proof) test a different skill — worked mathematical reasoning, not timed reproduction — and shouldn't be forced into the drill format. Worth keeping in mind as a possible *separate*, non-drill feature later, not part of this update.

### Suggested rough data shape
```
src/data/drills/
  unit1/
    linkedlist-singly.json
    linkedlist-doubly.json
  unit2/
    stack.json
    queue.json
  ...

// per routine entry:
{
  "operation": "insertAt",
  "dsType": "singly-linked-list",
  "markTier": 2,               // 2 | 16
  "questionText": "Write a routine for ...",
  "canonicalCode": "...",
  "commonMistakes": [ /* reuses Phase 4's brokenCode/bugDescription shape */ ],
  "blankVariant": { /* fill-in-the-routine, scaffolded like Phase 5 code-fill but whole-function */ },
  "timeLimitSeconds": 180        // used for Boss Round
}
```
New store (`drillStore.js`, alongside `lessonStore.js`) tracks per-routine attempt count, best time, and lock-in status (e.g. 3 clean reps = "locked in").

### Recommended launch order
1. Units 1–2 Lock-In Mode — buildable today, zero content dependency.
2. Units 3–6 content fill (Phase 1 above), landing unit-by-unit.
3. Lock-In Mode extended to each unit as its content clears.

---

## Open questions for next discussion
- Exact split of Unit 3's tree content into individual lessons (BST/AVL/Threaded/B-Tree as separate lessons, or grouped?).
- Whether the representation-conversion widget is worth building generally, or scoped just to graphs for now.
- Confirming whether Boss Round should be gated behind Passport/Landmarks progress or purely attempt-count-based.