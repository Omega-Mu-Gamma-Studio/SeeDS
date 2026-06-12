// playground/src/renderer/StructureRenderer.js

import LinkedListRenderer from "../structures/LinkedList.js";
// Uncomment as you implement each:
// import BinaryTreeRenderer from "../structures/BinaryTree.js";
// import StackRenderer      from "../structures/Stack.js";
// import QueueRenderer      from "../structures/Queue.js";
// import GraphRenderer      from "../structures/Graph.js";
// import HashTableRenderer  from "../structures/HashTable.js";
// import AVLTreeRenderer    from "../structures/AVLTree.js";
// import HeapRenderer       from "../structures/Heap.js";

class StructureRenderer {
  constructor(scene, camera) {
    this.scene    = scene;
    this.camera   = camera;
    this.renderer = null;
  }

  setDSType(dsType) {
    if (this.renderer) this.renderer.clear(this.scene);
    switch (dsType) {
      case "linked_list": this.renderer = new LinkedListRenderer(); break;
      // case "binary_tree": this.renderer = new BinaryTreeRenderer(); break;
      // case "stack":       this.renderer = new StackRenderer(); break;
      // case "queue":       this.renderer = new QueueRenderer(); break;
      // case "graph":       this.renderer = new GraphRenderer(); break;
      // case "hash_table":  this.renderer = new HashTableRenderer(); break;
      // case "avl_tree":    this.renderer = new AVLTreeRenderer(); break;
      // case "heap":        this.renderer = new HeapRenderer(); break;
      default:
        console.warn(`StructureRenderer: no renderer for "${dsType}"`);
        this.renderer = null;
    }
  }

  handleEvent(event, snapshot) {
    if (!this.renderer) return;
    this.renderer.handleEvent(event, snapshot, this.scene, this.camera);
  }
}

export default StructureRenderer;
