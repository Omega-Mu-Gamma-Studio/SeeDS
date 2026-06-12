// playground/src/structures/Graph.js
// ─────────────────────────────────────────────────────────────────────────────
// Incremental Three.js renderer for Graph in Playground Mode.
// Phase 3c — implement last.
//
// scene_event strings (from graph.json):
//   adj_node_struct_defined, graph_struct_defined, create_node_defined,
//   create_graph_defined, add_edge_defined, bfs_defined,
//   dfs_defined, print_graph_defined
//
// THREE.js import: "../../../vendor/three/three.module.js"
// ─────────────────────────────────────────────────────────────────────────────

import * as THREE from "../../../vendor/three/three.module.js";

class GraphRenderer {
  constructor() { this.meshes = []; }

  handleEvent(event, snapshot, scene, camera) {
    // TODO: implement one case per scene_event in graph.json
    console.warn(`GraphRenderer: not yet implemented (event: "${event}")`);
  }

  clear(scene) {
    for (const mesh of this.meshes) scene.remove(mesh);
    this.meshes = [];
  }
}

export default GraphRenderer;
