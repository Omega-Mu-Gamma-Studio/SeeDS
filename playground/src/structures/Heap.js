// playground/src/structures/Heap.js
// ─────────────────────────────────────────────────────────────────────────────
// Incremental Three.js renderer for Heap in Playground Mode.
// Phase 3c — implement last.
//
// scene_event strings (from heap.json):
//   struct_defined, init_defined, swap_defined, sift_up_defined,
//   sift_down_defined, insert_defined, extract_min_defined, heap_sort_defined
//
// THREE.js import: "../../../vendor/three/three.module.js"
// ─────────────────────────────────────────────────────────────────────────────

import * as THREE from "../../../vendor/three/three.module.js";

class HeapRenderer {
  constructor() { this.meshes = []; }

  handleEvent(event, snapshot, scene, camera) {
    // TODO: implement one case per scene_event in heap.json
    console.warn(`HeapRenderer: not yet implemented (event: "${event}")`);
  }

  clear(scene) {
    for (const mesh of this.meshes) scene.remove(mesh);
    this.meshes = [];
  }
}

export default HeapRenderer;
