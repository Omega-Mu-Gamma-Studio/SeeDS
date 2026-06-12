// playground/src/structures/BinaryTree.js
// ─────────────────────────────────────────────────────────────────────────────
// Incremental Three.js renderer for Binary Tree in Playground Mode.
// Implement after LinkedList is fully working (Phase 3a → Phase 3b).
//
// scene_event strings (from binary-tree.json):
//   node_struct_defined, create_node_defined, insert_defined,
//   search_defined, inorder_defined, preorder_defined, postorder_defined,
//   delete_node_defined, height_defined
//
// THREE.js import: "../../../vendor/three/three.module.js"
// ─────────────────────────────────────────────────────────────────────────────

import * as THREE from "../../../vendor/three/three.module.js";

class BinaryTreeRenderer {
  constructor() { this.meshes = []; }

  handleEvent(event, snapshot, scene, camera) {
    // TODO: implement one case per scene_event in binary-tree.json
    console.warn(`BinaryTreeRenderer: not yet implemented (event: "${event}")`);
  }

  clear(scene) {
    for (const mesh of this.meshes) scene.remove(mesh);
    this.meshes = [];
  }
}

export default BinaryTreeRenderer;
