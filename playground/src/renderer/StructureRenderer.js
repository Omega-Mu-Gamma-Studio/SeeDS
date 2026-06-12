// playground/src/renderer/StructureRenderer.js
// ─────────────────────────────────────────────────────────────────────────────
// The bridge between the brick system and Three.js.
// Maps scene_event strings (from brick JSON) to rendering calls on the
// active structure renderer (one of the files in playground/src/structures/).
//
// When a new DS type is selected: clears the old renderer, creates the new one.
// When a brick is placed: delegates its scene_event to the active renderer.
//
// Read spec Section 05 before implementing.
// ─────────────────────────────────────────────────────────────────────────────

import LinkedListRenderer from "../structures/LinkedList.js";
// Uncomment as you implement each structure:
// import BinaryTreeRenderer from "../structures/BinaryTree.js";
// import StackRenderer      from "../structures/Stack.js";
// import QueueRenderer      from "../structures/Queue.js";
// import GraphRenderer      from "../structures/Graph.js";
// import HashTableRenderer  from "../structures/HashTable.js";
// import AVLTreeRenderer    from "../structures/AVLTree.js";
// import HeapRenderer       from "../structures/Heap.js";

class StructureRenderer {
  /**
   * @param {THREE.Scene}  scene
   * @param {THREE.Camera} camera
   */
  constructor(scene, camera) {
    this.scene    = scene;
    this.camera   = camera;
    this.renderer = null; // Active structure renderer instance
  }

  /**
   * Called when the DS type changes (student picks a new structure).
   * Clears the old scene and initialises the correct renderer.
   *
   * @param {string} dsType - e.g. "linked_list"
   */
  setDSType(dsType) {
    // TODO: if (this.renderer) this.renderer.clear(this.scene);
    // TODO: switch (dsType) { case "linked_list": ... }
  }

  /**
   * Called every time a brick is placed.
   *
   * @param {string} event    - brick.scene_event string from the JSON
   * @param {Object} snapshot - current PlaygroundState snapshot
   */
  handleEvent(event, snapshot) {
    // TODO: if (!this.renderer) return;
    // TODO: this.renderer.handleEvent(event, snapshot, this.scene, this.camera);
  }
}

export default StructureRenderer;
