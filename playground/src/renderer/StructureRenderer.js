// playground/src/renderer/StructureRenderer.js
// Updated to support ThemeEngine color injection.
// Each sub-renderer receives colors via setColors(palette) before events.

import LinkedListRenderer from "../structures/LinkedList.js";
import BinaryTreeRenderer from "../structures/BinaryTree.js";
import StackRenderer      from "../structures/Stack.js";
import QueueRenderer      from "../structures/Queue.js";
import GraphRenderer      from "../structures/Graph.js";
import HashTableRenderer  from "../structures/HashTable.js";
import AVLTreeRenderer    from "../structures/AVLTree.js";
import HeapRenderer       from "../structures/Heap.js";

class StructureRenderer {
  constructor(scene, camera) {
    this.scene    = scene;
    this.camera   = camera;
    this.renderer = null;
    this._colors  = null;  // set by ThemeEngine via applyTheme()
  }

  // Called by PlaygroundApp when ThemeEngine fires onChange
  applyTheme(colors) {
    this._colors = colors;
    if (this.renderer && typeof this.renderer.setColors === "function") {
      this.renderer.setColors(colors);
    }
  }

  setDSType(dsType) {
    if (this.renderer) this.renderer.clear(this.scene);
    switch (dsType) {
      case "linked_list":  this.renderer = new LinkedListRenderer(); break;
      case "binary_tree":  this.renderer = new BinaryTreeRenderer(); break;
      case "stack":        this.renderer = new StackRenderer();      break;
      case "queue":        this.renderer = new QueueRenderer();      break;
      case "graph":        this.renderer = new GraphRenderer();      break;
      case "hash_table":   this.renderer = new HashTableRenderer();  break;
      case "avl_tree":     this.renderer = new AVLTreeRenderer();    break;
      case "heap":         this.renderer = new HeapRenderer();       break;
      default:
        console.warn(`StructureRenderer: unknown dsType "${dsType}"`);
        this.renderer = null;
    }
    // Inject current theme colors into newly created renderer
    if (this.renderer && this._colors &&
        typeof this.renderer.setColors === "function") {
      this.renderer.setColors(this._colors);
    }
  }

  handleEvent(event, snapshot) {
    if (!this.renderer) return;
    this.renderer.handleEvent(event, snapshot, this.scene, this.camera);
  }
}

export default StructureRenderer;
