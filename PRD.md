# SeeDS 2.0 — Master Product Requirements Document

**Studio:** Omega Mu Gamma Studio
**Repo:** Omega-Mu-Gamma-Studio/SeeDS (same repo, wiped and rebuilt from scratch)
**Course target:** CS22302 — Data Structures
**Status:** Pre-development, locked spec
**Lead:** Alberto (project lead, solo content author for v1)

---

## 1. Why This Rebuild Exists

SeeDS 1.0 was a Three.js-based data structure visualizer. Beta feedback surfaced one
structural verdict that outweighs every individual bug report:

> "It feels like you need to understand the concepts in order to get the visuals —
> isn't that supposed to be the other way around?"

Every specific bug found in that round (mislabeled node values, missing `prev`
pointers in tooltips, an "OK" stack demo that was visually indistinguishable from an
overflow, circular lists conflated with cycle bugs, unclear dangling-pointer/leak
visuals, an invisible stack TOP indicator) was a *symptom* of the same root cause:
**a value or state that existed in the data model had no explicit, unambiguous
visual signal.** SeeDS 2.0 does not fix this by rewriting the same architecture more
carefully — it fixes this by restructuring the entire learning flow so a concept is
never shown before it's explained, and by baking hard requirements into the lesson
data schema so the missing-signal class of bug is structurally awkward to reintroduce.

**This is a full rebuild, not a reskin.** No code is carried over by default. Old
concepts, data, or utilities may be salvaged opportunistically during build if
genuinely reusable (see §9), but nothing is inherited automatically.

---

## 2. Mission & Philosophy

A visual-first, mascot-guided learning platform for the complete CS22302 syllabus.
Students with C knowledge but no DS background should emerge understanding both
the *concept* and its *C implementation* — never one without the other.

**Core philosophy:** *"The code explains the visual. The visual explains the code."*

- Concept before code
- Code before visualization
- Visualization validates understanding
- Breaking code teaches *why* it works

---

## 3. Target Audience

| Attribute | Description |
|---|---|
| Primary | CS students who know C but haven't taken Data Structures |
| Secondary | Self-learners with basic C knowledge |
| Not for | Absolute beginners who don't know C |
| Outcome | Understand DS concepts *and* their C implementation, in tandem |

---

## 4. The 5-Phase Learning Model

Every lesson runs through five phases in strict sequence. No phase is optional to
build, though a lesson may skip phases 4/5 only where explicitly justified (see §7,
sorting lessons).

| # | Name | What Happens | Format |
|---|---|---|---|
| 1 | Understand | Mascot explains concept in plain English, no code, no visual | Text + mascot dialogue |
| 2 | See the Code | Full working C implementation, key lines emphasized | Syntax-highlighted code panel |
| 3 | See the Visual | Two-column: code (left) ↔ visual (right); hover either side, the other highlights | Interactive 2D Konva rendering |
| 4 | See the Break | Two-column: broken code ↔ broken visual, mascot explains the bug | Konva rendering + diff highlighting |
| 5 | Test | Click-target, MCQ, or fix-the-code challenge | Immediate feedback, mascot reaction |

### Phase detail notes

- **Phase 3 hover-mapping is the single riskiest engineering surface in the whole
  product** (two independent rendering systems — a code panel and a Konva canvas —
  must stay in sync on hover state). Prototype this on Lesson 1.1 before treating it
  as settled for all 22 lessons.
- **Phase 5 grading is intentionally simple, per decision in §11**: MCQ/click-target
  = exact match against a single correct answer; code-fill = exact string match
  against the accepted answer(s). No fuzzy matching — C's syntax for defining these
  structures doesn't vary enough to need it. Provide up to 3 attempts with an
  escalating hint from `hints[]` before revealing `solution`.

---

## 5. Tutor / Character System

SeeDS 2.0 does not ship with a single fixed mascot. It ships with a **selectable
tutor system** — a roster of characters ("the Gamma Cousins") who all teach the
exact same lesson content, differing only in dialogue voice. Full character
personalities, palettes, and design rules live in a separate, app-agnostic
document: **`GAMMA_COUSINS.md`** — that document is the source of truth for who
these characters are; this section covers only how SeeDS specifically wires them in.

### 5.1 v1 launch voice

SeeDS launches with a **neutral default narrator** as the only fully-authored
voice — no accent, no personality bit, plain pedagogical dialogue for all 22
lessons. This is the permanent fallback voice, not a placeholder. Lesson content
gets built and proven against this voice first; a Gamma Cousin's full dialogue
pack (all 22 lessons, one specific personality) gets written afterward, once
content is stable, against already-working lesson beats. Which cousin gets a full
pack first is not decided yet, and doesn't need to be before v1 ships.

### 5.2 Content/dialogue decoupling (architecture)

Lesson content (concept, code, visual data, bug description, challenge) is
**mascot-agnostic**. Per-phase `mascotDialogue` fields inside a lesson JSON (§8)
hold only the **neutral default** version of each dialogue beat. Character voice
lives in a separate, parallel structure:

```
lessons/{lessonId}.json              — core content, neutral dialogue (fallback)
characters/{characterId}.json        — identity: name, palette, sprite refs (see Character Bible)
dialogue/{characterId}/{lessonId}.json — voiced override of that lesson's dialogue beats, if written
```

### 5.3 Dialogue resolution (fallback chain)

At render time, for a given lesson + phase + currently selected character:

```
1. dialogue/{characterId}/{lessonId}.json  → phase.mascotDialogue, if it exists
2. lessons/{lessonId}.json                 → phase.mascotDialogue (neutral default)
```

This means a cousin can have **zero lessons written** and the app never breaks —
it silently falls back to the neutral voice for any lesson she doesn't have a
pack for yet. Cousins can be added to the roster incrementally, forever, without
ever requiring 100% dialogue coverage to function.

### 5.4 Selection UX

- Character is selected once (e.g. at onboarding), stored in a `characterStore`,
  and is **changeable anytime from settings**.
- Switching characters only changes *who's talking* — `progressStore` (completed
  lessons, XP, streak) is entirely independent of which character narrated any
  given lesson. Switching voices never resets or affects progress.

```javascript
// characterStore
{ selectedCharacter: 'default' | 'miyu' | 'scout' | ..., unlockedCharacters: ['default'] }
```

### 5.5 Art & asset notes

- Flat 2D vector style, each cousin gets her own palette (see Character Bible §2),
  distinct from the Chan series' palette conventions.
- Expression set follows the existing studio sprite convention: `teaching`
  (default), `excited`, `thinking`, `oops`, `frustrated`, `idle` — same shape
  already proven on Java-Chan. Every cousin shares this same expression *set*;
  only her illustrated style/palette differs.
- Asset production is not treated as a blocker — the studio already has a proven
  sprite/expression pipeline.

### 5.6 Portability note

The Gamma Cousins are explicitly designed to be reusable outside SeeDS, for any
future Omega Mu Gamma Studio product that teaches a *subject* rather than a
*programming language* (languages remain Chan-series territory). Whether the
character-resolution code itself becomes a shared module across apps, versus
staying SeeDS-local and being re-implemented per app, is an open decision — not
blocking for v1, and doesn't need to be resolved until a second consuming app
exists. The **content** (personalities, voices, design rules) is kept
app-agnostic in `GAMMA_COUSINS.md` regardless of that future code decision, so
porting a cousin to a new app later is a content-reuse problem, not a rewrite.

---

## 6. Syllabus Coverage

**Build order: strict syllabus order, Unit 1 → 6.** No engineering-risk reordering.

| Unit | Topics | # Lessons | Special Features |
|---|---|---|---|
| 1 | Singly, Doubly, Circular Lists | 3 | Cycle-vs-circular disambiguation (see §8.3), broken pointers |
| 1 | Stack, Queue | 2 | Overflow/underflow visualization |
| 2 | BST, AVL, Expression Trees | 3 | Rotations, traversal stepping |
| 3 | Min Heap, Max Heap, Heap Sort | 3 | Dual array+tree view |
| 4 | Directed/Undirected Graphs, BFS, DFS | 4 | Step-by-step traversal |
| 5 | Separate Chaining, Open Addressing | 2 | Collision animation |
| 6 | Bubble, Quick, Merge, Shell, Radix Sort | 5 | Dedicated non-node/edge visualizer (see §7) |
| | **Total** | **22 lessons** | |

**Timeline:** soft target of "before this semester ends." No hard milestone dates in
this document — build in syllabus order and let real pace set the schedule.

**Content authoring:** solo-authored by Alberto, lesson by lesson, directly against
the fixed JSON schema in §8. No CMS/authoring tool is being built for v1 — the schema
itself needs to be tight enough that hand-authoring in JSON is not error-prone,
which is why §8 is the most heavily specified section in this document.

### 6.1 The Passport / Landmarks System

Discovered-in-the-wild during v1 build and now a permanent, required part of the
product — not optional worldbuilding flavor. Units are not presented to the
student as bare "Unit 1, Unit 2" labels; each unit is subdivided into named,
illustrated **landmarks** (e.g. Unit 1 contains "The Chainworks" covering the
three list lessons, and "The Stack & Queue Yard" covering Stack/Queue), and
student progress is tracked as stamps in an in-app **Passport**, sealed with a
wax-crest once every lesson under a landmark is completed.

**This is now a required field on every unit file, not an optional flourish.**
`lessonService.getLandmarkForLesson()` and `progressStore.completeLesson()`'s
stamp/seal bookkeeping both depend on every unit defining its `landmarks` array
consistently. A unit file authored without one will silently produce no passport
stamps for that unit — no error, just a quiet gap. Treat this as load-bearing
schema, covered formally in §8.6.

**Onboarding is gated on cousin selection.** The app does not render its normal
routes until a cousin has been chosen at least once (`cousinStore.hasSelectedAdvisor`) —
first launch shows only the cousin picker. This refines §5.4: selection isn't
just "available at onboarding," it's a hard gate before anything else loads.
Changeable anytime afterward from Settings, as originally specified.

---

## 7. Rendering Architecture — Renderer Is Not One-Size-Fits-All

SeeDS 1.0 hard-coded one rendering approach per structure file (`LinkedList.js`,
`Stack.js`, etc.), which made anything that didn't fit the "spheres and arrows"
metaphor awkward to support. SeeDS 2.0 decouples **lesson content** from
**visualization type** via an explicit dispatch field:

```json
"visual": {
  "rendererType": "node-graph" | "bars" | "buckets" | "array-tree-dual",
  "data": { ... }
}
```

- `node-graph` — lists, trees, graphs, hash chaining (nodes + edges, the "classic" view)
- `bars` — comparison-based sorts (bubble/quick/merge/shell): value-as-height, swap/compare highlighting
- `buckets` — radix sort: digit-bucket distribution view
- `array-tree-dual` — heaps: simultaneous array-index view and tree view, kept in sync

Each `rendererType` maps to its own component under `utils/visualRenderers/`. Adding
a new visualization style later means adding a new case to the dispatch table, not
touching existing renderers.

---

## 8. Lesson JSON Schema (Fixed Format)

This schema is the actual product of the "will I have to worry about authoring being
error-prone" conversation — every field that was *silently optional* in the old PRD
and caused a real bug last round is now either `required` or has an explicit
validation rule called out below the schema.

### 8.1 Top-level lesson object

```json
{
  "id": "1.1",
  "title": "Singly Linked List",
  "unit": 1,
  "topics": ["insertion", "deletion", "traversal", "cycle"],
  "xp": 10,
  "phases": {
    "1": { "concept": "...", "analogy": "...", "mascotDialogue": "..." },
    "2": { "code": "...", "highlightLines": [3, 5, 7], "mascotDialogue": "..." },
    "3": {
      "code": "...",
      "visual": { "rendererType": "node-graph", "data": { "nodes": [...], "edges": [...] } },
      "mascotDialogue": "...",
      "mapping": { "line3": "node1", "line5": "arrow1" }
    },
    "4": {
      "brokenCode": "...",
      "brokenVisual": { "rendererType": "node-graph", "data": { "nodes": [...], "edges": [...] } },
      "bugDescription": "...",
      "mascotDialogue": "..."
    },
    "5": {
      "challengeType": "visual-fix" | "code-fill" | "multiple-choice",
      "question": "...",
      "answer": "...",
      "hints": ["...", "..."],
      "solution": "..."
    }
  }
}
```

### 8.2 Node object shape, per structure type (required fields)

This table exists specifically because the old tooltip silently omitted `prev` for
DLLs and nobody caught it until a beta tester did. These fields are **required**,
not optional, for any lesson of the given structure type:

| Structure type | Required node fields |
|---|---|
| Singly Linked List | `id`, `value`, `next`, `address` |
| Doubly Linked List | `id`, `value`, `next`, `prev`, `address` |
| Circular (Singly or Doubly) | all fields above for the variant, **plus** the wraparound edge(s) must be present in `edges[]` explicitly — for circular DLL, both `tail.next → head` AND `head.prev → tail` must be present, not just one direction |
| Tree (BST/AVL/Expression) | `id`, `value`, `left`, `right`, `address`; AVL additionally requires `balanceFactor` |
| Heap | `id`, `value`, `arrayIndex`, `parentIndex` |
| Graph | `id`, `value`, `adjacency: []`, `visited: boolean` (for BFS/DFS lessons) |
| Hash table (chaining) | `bucketIndex`, `chain: [node, node, ...]` where each chained node follows Singly Linked List shape |
| Hash table (open addressing) | `slotIndex`, `value`, `probeSequence: []` |

### 8.3 Structure-variant disambiguation (required enum)

Any lesson touching circularity or a broken-pointer bug must declare which one it
is — this field did not exist in the old PRD and is the direct fix for the "circular
list vs cycle bug" confusion:

```json
"structureVariant": "linear" | "circular" | "cyclic-bug"
```

- `"circular"` = intentional design (e.g., `tail.next → head`). Render with a
  distinct "valid" visual treatment (e.g. closed-loop styling, no warning color).
- `"cyclic-bug"` = unintentional back-edge shown as a Phase 4 bug. Render with
  warning styling (color break, icon) distinct from `"circular"`.
- These must **never** share a visual treatment. A lesson cannot be ambiguous about
  which one it's demonstrating.

### 8.4 Demo-state validation rule (checklist, not schema-enforced — see §12)

```json
"demoState": "healthy" | "broken"
```

Rule: any lesson phase marked `"demoState": "healthy"` for a capacity-bound
structure (stack, queue, hash table) **must** show visible headroom — i.e. current
size strictly less than max capacity. This was the exact "stack ADT looked like an
overflow" bug from the old build. This is a lightweight checklist item (§12), not an
automated validator, per the "keep QA lightweight" decision.

### 8.5 Sorting lessons (Unit 6) — schema deviation

Sorting lessons use `rendererType: "bars"` or `"buckets"` instead of node/edge data,
and skip the node-shape requirements in §8.2 entirely — `visual.data` instead holds
an array of values plus a `comparisons`/`swaps` step log for the animation to play
through. Phase 4 ("See the Break") is **optional** for sorting lessons specifically,
since a swap-based algorithm doesn't have a meaningful broken-pointer-style bug
state the way pointer-based structures do — if a lesson has no meaningful Phase 4,
omit it rather than manufacturing a forced bug.

### 8.6 Unit Metadata Schema (Required — Landmarks/Passport)

Every `data/units/unit{N}.json` file must follow this shape. `landmarks` is
**required**, not optional — see §6.1 for why a missing one silently breaks
passport stamping for that unit:

```json
{
  "unit": 1,
  "title": "The Chainworks & The Stack and Queue Yard",
  "icon": "chain-link",
  "landmarks": [
    {
      "id": "chainworks",
      "name": "The Chainworks",
      "sublabel": "1a",
      "topics": ["Singly Linked List", "Doubly Linked List", "Circular Linked List"],
      "visualHook": "A workshop strung with actual chain-link — some chains loop back on themselves (circular, calm blue), some just stop (broken pointer).",
      "lessons": ["1.1", "1.2", "1.3"]
    }
  ],
  "lessons": ["1.1", "1.2", "1.3", "1.4", "1.5"]
}
```

Rule: every lesson ID listed in the top-level `lessons` array must appear in
exactly one `landmarks[].lessons` array. A lesson belonging to zero landmarks
gets no path to a passport stamp; a lesson belonging to two is ambiguous about
which seal it contributes to. Check this by hand per §12 until it's worth
automating.

---

## 9. Salvage Policy

Nothing is carried over automatically. During the rebuild, if a concept, utility, or
piece of content from SeeDS 1.0 is genuinely reusable (e.g. C-syntax-highlighting
logic, phrasing from an existing lesson explanation), it may be salvaged at the
point of building that specific piece — evaluated case by case, not decided upfront.

---

## 10. Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend | React 19 + Vite | |
| State | Zustand + persist | Wrap `localStorage` access behind a `progressStore` API — never call `localStorage` directly elsewhere in the app, so the backing store can be swapped later without a rewrite |
| Visualization | Konva + react-konva | Chosen over raw Canvas/SVG specifically because Phase 3/4 hover-highlighting needs per-shape hit detection and easy re-styling, which Konva's shape-object model gives for free |
| Animation | Framer Motion | UI transitions, mascot expression changes |
| Routing | React Router v7 | Lesson navigation |
| Styling | Plain CSS + CSS Modules | No framework overhead |
| Persistence | localStorage via Zustand persist | Confirmed sufficient — no cloud/account backend needed for a course companion tool |
| Deployment | Vercel | Zero-config |

### 10.1 Dependencies

```json
{
  "react": "^19.x",
  "react-dom": "^19.x",
  "vite": "^8.x",
  "zustand": "^5.x",
  "konva": "^9.x",
  "react-konva": "^18.x",
  "framer-motion": "^12.x",
  "react-router": "^7.x"
}
```

### 10.2 Device scope

Desktop-first. Tablet should basically work (no dedicated tablet-specific layout
work, but nothing should actively break at tablet width). No mobile commitment.

---

## 11. Feature Specifications

### 11.1 Core Features (all P0 unless noted)

| Feature | Description |
|---|---|
| Mascot | 2D sprite, 6 expressions (teaching/excited/thinking/oops/frustrated/idle) |
| Code Panel | Syntax-highlighted C, line highlights |
| Konva Visual | 2D rendering per `rendererType` dispatch (§7) |
| Two-Column Layout | Phase 3 & 4 only |
| Interactive Mapping | Bidirectional hover highlight, code ↔ visual |
| Step Controls | P1 — Phase 3/4 for algorithms (traversal, sorting) |
| Progress Tracking | P1 — localStorage via `progressStore`, tracks completed lessons |
| Dark/Light Mode | P1 |
| Lesson Navigation | P1 — sidebar, all 22 lessons, completion status |
| Challenge Feedback | P1 — immediate mascot reaction + visual feedback |
| Responsive | P2 — desktop primary, tablet acceptable |

### 11.2 Topic-Specific Features

| Feature | Topics | Priority |
|---|---|---|
| Rotation Animation | AVL Trees | P1 |
| Step-by-Step Traversal | BST, Graphs, BFS, DFS | P1 |
| Dual View (Array+Tree) | Heaps | P1 |
| Probing Animation | Hashing | P1 |
| Comparison/Swap Animation | Sorting | P2 |
| Circular-vs-Cyclic Distinct Styling | Linked Lists | P0 — direct fix for a known confusion, not optional polish |
| Balance Factor Display | AVL Trees | P1 |

### 11.3 Visual Design Principles

1. **Color coding** (structure elements — mascot palette is separate, TBD per §5):
   - Nodes: Blue `#4A90D9`
   - Data: White text on blue
   - Pointers: Orange `#F5A623`
   - NULL: Gray `#999`
   - Broken/cyclic-bug: Red `#E74C3C`
   - Highlight (hover mapping): Yellow `#FFD700`
   - Circular (intentional): distinct from broken — do not reuse red; recommend a calm green or the base blue with a closed-loop icon
2. **Typography:** Code = monospace (Fira Code / JetBrains Mono); mascot dialogue and labels = Inter
3. **Layout:** Sidebar left (lesson nav), content center (5-phase container), mascot bottom-right or integrated with content
4. **Animation timing:** phase transitions 0.3s fade, highlight mapping 0.2s glow, bug appearance 0.5s pulse, node insertion 0.5s slide-in, rotation 0.5s ease-in-out

---

## 12. QA Approach — Lightweight Lesson Checklist

Per decision: no automated schema validation, no visual regression suite for v1.
Every lesson gets checked against this list before being considered done. This
checklist exists **specifically because these exact mistakes happened last time**:

- [ ] Does every node object include all required fields for its structure type (§8.2)?
- [ ] If DLL/circular DLL: is `prev` present and does the wraparound edge exist in both directions?
- [ ] Is `structureVariant` set explicitly, and does `"circular"` vs `"cyclic-bug"` get visually distinct treatment?
- [ ] If `demoState: "healthy"` on a capacity-bound structure: is there visible headroom (size < max)?
- [ ] Does Phase 4's broken visual differ from Phase 3's in a way visible without hovering?
- [ ] Do arrows/edges anchor to the actual node shape, never to a label/text element?
- [ ] Does the mascot dialogue in Phase 1 assume zero prior DS knowledge?

---

## 13. Architecture

### 13.1 Component Hierarchy

```
App
├── Layout
│   ├── Sidebar (Lesson navigation)
│   │   ├── UnitList
│   │   └── LessonItem (completion status)
│   ├── MainContent
│   │   ├── PhaseContainer
│   │   │   ├── Phase1 (Understand)
│   │   │   ├── Phase2 (Code)
│   │   │   ├── Phase3 (Code + Visual)
│   │   │   ├── Phase4 (Broken Code + Visual)
│   │   │   └── Phase5 (Test)
│   │   ├── Mascot (bottom-right)
│   │   └── Controls (prev/next, step counter)
│   └── Footer (progress bar, theme toggle)
├── stores
│   ├── lessonStore (current lesson, phase)
│   ├── progressStore (completed lessons, XP — wraps localStorage)
│   └── uiStore (theme, sidebar open, mascot expression)
└── utils
    ├── codeHighlighter (C syntax highlighting)
    ├── visualRenderers/
    │   ├── nodeGraph.js
    │   ├── bars.js
    │   ├── buckets.js
    │   └── arrayTreeDual.js
    ├── challengeValidators (exact-match answer checking)
    └── dataLoader (load + lightly validate lesson JSON against §8)
```

### 13.2 State Shape

```javascript
// lessonStore
{ currentLesson: '1.1', currentPhase: 1, currentStep: 0, completed: false }

// progressStore (localStorage key: seeds:progress)
{
  completedLessons: ['1.1', '1.2'],
  totalXP: 150,
  level: 2,
  streak: 3,
  lastActiveDate: '2026-07-04',
  stamps: { chainworks: { lessonsDone: ['1.1', '1.2'], sealed: false } },
  newStampsSinceOpen: 0,
}

// cousinStore (localStorage key: seeds:cousin)
{
  selectedCousin: 'default',
  hasSelectedAdvisor: false,   // gates the whole app until true — see §6.1
  unlockedCousins: ['default', 'scout', 'mei', ...],  // all unlocked by default in current build
}

// uiStore
{ theme: 'dark' | 'light', sidebarOpen: true, mascotExpression: 'teaching' }
```

---

## 14. User Journey

### 14.1 New User Flow
1. Landing: mascot greeting + "Start Learning" CTA
2. Lesson 1.1 (Singly Linked List): Phase 1 → 2 → 3 → 4 → 5, XP awarded, progress saved
3. Lesson 1.2 onward: same flow, syllabus order

### 14.2 Returning User Flow
1. Landing: mascot welcome-back + progress summary
2. Pick lesson from sidebar, or resume in-progress lesson
3. Jump to a phase or restart from Phase 1

---

## 15. Non-Functional Requirements

| Requirement | Specification |
|---|---|
| Performance | < 2s initial load, 60fps animations |
| Compatibility | Chrome, Firefox, Safari (latest 2 versions) |
| Responsive | Desktop primary, tablet acceptable, no mobile commitment |
| Offline | Not required |
| Accessibility | Keyboard navigation, ARIA labels on interactive elements |
| Bundle size | < 1MB initial, < 3MB total |
| Maintainability | Modular components, JSON-based content |
| Extensibility | New lessons addable via JSON alone, no code changes |

---

## 16. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Phase 3/4 hover-mapping complexity | Delays, sync bugs between code panel and Konva canvas | Prototype on Lesson 1.1 alone before committing pattern to all 22 |
| Same class of bug reappearing in new code | Repeat of beta feedback despite rebuild | §8 required fields + §12 checklist target the *pattern*, not just old code |
| Solo content authoring, no second reviewer | Errors ship unnoticed | §12 lightweight checklist is the safety net — treat it as non-negotiable per lesson |
| Content volume (22 lessons) | Large scope for one author | Strict syllabus-order build lets partial progress still be a coherent, shippable product |
| Sorting lessons forced into node/edge metaphor | Poor fit, weak visuals | §7 dispatch architecture gives sorting its own `bars`/`buckets` renderer instead |
| Any single character's voice mismatched to content | Forces a personality decision before content is proven | v1 ships on the neutral default narrator; cousin dialogue packs are written against already-working content, not the other way around |
| Cousin dialogue reads as caricature rather than affectionate | Reputational/product risk, especially for backgrounds the author doesn't share directly | Per Character Bible §3 rule 4 — sanity-check any cousin's full dialogue pack with someone from that background before it ships |

---

## 17. Open Questions

1. Which Gamma Cousin gets the first full 22-lesson dialogue pack — deferred until neutral-voice content is proven (§5.1).
2. Whether character-resolution logic becomes a studio-wide shared module or stays SeeDS-local — not blocking, revisit when a second consuming app exists (§5.6).
3. Any specific salvage candidates from SeeDS 1.0 — decided opportunistically per §9, not upfront.
4. Exact wording/tone calibration for Phase 1 "assume zero prior knowledge" dialogue — worth a gut-check with an actual DS-naive classmate before Unit 1 ships, given that's precisely the population that flagged the original problem.

---

*This document supersedes the SeeDS 2.0 draft PRD in full. Any conflicting detail in
prior drafts (working titles "StructSensei"/"PointerPal", Chan-family mascot framing,
15-week milestone table) is void.*