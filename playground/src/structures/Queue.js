// playground/src/structures/Queue.js
// ─────────────────────────────────────────────────────────────────────────────
// Incremental Three.js renderer for Queue in Playground Mode.
// Phase 3b — implement after LinkedList + BinaryTree.
//
// scene_event strings (from queue.json):
//   struct_defined, init_defined, enqueue_defined, dequeue_defined,
//   front_defined, is_empty_defined, is_full_defined, display_defined
//
// THREE.js import: "../../../vendor/three/three.module.js"
// ─────────────────────────────────────────────────────────────────────────────

import * as THREE from "../../../vendor/three/three.module.js";

class QueueRenderer {
  constructor() { this.meshes = []; }

  handleEvent(event, snapshot, scene, camera) {
    // TODO: implement one case per scene_event in queue.json
    console.warn(`QueueRenderer: not yet implemented (event: "${event}")`);
  }

  clear(scene) {
    for (const mesh of this.meshes) scene.remove(mesh);
    this.meshes = [];
  }
}

export default QueueRenderer;
