// =============================================================
//  SeeDS — AlgoPanel.js
//  Collapsible left sidebar (20% → slim strip).
//  All templates surfaced here. Items marked comingSoon show
//  a 🚧 badge and are non-clickable.
// =============================================================

import eventBus from '../core/eventBus.js';
import { EVENTS, DS_TYPES, APP, THEME } from '../core/constants.js';

const PANEL_ID = 'algo-panel';

// ── Groups + items ────────────────────────────────────────────
// comingSoon: true  → greyed out, badge, not clickable
// demos[]           → scenario buttons (only for working items)
const GROUPS = [
  {
    label: 'Lists',
    icon: '🔗',
    items: [
      {
        type: DS_TYPES.LINKED_LIST,
        label: 'Linked List',
        icon: '→',
        demos: [
          { label: '✓ Normal',       file: 'linked-list-ok.json'       },
          { label: '↺ Cycle',        file: 'linked-list-cycle.json'    },
          { label: '⚠ Dangling',     file: 'linked-list-dangling.json' },
          { label: '⛁ Memory Leak', file: 'linked-list-leak.json'     },
          { label: '🐛 With Bugs',   file: 'linked-list-ok.json', templateId: 'buggy_list' },
        ],
      },
      {
        type: DS_TYPES.DOUBLY_LIST,
        label: 'Doubly List',
        icon: '↔',
        demos: [
          { label: '✓ Doubly Linked',   file: 'doubly-list-ok.json'         },
          { label: '❌ Broken Prev',     file: 'doubly-list-broken-prev.json' },
        ],
      },
      {
        type: DS_TYPES.CIRCULAR_LIST,
        label: 'Circular List',
        icon: '↺',
        demos: [
          { label: '↻ Circular',       file: 'circular-list-ok.json'    },
          { label: '❌ Broken Tail',    file: 'circular-list-broken.json' },
        ],
      },
    ],
  },
  {
    label: 'Stack & Queue',
    icon: '📦',
    items: [
      {
        type: DS_TYPES.STACK,
        label: 'Stack',
        icon: '⊤',
        demos: [
          { label: '✓ Stack ADT',    file: 'stack-ok.json'       },
          { label: '⛔ Overflow',      file: 'stack-overflow.json'  },
        ],
      },
      {
        type: DS_TYPES.QUEUE,
        label: 'Queue',
        icon: '▷',
        demos: [
          { label: '✓ Queue ADT',   file: 'queue-ok.json'        },
          { label: '⛔ Underflow',     file: 'queue-underflow.json' },
        ],
      },
      {
        type: 'circular_queue',
        label: 'Circular Queue',
        icon: '↺',
        demos: [
          { label: '✓ Circular Queue',  file: 'circular-queue-ok.json'   },
          { label: '⛔ Queue Full',      file: 'circular-queue-full.json' },
          { label: '↩ Wrap-Around',     file: 'circular-queue-wrap.json' },
        ],
      },
      {
        type: 'dequeue',
        label: 'DeQueue',
        icon: '↔',
        demos: [
          { label: '↔ DeQueue ADT',   file: 'dequeue-ok.json'    },
          { label: '⇄ Mixed Ops',     file: 'dequeue-mixed.json' },
        ],
      },
    ],
  },
  {
    label: 'Trees',
    icon: '🌲',
    items: [
      {
        type: DS_TYPES.BINARY_TREE,
        label: 'Binary Tree',
        icon: '⬡',
        demos: [
          { label: '✓ BST Search',    file: 'binary-tree-ok.json'          },
          { label: '❌ BST Violation',  file: 'binary-tree-bst-violation.json' },
          { label: '💥 Null Deref',    file: 'binary-tree-null-deref.json'    },
        ],
      },
      {
        type: DS_TYPES.AVL_TREE,
        label: 'AVL Tree',
        icon: '⬡',
        demos: [
          { label: '✓ AVL Tree',      file: 'avl-tree-ok.json'          },
          { label: '⚖ Unbalanced',     file: 'avl-tree-unbalanced.json'   },
          { label: '↺ Right-Left Case', file: 'avl-tree-violation.json'   },
        ],
      },
      {
        type: DS_TYPES.HEAP,
        label: 'Heap',
        icon: '⛰',
        demos: [
          { label: '✓ Min-Heap',      file: 'heap-ok.json'        },
          { label: '✓ Max-Heap',      file: 'heap-max.json'       },
          { label: '❌ Heap Violation', file: 'heap-violation.json' },
        ],
      },
      {
        type: 'expression_tree',
        label: 'Expression Tree',
        icon: '∑',
        demos: [
          { label: '∑ In-Order',       file: 'expression-tree-inorder.json'   },
          { label: '↩ Post-Order Eval', file: 'expression-tree-postorder.json' },
        ],
      },
    ],
  },
  {
    label: 'Graphs',
    icon: '🕸️',
    items: [
      {
        type: DS_TYPES.GRAPH,
        label: 'Graph + BFS',
        icon: '⬡',
        demos: [
          { label: '✓ Graph + BFS',      file: 'graph-ok.json'           },
          { label: '→ Directed Graph',   file: 'graph-directed.json'     },
          { label: '⚡ Disconnected',    file: 'graph-disconnected.json' },
        ],
      },
      { type: 'topological_sort', label: 'Topological Sort', icon: '→', comingSoon: true },
      { type: 'dijkstra',         label: "Dijkstra's",        icon: '⚡', comingSoon: true },
      { type: 'prim_mst',         label: "Prim's MST",        icon: '🌿', comingSoon: true },
      { type: 'kruskal_mst',      label: "Kruskal's MST",     icon: '🌿', comingSoon: true },
    ],
  },
  {
    label: 'Hash & Arrays',
    icon: '#️⃣',
    items: [
      {
        type: DS_TYPES.HASH_TABLE,
        label: 'Hash Table',
        icon: '#',
        demos: [
          { label: '✓ Separate Chaining', file: 'hash-table-ok.json'        },
          { label: '💥 Collision',        file: 'hash-table-collision.json' },
        ],
      },
      { type: 'open_addressing', label: 'Open Addressing', icon: '#', comingSoon: true },
      {
        type: DS_TYPES.ARRAY,
        label: 'Array',
        icon: '[]',
        demos: [
          { label: '✓ Linear Search', file: 'array-search.json'  },
          { label: '✓ Binary Search', file: 'binary-search.json' },
        ],
      },
    ],
  },
  {
    label: 'Sorting',
    icon: '🏁',
    items: [
      {
        type: DS_TYPES.SORT_RACE,
        label: 'Sort Race',
        icon: '≈',
        demos: [
          { label: '▶ Bubble / Merge / Quick', file: 'sort-race.json'      },
          { label: '▶ Insertion Sort',         file: 'insertion-sort.json' },
        ],
      },
      { type: 'merge_sort',  label: 'Merge Sort',  icon: '⊕', comingSoon: true },
      { type: 'shell_sort',  label: 'Shell Sort',  icon: '≋', comingSoon: true },
      { type: 'radix_sort',  label: 'Radix Sort',  icon: '0x', comingSoon: true },
    ],
  },
];


class AlgoPanel {
  constructor() {
    this._collapsed   = false;
    this._activeType  = APP.DEFAULT_DS;
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

    // ── Header ───────────────────────────────────────────────
    const header = document.createElement('div');
    header.className = 'ap__header';

    const logo = document.createElement('div');
    logo.className = 'ap__logo';
    logo.innerHTML = '<span class="ap__logo-icon">◈</span><span class="ap__logo-text">Algorithms</span>';

    this._collapseBtn = document.createElement('button');
    this._collapseBtn.className = 'ap__collapse-btn';
    this._collapseBtn.title     = 'Collapse panel';
    this._collapseBtn.innerHTML = '◀';
    this._collapseBtn.addEventListener('click', () => this._toggleCollapse());

    header.appendChild(logo);
    header.appendChild(this._collapseBtn);
    this._el.appendChild(header);

    // ── Scrollable body ──────────────────────────────────────
    this._body = document.createElement('div');
    this._body.className = 'ap__body';
    this._el.appendChild(this._body);

    // ── Demo section (pinned at top of body) ─────────────────
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
        groupEl.appendChild(this._makeItem(item));
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

    // ── Auto-load first demo for default DS ──────────────────
    this._buildDemoSection(this._activeType);
    const defaultGroup = GROUPS.flatMap(g => g.items).find(i => i.type === this._activeType);
    if (defaultGroup?.demos?.length) {
      const firstDemo = defaultGroup.demos[0];
      this._loadDemo(this._activeType, firstDemo.file, firstDemo.templateId ?? null);
    }
  }


  // -----------------------------------------------------------
  //  Make a single item button (working or coming soon)
  // -----------------------------------------------------------
  _makeItem(item) {
    if (item.comingSoon) {
      const el = document.createElement('div');
      el.className = 'ap__item ap__item--soon';
      el.title = `${item.label} — Coming Soon`;
      el.innerHTML = `
        <span class="ap__item-icon">${item.icon}</span>
        <span class="ap__item-label">${item.label}</span>
        <span class="ap__item-soon-badge">🚧</span>
      `;
      return el;
    }

    const btn = document.createElement('button');
    btn.className    = 'ap__item';
    btn.dataset.type = item.type;
    btn.innerHTML = `<span class="ap__item-icon">${item.icon}</span><span class="ap__item-label">${item.label}</span>`;
    if (item.type === this._activeType) btn.classList.add('ap__item--active');
    btn.addEventListener('click', () => this._selectType(item, btn));
    return btn;
  }


  // -----------------------------------------------------------
  //  Select a working DS type
  // -----------------------------------------------------------
  _selectType(item, clickedBtn) {
    if (item.type === this._activeType) return;

    this._el.querySelectorAll('.ap__item--active').forEach(b => b.classList.remove('ap__item--active'));
    clickedBtn.classList.add('ap__item--active');
    this._activeType = item.type;

    this._buildDemoSection(item.type, item.demos ?? []);

    if (item.demos?.length) {
      // Load first demo — pass any templateId override so code panel also syncs
      this._loadDemo(item.type, item.demos[0].file, item.demos[0].templateId ?? null);
    }
  }


  // -----------------------------------------------------------
  //  Rebuild demo scenario buttons
  // -----------------------------------------------------------
  _buildDemoSection(type, demos) {
    this._demoSection.innerHTML = '';
    this._demoButtons = [];

    // If called without demos arg, find from GROUPS
    if (!demos) {
      const found = GROUPS.flatMap(g => g.items).find(i => i.type === type);
      demos = found?.demos ?? [];
    }

    if (!demos.length) return;

    const labelEl = document.createElement('div');
    labelEl.className = 'ap__demo-label';
    labelEl.innerHTML = '<span class="ap__demo-label-text">Scenarios</span>';
    this._demoSection.appendChild(labelEl);

    for (const demo of demos) {
      const btn = document.createElement('button');
      btn.className   = 'ap__demo-btn';
      btn.textContent = demo.label;
      btn.dataset.file = demo.file;
      btn.addEventListener('click', () => {
        this._demoButtons.forEach(b => b.classList.remove('ap__demo-btn--active'));
        btn.classList.add('ap__demo-btn--active');
        this._loadDemo(type, demo.file, demo.templateId ?? null);
      });
      this._demoSection.appendChild(btn);
      this._demoButtons.push(btn);
    }

    if (this._demoButtons[0]) this._demoButtons[0].classList.add('ap__demo-btn--active');
  }


  // -----------------------------------------------------------
  //  Load a demo JSON
  // -----------------------------------------------------------
  async _loadDemo(dsType, file, templateId = null) {
    try {
      const res  = await fetch(`${APP.DATA_PATH}${file}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      eventBus.emit(EVENTS.DS_LOADED, { type: dsType, data, source: 'algo-panel', templateId });
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
    this._collapseBtn.innerHTML = this._collapsed ? '▶' : '◀';
    this._collapseBtn.title     = this._collapsed ? 'Expand panel' : 'Collapse panel';
    window.dispatchEvent(new Event('resize'));
  }


  dispose() {
    if (this._el) this._el.innerHTML = '';
  }
}


export default AlgoPanel;