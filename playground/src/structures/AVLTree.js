// playground/src/structures/AVLTree.js
// ─────────────────────────────────────────────────────────────────────────────
// Incremental Three.js renderer for AVL Tree in Playground Mode.
// Phase 3c — implement last.
//
// scene_event strings (from avl-tree.json):
//   avl_node_struct_defined, height_defined, get_balance_defined,
//   create_node_defined, right_rotate_defined, left_rotate_defined,
//   insert_defined, inorder_defined
//
// THREE.js import: "../../../vendor/three/three.module.js"
// ─────────────────────────────────────────────────────────────────────────────

import * as THREE from "../../../vendor/three/three.module.js";

class AVLTreeRenderer {
  constructor() { this.meshes = []; }

  handleEvent(event, snapshot, scene, camera) {
    // TODO: implement one case per scene_event in avl-tree.json
    console.warn(`AVLTreeRenderer: not yet implemented (event: "${event}")`);
  }

  clear(scene) {
    for (const mesh of this.meshes) scene.remove(mesh);
    this.meshes = [];
  }
}

export default AVLTreeRenderer;
