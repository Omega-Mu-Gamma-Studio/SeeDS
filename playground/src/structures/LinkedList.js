// playground/src/structures/LinkedList.js
// ─────────────────────────────────────────────────────────────────────────────
// Incremental Three.js renderer for Linked List in Playground Mode.
// This is NOT the same as src/structures/LinkedList.js — that one receives a
// complete JSON and renders all at once. This one builds the scene event by
// event, one brick at a time.
//
// Implement handleEvent() first for "node_struct_defined" and
// "create_node_defined" to get something visible. Then fill in the rest.
//
// scene_event strings (from linked-list.json):
//   node_struct_defined
//   create_node_defined
//   insert_head_defined
//   insert_tail_defined
//   insert_at_defined
//   delete_head_defined
//   delete_node_defined
//   traverse_defined
//   search_defined
//   free_list_defined
//
// THREE.js import path — 3 levels up to repo root:
//   "../../../vendor/three/three.module.js"
// ─────────────────────────────────────────────────────────────────────────────

import * as THREE from "../../../vendor/three/three.module.js";

class LinkedListRenderer {
  constructor() {
    this.meshes = []; // All Three.js objects added by this renderer
    this.nodes  = []; // Logical node list for layout calculations
  }

  /**
   * Called by StructureRenderer when a brick fires its scene_event.
   *
   * @param {string} event
   * @param {Object} snapshot
   * @param {THREE.Scene}  scene
   * @param {THREE.Camera} camera
   */
  handleEvent(event, snapshot, scene, camera) {
    switch (event) {
      case "node_struct_defined":
        // TODO: this._showPlaceholderSphere(scene);
        break;
      case "create_node_defined":
        // TODO: this._addValueLabel(scene);
        break;
      case "insert_head_defined":
        // TODO: this._showInsertHeadDemo(scene);
        break;
      case "insert_tail_defined":
        // TODO
        break;
      case "insert_at_defined":
        // TODO
        break;
      case "delete_head_defined":
        // TODO
        break;
      case "delete_node_defined":
        // TODO
        break;
      case "traverse_defined":
        // TODO
        break;
      case "search_defined":
        // TODO
        break;
      case "free_list_defined":
        // TODO
        break;
      default:
        console.warn(`LinkedListRenderer: unknown event "${event}"`);
    }
  }

  /**
   * Removes all meshes this renderer added.
   * Called by StructureRenderer when the DS type changes.
   *
   * @param {THREE.Scene} scene
   */
  clear(scene) {
    // TODO: for (const mesh of this.meshes) scene.remove(mesh);
    // TODO: this.meshes = []; this.nodes = [];
  }

  // ── Private helpers ──────────────────────────────────────────────────────

  _showPlaceholderSphere(scene) {
    // TODO: SphereGeometry + MeshStandardMaterial → add to scene + this.meshes
  }

  _addValueLabel(scene) {
    // TODO: TextGeometry or sprite label for node value + NULL dot to the right
  }

  _showInsertHeadDemo(scene) {
    // TODO: animate new sphere + draw arrow to old head
  }
}

export default LinkedListRenderer;
