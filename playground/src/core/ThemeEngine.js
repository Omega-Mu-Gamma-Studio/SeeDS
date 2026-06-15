// playground/src/core/ThemeEngine.js
// ─────────────────────────────────────────────────────────────────────────────
// SeeDS Playground Theme Engine
// Manages CSS custom-property themes + Three.js material palettes in sync.
//
// Usage:
//   import ThemeEngine from "./ThemeEngine.js";
//   const theme = new ThemeEngine();
//   theme.apply("synthwave");
//   theme.getColors();  // → { node, edge, nodeError, ... }
// ─────────────────────────────────────────────────────────────────────────────

// ── Theme definitions ────────────────────────────────────────────────────────
// Each entry defines:
//   css  → body class name (applied to <body>)
//   label → display name in the picker
//   icon  → emoji swatch shown in the button
//   three → Three.js hex colors for 3D scene objects
// ────────────────────────────────────────────────────────────────────────────

export const THEMES = {
  void: {
    label: "Void",
    icon: "🌌",
    css: null,            // default — no extra class needed
    three: {
      node:        0x4f8ef7,
      nodeNull:    0x2a2a3a,
      nodeError:   0xff3333,
      nodePlaced:  0x2d9e6b,
      nodeTraverse:0xf5c518,
      nodeHit:     0x4fc97e,
      edge:        0x4f8ef7,
      edgeAlt:     0xf59e0b,
      boxFill:     0x4f8ef7,
      boxEmpty:    0x2a2a3a,
      boxBg:       0x1e1e2e,
      labelPrimary:"#cdd6f4",
      labelAccent: "#4f8ef7",
      labelMuted:  "#444466",
      labelWarn:   "#f5c518",
      labelSuccess:"#4fc97e",
      labelError:  "#ff6b6b",
    },
  },

  forest: {
    label: "Forest",
    icon: "🌿",
    css: "theme-forest",
    three: {
      node:        0x3ab07a,
      nodeNull:    0x1a2e1e,
      nodeError:   0xe05c5c,
      nodePlaced:  0x5ecc8a,
      nodeTraverse:0xd4c84a,
      nodeHit:     0x80e0a0,
      edge:        0x3ab07a,
      edgeAlt:     0xd4c84a,
      boxFill:     0x3ab07a,
      boxEmpty:    0x1a2e1e,
      boxBg:       0x0e1c10,
      labelPrimary:"#c8f0d8",
      labelAccent: "#3ab07a",
      labelMuted:  "#3a6645",
      labelWarn:   "#d4c84a",
      labelSuccess:"#80e0a0",
      labelError:  "#e08080",
    },
  },

  synthwave: {
    label: "Synthwave",
    icon: "🌸",
    css: "theme-synthwave",
    three: {
      node:        0xe879f9,
      nodeNull:    0x1a0022,
      nodeError:   0xff4466,
      nodePlaced:  0xa855f7,
      nodeTraverse:0xfbbf24,
      nodeHit:     0xf0abfc,
      edge:        0xe879f9,
      edgeAlt:     0xfbbf24,
      boxFill:     0xe879f9,
      boxEmpty:    0x1a0022,
      boxBg:       0x0d001a,
      labelPrimary:"#f5d0fe",
      labelAccent: "#e879f9",
      labelMuted:  "#7a2888",
      labelWarn:   "#fbbf24",
      labelSuccess:"#f0abfc",
      labelError:  "#ff6688",
    },
  },

  ember: {
    label: "Ember",
    icon: "🔥",
    css: "theme-ember",
    three: {
      node:        0xf97316,
      nodeNull:    0x1f0c00,
      nodeError:   0xff3333,
      nodePlaced:  0xfbbf24,
      nodeTraverse:0xfde68a,
      nodeHit:     0xfdba74,
      edge:        0xf97316,
      edgeAlt:     0xfde68a,
      boxFill:     0xf97316,
      boxEmpty:    0x1f0c00,
      boxBg:       0x120800,
      labelPrimary:"#fed7aa",
      labelAccent: "#f97316",
      labelMuted:  "#7a3a00",
      labelWarn:   "#fde68a",
      labelSuccess:"#fdba74",
      labelError:  "#ff6b6b",
    },
  },

  arctic: {
    label: "Arctic",
    icon: "🧊",
    css: "theme-arctic",
    three: {
      node:        0x0ea5e9,
      nodeNull:    0xc0d8ea,
      nodeError:   0xef4444,
      nodePlaced:  0x10b981,
      nodeTraverse:0xf59e0b,
      nodeHit:     0x6ee7b7,
      edge:        0x0ea5e9,
      edgeAlt:     0xf59e0b,
      boxFill:     0x0ea5e9,
      boxEmpty:    0xc0d8ea,
      boxBg:       0xe8f4fc,
      labelPrimary:"#0c2a3a",
      labelAccent: "#0ea5e9",
      labelMuted:  "#5a88a0",
      labelWarn:   "#f59e0b",
      labelSuccess:"#10b981",
      labelError:  "#ef4444",
    },
  },

  slate: {
    label: "Slate",
    icon: "🩶",
    css: "theme-slate",
    three: {
      node:        0x94a3b8,
      nodeNull:    0x1e2533,
      nodeError:   0xf87171,
      nodePlaced:  0x60a5fa,
      nodeTraverse:0xfcd34d,
      nodeHit:     0x6ee7b7,
      edge:        0x94a3b8,
      edgeAlt:     0xfcd34d,
      boxFill:     0x94a3b8,
      boxEmpty:    0x1e2533,
      boxBg:       0x0f111a,
      labelPrimary:"#cbd5e1",
      labelAccent: "#94a3b8",
      labelMuted:  "#475569",
      labelWarn:   "#fcd34d",
      labelSuccess:"#6ee7b7",
      labelError:  "#f87171",
    },
  },
};

export const THEME_ORDER = ["void", "forest", "synthwave", "ember", "arctic", "slate"];
const STORAGE_KEY = "seeds-playground-theme";

// ── ThemeEngine class ────────────────────────────────────────────────────────

class ThemeEngine {
  constructor() {
    this._current = "void";
    this._listeners = [];
  }

  // Load from localStorage (call once on init)
  load() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && THEMES[saved]) {
      this.apply(saved, true); // silent = skip event (no renderers ready yet)
    }
    return this._current;
  }

  // Apply a theme by key. silent=true skips firing change listeners.
  apply(key, silent = false) {
    if (!THEMES[key]) {
      console.warn(`ThemeEngine: unknown theme "${key}", ignoring.`);
      return;
    }

    const prev = THEMES[this._current];
    const next = THEMES[key];

    // Remove old body class
    if (prev.css) document.body.classList.remove(prev.css);

    // Apply new body class
    if (next.css) document.body.classList.add(next.css);

    this._current = key;
    localStorage.setItem(STORAGE_KEY, key);

    if (!silent) {
      this._listeners.forEach(fn => fn(key, next));
    }
  }

  // Cycle to the next theme (for a single button click)
  cycle() {
    const idx  = THEME_ORDER.indexOf(this._current);
    const next = THEME_ORDER[(idx + 1) % THEME_ORDER.length];
    this.apply(next);
    return next;
  }

  // Get Three.js color palette for the current theme
  getColors() {
    return { ...THEMES[this._current].three };
  }

  get current() { return this._current; }
  get currentTheme() { return THEMES[this._current]; }

  // Register a callback: fn(themeKey, themeDefinition)
  onChange(fn) {
    this._listeners.push(fn);
  }
}

export default ThemeEngine;
