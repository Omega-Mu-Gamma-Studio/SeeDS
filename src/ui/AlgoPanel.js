// =============================================================
//  SeeDS — AlgoPanel.js
//  Collapsible left sidebar (20% → slim strip).
//  Replaces the toolbar's DS tabs + demo buttons.
//  Houses:
//    - Algorithm categories (grouped, with icons)
//    - Demo scenario buttons per selected category
//    - Theme toggle
//    - Collapse / expand toggle
//  Communicates via eventBus only.
// =============================================================

import eventBus from '../core/eventBus.js';
import { EVENTS, DS_TYPES, APP, THEME } from '../core/constants.js';

const PANEL_ID = 'algo-panel';

// ── Category groups shown in the sidebar ─────────────────────
const GROUPS = [
  {
    label: 'Lists',
    icon: '🔗',
    items: [
      { type: DS_TYPES.LINKED_LIST,   label: 'Linked List',   icon: '→' },
      { type: DS_TYPES.DOUBLY_LIST,   label: 'Doubly List',   icon: '↔' },
      { type: DS_TYPES.CIRCULAR_LIST, label: 'Circular List', icon: '↺' },
    ],
  },
  {
    label: 'Stack & Queue',
    icon: '📦',
    items: [
      { type: DS_TYPES.STACK,  label: 'Stack',  icon: '⊤' },
      { type: DS_TYPES.QUEUE,  label: 'Queue',  icon: '▷' },
    ],
  },
  {
    label: 'Trees',
    icon: '🌲',
    items: [
      { type: DS_TYPES.BINARY_TREE, label: 'Binary Tree', icon: '⬡' },
      { type: DS_TYPES.AVL_TREE,    label: 'AVL Tree',    icon: '⬡' },
      { type: DS_TYPES.HEAP,        label: 'Heap',        icon: '⛰' },
    ],
  },
  {
    label: 'Graphs',
    icon: '🕸️',
    items: [
      { type: DS_TYPES.GRAPH, label: 'Graph + BFS', icon: '⬡' },
    ],
  },
  {
    label: 'Hash & Arrays',
    icon: '#️⃣',
    items: [
      { type: DS_TYPES.HASH_TABLE, label: 'Hash Table', icon: '#' },
      { type: DS_TYPES.ARRAY,      label: 'Array',      icon: '[]' },
    ],
  },
  {
    label: 'Sorting',
    icon: '🏁',
    items: [
      { type: DS_TYPES.SORT_RACE, label: 'Sort Race', icon: '≈' },
    ],
  },
];

// ── Demo scenarios per DS type ────────────────────────────────
const DEMOS = {
  [DS_TYPES.LINKED_LIST]: [
    { label: '✓ Normal',       file: 'linked-list-ok.json'       },
    { label: '↺ Cycle',        file: 'linked-list-cycle.json'    },
    { label: '⚠ Dangling',     file: 'linked-list-dangling.json' },
    { label: '⛁ Memory Leak', file: 'linked-list-leak.json'     },
  ],
  [DS_TYPES.CIRCULAR_LIST]: [
    { label: '↻ Circular',    file: 'circular-list-ok.json'  },
  ],
  [DS_TYPES.DOUBLY_LIST]: [
    { label: '✓ Doubly',      file: 'doubly-list-ok.json'    },
  ],
  [DS_TYPES.STACK]: [
    { label: '✓ Stack ADT',   file: 'stack-ok.json'          },
  ],
  [DS_TYPES.QUEUE]: [
    { label: '✓ Queue ADT',   file: 'queue-ok.json'          },
  ],
  [DS_TYPES.BINARY_TREE]: [
    { label: '✓ BST Search',  file: 'binary-tree-ok.json'    },
  ],
  [DS_TYPES.AVL_TREE]: [
    { label: '✓ AVL Tree',    file: 'avl-tree-ok.json'       },
  ],
  [DS_TYPES.HEAP]: [
    { label: '✓ Binary Heap', file: 'heap-ok.json'           },
  ],
  [DS_TYPES.GRAPH]: [
    { label: '✓ Graph + BFS', file: 'graph-ok.json'          },
  ],
  [DS_TYPES.HASH_TABLE]: [
    { label: '✓ Hash Table',  file: 'hash-table-ok.json'     },
  ],
  [DS_TYPES.ARRAY]: [
    { label: '✓ Linear Search',  file: 'array-search.json'   },
    { label: '✓ Binary Search',  file: 'binary-search.json'  },
  ],
  [DS_TYPES.SORT_RACE]: [
    { label: '▶ Bubble/Merge/Quick', file: 'sort-race.json'      },
    { label: '▶ Insertion Sort',     file: 'insertion-sort.json' },
  ],
};


class AlgoPanel {
  constructor() {
    this._collapsed  = false;
    this._activeType = APP.DEFAULT_DS;
    this._demoButtons = [];

    this._el = document.getElementById(PANEL_ID);
    if (!this._el) return;

    this._build();
  }


  // -----------------------------------------------------------
  //  Build DOM
  // -----------------------------------------------------------
  _build() {
    this._el.innerHTML = '';

    // ── Header row ───────────────────────────────────────────
    const header = document.createElement('div');
    header.className = 'ap__header';

    const logo = document.createElement('div');
    logo.className = 'ap__logo';
    logo.innerHTML = '<span class="ap__logo-icon">◈</span><span class="ap__logo-text">Algorithms</span>';

    this._collapseBtn = document.createElement('button');
    this._collapseBtn.className = 'ap__collapse-btn';
    this._collapseBtn.title = 'Collapse panel';
    this._collapseBtn.innerHTML = '◀';
    this._collapseBtn.addEventListener('click', () => this._toggleCollapse());

    header.appendChild(logo);
    header.appendChild(this._collapseBtn);
    this._el.appendChild(header);

    // ── Scrollable body ──────────────────────────────────────
    this._body = document.createElement('div');
    this._body.className = 'ap__body';
    this._el.appendChild(this._body);

    // ── Demo section (shown below category buttons) ──────────
    this._demoSection = document.createElement('div');
    this._demoSection.className = 'ap__demo-section';
    this._body.appendChild(this._demoSection);

    // ── Groups ───────────────────────────────────────────────
    for (const group of GROUPS) {
      const groupEl = document.createElement('div');
      groupEl.className = 'ap__group';

      const groupLabel = document.createElement('div');
      groupLabel.className = 'ap__group-label';
      groupLabel.innerHTML = `<span class="ap__group-icon">${group.icon}</span><span class="ap__group-text">${group.label}</span>`;
      groupEl.appendChild(groupLabel);

      for (const item of group.items) {
        const btn = document.createElement('button');
        btn.className = 'ap__item';
        btn.dataset.type = item.type;
        btn.innerHTML = `<span class="ap__item-icon">${item.icon}</span><span class="ap__item-label">${item.label}</span>`;
        if (item.type === this._activeType) btn.classList.add('ap__item--active');
        btn.addEventListener('click', () => this._selectType(item.type, btn));
        groupEl.appendChild(btn);
      }

      this._body.appendChild(groupEl);
    }

    // ── Footer: theme toggle ─────────────────────────────────
    const footer = document.createElement('div');
    footer.className = 'ap__footer';

    this._themeBtn = document.createElement('button');
    this._themeBtn.className = 'ap__theme-btn';
    this._themeBtn.innerHTML = '<span class="ap__theme-icon">☾</span><span class="ap__theme-text">Dark Mode</span>';
    this._themeBtn.title = 'Toggle light / dark theme';
    this._themeBtn.addEventListener('click', () => {
      const isLight = document.body.classList.contains('light-theme');
      eventBus.emit('theme:set', { theme: isLight ? THEME.DARK : THEME.LIGHT });
    });

    eventBus.on('theme:set', ({ theme }) => {
      const isLight = theme === THEME.LIGHT;
      this._themeBtn.innerHTML = isLight
        ? '<span class="ap__theme-icon">☀</span><span class="ap__theme-text">Light Mode</span>'
        : '<span class="ap__theme-icon">☾</span><span class="ap__theme-text">Dark Mode</span>';
    });

    footer.appendChild(this._themeBtn);
    this._el.appendChild(footer);

    // ── Auto-load the first demo for default DS ──────────────
    this._buildDemoSection(this._activeType);
    const firstDemos = DEMOS[this._activeType];
    if (firstDemos?.length) {
      this._loadDemo(this._activeType, firstDemos[0].file);
    }
  }


  // -----------------------------------------------------------
  //  Select a DS type
  // -----------------------------------------------------------
  _selectType(type, clickedBtn) {
    if (type === this._activeType) return;

    // Update active button styling
    this._el.querySelectorAll('.ap__item').forEach(b => b.classList.remove('ap__item--active'));
    clickedBtn.classList.add('ap__item--active');
    this._activeType = type;

    // Rebuild demo section
    this._buildDemoSection(type);

    // Auto-load first demo
    const demos = DEMOS[type] ?? [];
    if (demos.length) this._loadDemo(type, demos[0].file);
  }


  // -----------------------------------------------------------
  //  Rebuild demo scenario buttons
  // -----------------------------------------------------------
  _buildDemoSection(type) {
    this._demoSection.innerHTML = '';
    this._demoButtons = [];

    const demos = DEMOS[type] ?? [];
    if (!demos.length) return;

    const label = document.createElement('div');
    label.className = 'ap__demo-label';
    label.innerHTML = '<span class="ap__demo-label-text">Scenarios</span>';
    this._demoSection.appendChild(label);

    for (const demo of demos) {
      const btn = document.createElement('button');
      btn.className = 'ap__demo-btn';
      btn.textContent = demo.label;
      btn.dataset.file = demo.file;
      btn.addEventListener('click', () => {
        this._demoButtons.forEach(b => b.classList.remove('ap__demo-btn--active'));
        btn.classList.add('ap__demo-btn--active');
        this._loadDemo(type, demo.file);
      });
      this._demoSection.appendChild(btn);
      this._demoButtons.push(btn);
    }

    // Mark first button as active by default
    if (this._demoButtons[0]) this._demoButtons[0].classList.add('ap__demo-btn--active');
  }


  // -----------------------------------------------------------
  //  Load a demo JSON
  // -----------------------------------------------------------
  async _loadDemo(dsType, file) {
    try {
      const res  = await fetch(`${APP.DATA_PATH}${file}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      eventBus.emit(EVENTS.DS_LOADED, { type: dsType, data, source: 'algo-panel' });
    } catch (err) {
      console.error(`[AlgoPanel] Failed to load demo "${file}":`, err);
    }
  }


  // -----------------------------------------------------------
  //  Collapse / expand
  // -----------------------------------------------------------
  _toggleCollapse() {
    this._collapsed = !this._collapsed;
    this._el.classList.toggle('ap--collapsed', this._collapsed);
    this._collapseBtn.innerHTML  = this._collapsed ? '▶' : '◀';
    this._collapseBtn.title      = this._collapsed ? 'Expand panel' : 'Collapse panel';
    window.dispatchEvent(new Event('resize'));
  }


  dispose() {
    if (this._el) this._el.innerHTML = '';
  }
}


export default AlgoPanel;