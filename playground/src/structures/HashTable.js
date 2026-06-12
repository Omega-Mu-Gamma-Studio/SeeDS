// playground/src/structures/HashTable.js
// ─────────────────────────────────────────────────────────────────────────────
// Incremental Three.js renderer for Hash Table in Playground Mode.
// Phase 3c — implement last.
//
// scene_event strings (from hash-table.json):
//   hash_node_struct_defined, hash_table_struct_defined, create_table_defined,
//   hash_defined, insert_defined, search_defined, delete_defined, display_defined
//
// THREE.js import: "../../../vendor/three/three.module.js"
// ─────────────────────────────────────────────────────────────────────────────

import * as THREE from "../../../vendor/three/three.module.js";

class HashTableRenderer {
  constructor() { this.meshes = []; }

  handleEvent(event, snapshot, scene, camera) {
    // TODO: implement one case per scene_event in hash-table.json
    console.warn(`HashTableRenderer: not yet implemented (event: "${event}")`);
  }

  clear(scene) {
    for (const mesh of this.meshes) scene.remove(mesh);
    this.meshes = [];
  }
}

export default HashTableRenderer;
