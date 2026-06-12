// playground/src/structures/Stack.js
// ─────────────────────────────────────────────────────────────────────────────
// Incremental Three.js renderer for Stack in Playground Mode.
// Phase 3b — implement after LinkedList + BinaryTree.
//
// scene_event strings (from stack.json):
//   struct_defined, init_defined, push_defined, pop_defined,
//   peek_defined, is_empty_defined, is_full_defined, display_defined
//
// THREE.js import: "../../../vendor/three/three.module.js"
// ─────────────────────────────────────────────────────────────────────────────

import * as THREE from "../../../vendor/three/three.module.js";

class StackRenderer {
  constructor() { this.meshes = []; }

  handleEvent(event, snapshot, scene, camera) {
    // TODO: implement one case per scene_event in stack.json
    console.warn(`StackRenderer: not yet implemented (event: "${event}")`);
  }

  clear(scene) {
    for (const mesh of this.meshes) scene.remove(mesh);
    this.meshes = [];
  }
}

export default StackRenderer;
