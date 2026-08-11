# SeeDS — Next Major Update: Content Audit + Lock-In Mode

**Status:** Phase 2 (Lock-In Mode) — Units 1 & 2 implementation complete, Units 3–6 pending Phase 1 content fill
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

**2026-08-11 update:** original "complete" call was at the operation-*category* level (insert/delete/traverse existed), but routine *granularity* was thin against Weiss ch.3 — audited against the actual textbook chapter and closed the gap on singly linked list: added `is_empty`, `find`, `find_previous`, `insert_after` (position-based, distinct from the existing `insertAtEnd`), and `delete_list` (with the free-before-saving-next use-after-free bug as a `commonMistakes` trap on Routine Writer — this is Weiss's own "incorrect way to delete a list" example). Doubly/circular left as-is: Weiss ch.3 doesn't give concrete routine code for those, only the concept, and the existing insertAfter/delete/traversal ops already cover the concrete side.

### Unit 2 — Stacks & Queues — 🟢 complete
Stack/queue ADTs, array + linked implementations. Matches question bank Unit-2 (balancing symbols, infix↔postfix↔prefix conversion, circular queues, deques). No action needed.

**2026-08-11 update:** same routine-depth audit as Unit 1, against Weiss ch.3 stack/queue sections. Added `is_empty`/`top` to stack and `is_empty`/`is_full` to queue (all previously missing despite being named in the question bank's Part-A list). Bigger gap: `evaluatePostfix` and `infixToPostfix` were entirely absent as routines even though Weiss's own worked examples for both (`6 5 2 3 + 8 * + 3 + *` and `a + b * c + ( d * e + f ) * g`) are exactly Part-B-shaped — added both as 16-mark ops with Routine Writer + Full Trace tracks, the trace steps mirroring Weiss's worked examples stack-state-by-stack-state so they're gradeable against the textbook's own answer. Not yet done: prefix conversion/evaluation, and a dedicated array/stack visual renderer (Full Trace currently falls back to text `note` per step for these two since `VisualizerDispatch` has no stack-shaped renderer — `node-graph`/`array-tree-dual` would misrepresent a stack; flagging as a future renderer gap rather than faking one in).

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

# Data Structures - Question Bank

## Unit-3: Trees

### Part-A (2 Marks)

1. Define a tree. [2 ReCO3]
2. How will you implement a tree with its node declaration? [2 UnCO3]
3. What are the applications of Trees? [2 ReCO3]
4. Define binary tree. [2 ReCO3]
5. Write the implementation of a binary tree with its node declarations. [2 ReCO3]
6. Construct a binary tree from the following tree traversals:
   - Inorder traversal: 3,1,4,0,5,2
   - Preorder traversal: 0,1,3,4,2,5
   - Postorder traversal: 3,4,1,5,2,0
   
   [2 ApCO3]

7. What do you mean by an expression tree? [2 UnCO3]
8. Draw the expression tree for (2x + y)(5a – b). [2 UnCO3]
9. Write the routine for retrieve in a binary search tree. [2 ReCO3]
10. How will you compute the Balancing Factor for an Adelson-Velsky and Landis tree? [2 ReCO3]
11. What is the minimum number of nodes in an AVL tree of height 15? [2 UnCO3]
12. What is the advantage of using threaded trees? [2 UnCO3]
13. Differentiate percolate up and percolate down operations. [2 UnCO3]
14. Differentiate structure property and heap order property. [2 UnCO3]
15. Give the basic model of a Priority Queue (Heaps). [2 ReCO3]
16. What are the several ways to implement a priority queue? [2 ReCO3]
17. What are the applications of Priority queue? [2 ReCO3]

---

### Part-B (16 Marks)

**1.** What are the various types of trees along with definition and applications? Discuss the preliminaries of a tree with an example. [16 UnCO3]

**2.** Find the following tree preliminaries:
   - (i) Root node
   - (ii) Parent for the Node E and its children
   - (iii) Leaves in the tree
   - (iv) Possible siblings level-by-level
   - (v) Depth of the tree
   - (vi) Height of the tree
   - (vii) Height of the Node B
   - (viii) Depth of the Node C
   - (ix) Number of edges in the tree
   - (x) Internal Nodes
   - (xi) Degree of F
   - (xii) Path between A and M
   - (xiii) Children of A
   - (xiv) Depth of C
   - (xv) Height of B
   - (xvi) Number of the nodes in the tree

[16 UnCO3]

**3.** Discuss Tree Traversals with its algorithm. By applying the algorithm, find the sequence of nodes by the various tree traversals. [16 ApCO3]

**4.** Illustrate the step-wise algorithm and construction of an expression tree for:
   `a + b * c – d / e ^ f % g`
   
   [16 ApCO3]

**5.** Explain the implementation of Binary Search Tree (BST) ADT. [16 UnCO3]

**6.** By applying the concept of BST, show the step-by-step result of inserting:
   `D, A, T, A, S, T, R, U, C, T, U, R, E, S`
   into an initially empty binary search tree.
   
   [16 ApCO3]

**7.** (i) Show the result of inserting `3, 1, 4, 6, 9, 2, 5, 7` into an initially empty binary search tree. (12 Marks)
   (ii) Show the result of deleting the root. (4 Marks)
   
   [16 ApCO3]

**8.** Explain the implementation of Adelson-Velsky and Landis Trees. [16 UnCO3]

**9.** Show the step-by-step result of inserting:
   `1, 3, 5, 7, 19, 17, 15, 13, 11, 9, 0`
   into an initially empty AVL tree.
   
   [16 ApCO3]

**10.** Discuss Threaded Trees in detail. [16 UnCO3]

**11.** Discuss the implementation of Binary Heap. [16 UnCO3]

**12.** Show the result of inserting (Building/Heapify):
   `10, 12, 1, 14, 6, 5, 8, 15, 3, 9, 7, 4, 11, 13, and 2`
   one at a time, into an initially empty binary heap.
   
   [16 ApCO3]

**13.** (i) For the perfect binary tree of height h containing `2^(h+1) – 1` nodes, prove that the sum of the heights of the nodes is `2^(h+1) – 1 – (h+1)`. (8 Marks)
   
   (ii) For the binary heap (H) (shown below), show the results for the following operations:
   - (a) DecreaseKey (2,11,H)
   - (b) IncreaseKey(3,65,H)
   - (c) Delete(1,H)
   
   (8 Marks) [16 ApCO3]

**14.** Perform the following operations in sequence with relevant illustrations for the input sequence:
   `31, 41, 59, 26, 53, 58, 97`
   
   (i) BuildHeap (H)
   (ii) DeleteMin (H)
   (iii) DecreaseKey (6,39,H)
   (iv) IncreaseKey (2,10,H)
   (v) DecreaseKey (6,1,H)
   (vi) Delete (5,H)
   (vii) Insert (100,H)
   
   [16 ApCO3]

**15.** Discuss the implementation of B-Tree with a suitable example. [16 UnCO3]

---

## Unit-4: Graphs

### Part-A (2 Marks)

1. Define graph. [2 ReCO4]
2. Differentiate the types of Graph. [2 UnCO4]
3. Write the adjacency matrix for the following graph. [2 UnCO4]
4. Write the adjacency matrix for the following graph. [2 UnCO4]
5. Write the adjacency list representation for the following graph. [2 UnCO4]
6. Write the incidence matrix for the graph. [2 UnCO4]
7. Write the edge list representation for the graph. [2 UnCO4]
8. Find out the in-degree and out-degree of each node in the given graph. [2 UnCO4]
9. What do you mean by undirected graph? [2 UnCO4]
10. What do you mean by biconnected graph? [2 UnCO4]
11. What do you mean by Euler Circuits? [2 UnCO4]
12. What do you mean by directed graph? [2 UnCO4]
13. How will you test whether a directed graph is strongly connected or not? [2 UnCO4]
14. Differentiate Breadth-first traversal and Depth-first traversal. [2 UnCO4]
15. What are the applications of Graph? [2 ReCO4]
16. Which algorithm is notable for its parallelizability with respect to Minimum Spanning Tree? [2 UnCO4]

---

### Part-B (16 Marks)

**1.** Discuss the graph terminologies and representation of graphs. [16 UnCO4]

**2.** Discuss Breadth-first traversal and Depth-first traversal with its algorithm and example. [16 UnCO4]

**3.** Discuss the applications of Depth First Search. [16 UnCO4]

**4.** Explain Topological Sort with its algorithm, routine and example. [16 UnCO4]

**5.** Explain Shortest path algorithms in detail. [16 UnCO4]

**6.** Apply an appropriate algorithm to find the shortest path from "v1" to all other vertices for the graph given below. [16 ApCO4]

**7.** Discuss Dijkstra's algorithm with its routine and example. [16 UnCO4]

**8.** Explain Minimum Spanning Tree in detail. [16 UnCO4]

**9.** Find a minimum spanning tree for the graph using both Prim's and Kruskal's algorithms. [16 ApCO4]

**10.** How will you apply Depth-First Search to find all the articulation points in a connected graph (given below)? [16 ApCO4]

---

## Unit-5: Searching, Sorting & Hashing

### Part-A (2 Marks)

1. Define Searching. [2 ReCO5]
2. Differentiate Linear Search and Binary Search. [2 UnCO5]
3. Which searching algorithm is best suited to find a student inside a classroom? Why? [2 UnCO5]
4. Which searching algorithm is best suited to find a student inside a exam hall? Why? [2 UnCO5]
5. What are the various factors to be considered in deciding a sorting algorithm? [2 UnCO5]
6. Differentiate internal sorting and external sorting. [2 UnCO5]
7. Define hashing. [2 ReCO5]
8. Define hash function. [2 ReCO5]
9. How will you choose a hash function? [2 UnCO5]
10. Give any four real-world applications of hash functions. [2 UnCO5]
11. What are the applications of hashing? [2 ReCO5]
12. What are the collision resolution strategies? [2 ReCO5]
13. Define load factor. [2 ReCO5]
14. Consider a double hashing scheme in which the primary hash function is `h1(k) = k mod 23`, and the secondary hash function is `h2(k) = 1 + (k mod 19)`. Assume that the table size is 23. Then the address returned by probe 1 in the probe sequence (assume that the probe sequence begins at probe 0) for key value `k = 90` is _______. [2 ApCO5]
15. Differentiate primary clustering and secondary clustering. [2 UnCO5]
16. Show the result of inserting the keys:
   `10111101, 00000010, 10011011, 10111110, 01111111, 01010001, 10010110, 00001011, 11001111, 10011110, 11011011, 00101011, 01100001, 11110000, 01101111`
   into an initially empty extendible hashing data structure with M = 4.
   
   [2 ApCO5]

---

### Part-B (16 Marks)

**1.** Discuss the algorithm, program and verify the results for Linear Search. [16 UnCO5]

**2.** Discuss the algorithm, program and verify the results for Binary Search. [16 UnCO5]

**3.** Discuss the algorithm, routine, analysis, program and result verification for Bubble sort. [16 UnCO5]

**4.** Discuss the algorithm, routine, analysis, program and result verification for Selection sort. [16 UnCO5]

**5.** Discuss the algorithm, routine, analysis, program and result verification for Insertion sort. [16 UnCO5]

**6.** Discuss the algorithm, routine, analysis, program and result verification for Shell sort. [16 UnCO5]

**7.** Discuss the algorithm, routine, analysis, program and result verification for Merge Sort. [16 UnCO5]

**8.** Explain Separate Chaining with its routines and example. [16 UnCO5]

**9.** Explain Open Addressing with its routines and example. [16 UnCO5]

**10.** (i) How will you implement Rehashing with an example? (08 Marks)
   (ii) How will you implement Extendible Hashing with an example? (08 Marks)
   
   [16 UnCO5]

**11.** Given input `{4371, 1323, 6173, 4199, 4344, 9679, 1989}` and a hash function `h(x) = x(mod 10)`, show the result of using:
   - a. Separate chaining hash table
   - b. Open addressing hash table using linear probing
   - c. Open addressing hash table using quadratic probing
   - d. Open addressing hash table with second hash function `h2(x) = 7 - (x mod 7)`
   - e. Rehashing the hash tables
   
   [16 ApCO5]

---

## Lock-In Mode — Implementation Progress

### Units 1 & 2: ✅ Complete

All files are authored, wired, and ready. No further work needed before these can ship.

#### New files created

**Data — drill JSON (maps directly to question bank)**
```
src/data/drills/
  unit1/
    linkedlist-singly.json   — node decl, insertAtEnd (w/ fullTrace), delete, traversal
    linkedlist-doubly.json   — node decl, insertAfter (4-pointer wiring), delete
    linkedlist-circular.json — makeCircular, do-while traversal
    stack.json               — push, pop, balancing-symbols routine (Part-B Q3)
    queue.json               — enqueue, dequeue, deque concept
  unit2/
    bst.json                 — node decl, insert, retrieve (Part-A Q9), delete, DATASTRS trace (Part-B Q6)
    avl.json                 — balance factor, min nodes at height 15 (Part-A Q11), rotateRight, insert sequence (Part-B Q9)
    expression-tree.json     — concept, traversal→notation, evaluate routine, construct from infix (Part-B Q4)
```

**Store**
```
src/store/drillStore.js
```
Zustand store, persisted under `seeds:drills`. Tracks per-operation attempt count, clean reps, best time, lock-in status (3 clean reps), Boss Round unlock and completion per drill.

**Service**
```
src/services/drillService.js
```
Mirrors lessonService.js — `import.meta.glob` over `src/data/drills/*/*.json`. Zero code changes needed to add a new drill file.

**UI components**
```
src/components/drill/
  QuickfireCard.jsx      — MCQ + fill-in, timed, self-reporting
  RoutineWriter.jsx      — code textarea + checklist diff against canonicalCode/commonMistakes
  FullTrace.jsx          — step-by-step reveal, self-assessed, progress bar
  DrillProgress.jsx      — per-operation pip indicators + lock-in status
  BossRound.jsx          — all quickfire + routineWriter tasks back-to-back, timed globally
  DrillComponents.css    — all component styles, uses SeeDS design tokens
```

**Pages**
```
src/pages/DrillHub.jsx / DrillHub.css   — entry screen, drills by unit, Boss Round status
src/pages/DrillPage.jsx / DrillPage.css — drill session: operation picker (left), track tabs + card (right)
```

**Wiring**
- `src/App.jsx` — routes `/drill` → DrillHub, `/drill/:drillId` → DrillPage
- `src/pages/CSBlock.jsx` — "Lock-In Mode" hotspot added alongside Staff Room

#### Lock-in mechanics

| Threshold | Effect |
|---|---|
| 3 clean reps on one operation | Operation marked 🔒 locked in |
| All operations locked in for a drill | Boss Round unlocked for that drill |
| Boss Round finished | Drill marked 🏆 complete |

"Clean" for Quickfire = correct answer within time limit. For RoutineWriter = all `commonMistakes` key lines present, within time limit. For FullTrace = self-assessed (always clean if finished within time).

---

### Next steps — in order

**1. Phase 1 content fill (Units 3–6)** — prerequisite before Lock-In Mode can extend beyond Units 1–2.

Priority order given question bank coverage:
- **Unit 3 — Trees** (~6–8 new lessons): general tree node/anatomy, binary tree traversals + reconstruct-from-two-traversals, BST ADT (lesson exists in Unit 2 app but needs to move/extend), AVL full implementation, threaded trees, B-trees
- **Unit 5 — Searching/Sorting/Hashing** (~8 new lessons): linear + binary search, selection sort, insertion sort, double hashing, rehashing, extendible hashing
- **Unit 4 — Graphs** (~6–7 new lessons): adjacency matrix / incidence matrix / edge list representations, topological sort routine, Dijkstra's routine, Prim's + Kruskal's, articulation points

**2. Extend Lock-In Mode per unit as content clears**

Once Unit 3 lessons are authored, add `src/data/drills/unit3/` — same drill JSON schema, zero new code needed. Same for Units 4–5.

Drill files to author for Unit 3 (when content clears):
```
unit3/
  binary-tree.json         — node decl, inorder/preorder/postorder traversal routines, reconstruct-from-traversals
  bst-unit3.json           — retrieve routine (Part-A Q9 is explicitly this), insert/delete, DATASTRS trace
  avl-unit3.json           — balance factor, min-nodes-at-h, rotateRight/rotateLeft, insert-with-rebalance trace
  expression-tree.json     — already authored ✅ (lives in unit2/, is Unit 3 content by bank — move or alias)
  heap.json                — percolateUp, percolateDown, buildHeap, deleteMin, the 15-element insertion trace (Part-B Q12)
```

**3. Representation-conversion widget** (Unit 4 graphs)

The adjacency matrix / adjacency list / incidence matrix / edge list Part-A questions require a fill-the-grid input widget — not covered by any existing drill track. Needs a new `GridFill` component alongside the existing three tracks. Low priority until Unit 4 content fill is done.

**4. Boss Round — consider Passport gating**

Currently Boss Round is purely attempt-count-based (all ops locked in). The open question from the original spec — whether to also require the corresponding Passport landmark to be sealed — is still open. Recommend keeping attempt-count-only for now and revisiting once Boss Round has been tested.

**5. FullTrace — address-level fidelity**

The linked-list Part-B question in the question bank allocates marks to correct memory address bookkeeping (e.g. addresses 888/526/362...). The current FullTrace step schema has an `expectedVisual` field that can carry address data, but the renderer doesn't check it — it's self-assessed. Making addresses checkable fields is future work if exam fidelity at that level becomes a priority.
