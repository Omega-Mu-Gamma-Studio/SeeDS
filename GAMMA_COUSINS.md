# The Gamma Cousins — Character Bible

**Studio:** Omega Mu Gamma Studio
**Status:** Content reference document — portable across apps, not tied to any single codebase
**Purpose:** A reusable roster of subject-agnostic tutor personalities for any Omega Mu
Gamma Studio product that teaches a *subject* rather than a *programming language*
(programming languages are the Chan sisters' territory — see naming rationale below).

This document defines *who these characters are*, independent of how any particular
app implements dialogue delivery, sprite rendering, or state management. Any app
wiring these characters in should read this document, not reverse-engineer
personality from another app's code.

---

## 0. Naming & Universe Rationale

- **"Gamma Cousins"** — shared middle name "Gamma," a direct nod to Omega Mu Gamma
  Studio itself. They are a family, not a random roster.
- **Explicitly not Chan-family.** The Chan sisters teach programming *languages*
  (syntax, semantics, idioms of a specific language). The Gamma Cousins teach
  *subjects* (data structures, and whatever else the studio builds next — math,
  physics, circuits, anything that isn't "learn this specific language"). Keeping
  these universes separate avoids brand confusion — a student should never wonder
  "wait, is this teaching me a language or a concept?" based on which mascot shows up.
- **One cousin can serve many apps.** A cousin written here is not SeeDS-specific.
  If SeeDS uses Miyu, and a future physics app also wants Miyu, she should sound
  like the same person in both — same core voice, different subject matter flowing
  through her.

---

## 1. How to Use This Document (For Whoever Is Wiring This Into an App)

Each cousin entry below gives you:
- **Vibe** — the core comedic/emotional mechanism, not just "she's from X"
- **Dialogue slips** — example lines showing voice, NOT lesson-specific content to copy verbatim
- **Teaching quirk** — the metaphor family she reaches for (food, sport, craft, etc.) — use this as a generator pattern for new lesson dialogue, not a fixed list
- **Catchphrase** — a signature line, used sparingly (see §12 guidance)
- **Palette** — hex codes for her UI theme/accent color when she's the active tutor

None of this is lesson content. A per-app "dialogue pack" (see your app's own PRD
for the schema) is where actual per-lesson lines live — this document is the source
of truth for *who she is*, so dialogue packs stay consistent with her voice.

---

## 2. Roster

### 2.1 Scout — Texas

| | |
|---|---|
| Vibe | Loud, proud, unapologetic. Fast talker. Chaos delivered with warmth. |
| Dialogue slips | "Now y'all listen up — this is fixin' to make sense." / "Bless your heart, that pointer is NULL." |
| Teaching quirk | Rodeo and BBQ metaphors — anything sequential or roundup-shaped fits her naturally |
| Catchphrase | "Hold my sweet tea — I'm fixin' to teach." |
| Palette | Red `#BF0A30`, White `#FFFFFF`, Blue `#002868` |
| Core mechanism | "Bless your heart" softens being wrong — chaos with a safety net |

### 2.2 Mei — Singaporean

| | |
|---|---|
| Vibe | Deadpan delivery, sudden chaos. Students can't tell if she's joking — both is the answer. |
| Dialogue slips | "This code is broken lah. Just look." / "Can already. Let's go." |
| Teaching quirk | Hawker centre food metaphors — collisions, queues, resource contention map naturally |
| Catchphrase | "Can already. Let's go." |
| Palette | Red `#EE3124`, White `#FFFFFF` |
| Core mechanism | Deadpan makes sharp insight land harder — no wind-up, straight to the point |

### 2.3 Camille — French

| | |
|---|---|
| Vibe | Dramatic nonchalance. Sighs at bad code, fixes it in two seconds. |
| Dialogue slips | "Alors... this code is n'importe quoi." / "Bizarre... mais ça marche." |
| Teaching quirk | Food and art/museum metaphors — great for anything with "rooms," "layers," or "composition" |
| Catchphrase | "Bizarre... mais ça marche." (Weird... but it works.) |
| Palette | Blue `#002395`, White `#FFFFFF`, Red `#ED2939` |
| Core mechanism | The gap between "I don't care" delivery and precise correction is the joke |

### 2.4 Rosa — Italian

| | |
|---|---|
| Vibe | Expressive, loud, conducts explanations with her hands. Calls students "tesoro." |
| Dialogue slips | "Mamma mia — this code is un disastro!" / "Perfetto! Capito?" |
| Teaching quirk | Pasta and opera metaphors — great for anything iterative/repeated-with-refinement |
| Catchphrase | "Perfetto! Capito?" |
| Palette | Green `#009246`, White `#FFFFFF`, Red `#CE2B37` |
| Core mechanism | Volume and warmth together — chaos that never feels unkind |

### 2.5 Valeria ("Val") — Mexican

| | |
|---|---|
| Vibe | Loud, expressive, draws in the air. Calls students "güey." |
| Dialogue slips | "Ay, güey — that's a dangling pointer, not a free elf." / "¿No ves? SEE?" |
| Teaching quirk | Food metaphors, especially anything about consuming/allocating/freeing resources |
| Catchphrase | "Ándale, ándale — let's leak some memory!" |
| Palette | Terracotta `#C85A3E`, Yellow `#F9D342`, Green `#2E7D32` |
| Core mechanism | Playful urgency — chaos as momentum, not confusion |

### 2.6 Ananya ("Anu") — Indian

| | |
|---|---|
| Vibe | Fast talker, aggressive hand gestures, calls students "beta." Warm but sharp. |
| Dialogue slips | "Arre, this code is gadbad." / "Bas! That's it. Done." |
| Teaching quirk | Bollywood and food metaphors — great for anything with an ensemble cast (graphs, multi-branch structures) |
| Catchphrase | "Bas! That's it. Done." |
| Palette | Saffron `#FF9933`, Maroon `#800020`, Teal `#008080` |
| Core mechanism | Speed and warmth combined — sharp but never cold |

### 2.7 Miyu — Japanese

| | |
|---|---|
| Vibe | Politely chaotic. Calm, bows on entry, then dismantles your code with surgical precision. |
| Dialogue slips | "Maa... this code is muzukashii." / "Yabai! That's bad." / "Kanpeki." (perfect) |
| Teaching quirk | Origami and calligraphy (shodo) metaphors — exceptional fit for recursion, folding/repeated structure |
| Catchphrase | "Maa... ganbatte ne." (Well... do your best.) — delivered right after she's just corrected you |
| Palette | Red `#BC002D`, White `#FFFFFF`, Black `#1A1A1A` |
| Core mechanism | Contrast between politeness and precision — the gentlest delivery of the sharpest correction |

### 2.8 Florence — British

| | |
|---|---|
| Vibe | Dry, sarcastic, unflappable. Fixes your code without breaking eye contact. |
| Dialogue slips | "Right, then — this linked list is utterly borked." / "Right. That's that, then." |
| Teaching quirk | Tea and queuing metaphors — natural fit for anything FIFO/order-of-service shaped |
| Catchphrase | "Right. That's that, then." |
| Palette | Blue `#012169`, Red `#C8102E`, White `#FFFFFF` |
| Core mechanism | The joke is in *what* she says, delivered completely flat — no accent gimmick needed, driven by wit |

### 2.9 Mack — Australian

| | |
|---|---|
| Vibe | Chill, calls everyone "mate," fixes a segfault without raising her voice. |
| Dialogue slips | "Right, mate — this linked list is rooted." / "No wukkas, mate — we got this." |
| Teaching quirk | Beach and BBQ metaphors — good for anything about coverage/sweeping a range |
| Catchphrase | "No wukkas, mate — we got this." |
| Palette | Green `#00843D`, Yellow `#FED100`, Blue `#00008B` |
| Core mechanism | Warmth disguising sharpness — students feel safe right up until she roasts them, kindly |

### 2.10 Simi — Nigerian

| | |
|---|---|
| Vibe | Bold, loud, unforgettable. Calls students "my pikin." Laughs at bugs *with* you. |
| Dialogue slips | "Ah, this code is wahala o!" / "E no go easy, but you go learn-am o!" |
| Teaching quirk | Nollywood and market metaphors — strong fit for anything with intentional vs. accidental drama (e.g. circular design vs. cycle bug) |
| Catchphrase | "E no go easy, but you go learn-am o!" |
| Palette | Green `#008751`, White `#FFFFFF`, Black `#000000` |
| Core mechanism | Radical honesty — she tells you it's hard, and that you'll get there anyway |

---

## 3. Cross-Cousin Design Rules

These apply regardless of which app is using them:

1. **No cousin's dialogue should require the student to already know the concept
   to parse the joke.** The metaphor is the on-ramp, not a reward for already
   understanding — if a metaphor only lands *after* you get the concept, it's
   decoration, not teaching.
2. **Every cousin needs a plain-English fallback for her own metaphors.** If Rosa
   says "recursion is like making pasta, you repeat until perfect," the *next*
   line needs to cash that metaphor out into the literal mechanism (base case,
   recursive case) — the joke buys attention, it doesn't replace the explanation.
3. **Catchphrases are seasoning, not sentences.** Use a cousin's signature line at
   most once or twice per lesson (e.g., end of Phase 1, end of Phase 5 success) —
   overuse turns a character trait into a tic.
4. **A cousin's dialect/accent is written for warmth and specificity, not for
   distance.** Before writing a full dialogue pack for any cousin whose
   background the author doesn't share directly, sanity-check the draft with
   someone who does — the difference between "affectionate specificity" and
   "flattening caricature" is proximity to the source, and costs nothing to check.
5. **Cousins are interchangeable at the content layer.** Any given lesson's core
   concept, code, and visual must work identically regardless of which cousin is
   narrating — a cousin changes *how* something is said, never *what* is being
   taught. If a lesson's correctness depends on which cousin is active, that's a
   sign the dialogue and the content got coupled somewhere they shouldn't have.

---

## 4. Adding a New Cousin (Template)

```
Name:
Origin/background:
Vibe (core comedic/emotional mechanism, one sentence):
Dialogue slips (2-3 examples):
Teaching quirk (metaphor family):
Catchphrase:
Palette (hex, 2-3 colors):
Core mechanism (why the chaos lands, one sentence):
```

New cousins should be run past §3's rules before being considered final,
particularly rule 4.

---

## 5. Default / Fallback Voice

Apps using this roster should ship with a **neutral default narrator** as the
always-available fallback — no accent, no bit, plain pedagogical delivery — for
any lesson where the selected cousin doesn't yet have written dialogue. This is
not a placeholder cousin; it's a permanent, always-populated voice that content
can be authored against before any personality is layered on top. See the
consuming app's own PRD for how the fallback chain resolves at runtime.

---

*This document is intentionally app-agnostic. App-specific implementation
details — dialogue pack JSON schema, character selection UX, state management —
live in that app's own PRD, not here. This document should still make complete
sense to someone building an entirely different subject-learning app who has
never heard of SeeDS.*