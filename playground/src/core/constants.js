// playground/src/core/constants.js
// ─────────────────────────────────────────────────────────────────────────────
// Playground-specific constants.
// Do NOT import from ../../../src/core/constants.js — keep playground isolated.
// Copy anything you need from the standard constants here.
// ─────────────────────────────────────────────────────────────────────────────

// Supported data structure types. Must match the JSON filenames in bricks/.
// e.g. "linked_list" → bricks/linked-list.json
export const DS_TYPES = [
  "linked_list",
  "binary_tree",
  "stack",
  "queue",
  "graph",
  "hash_table",
  "avl_tree",
  "heap",
];

// Human-readable labels for the DS selector buttons in BrickPanel.
export const DS_LABELS = {
  linked_list:  "Linked List",
  binary_tree:  "Binary Tree",
  stack:        "Stack",
  queue:        "Queue",
  graph:        "Graph",
  hash_table:   "Hash Table",
  avl_tree:     "AVL Tree",
  heap:         "Heap",
};

// TODO: Add any other playground-wide constants here as needed.
