// playground/src/structures/Graph.js
// Incremental Three.js renderer for Graph — Phase 3c

import * as THREE from "../../../vendor/three/three.module.js";

// 6 vertices in a hexagonal layout
const VERTICES = [
  { label: "A", x:  0,    y:  2.5  },
  { label: "B", x:  2.4,  y:  1.2  },
  { label: "C", x:  2.4,  y: -1.2  },
  { label: "D", x:  0,    y: -2.5  },
  { label: "E", x: -2.4,  y: -1.2  },
  { label: "F", x: -2.4,  y:  1.2  },
];
const EDGES = [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[0,3],[1,4]];

const V_COLOR    = 0x4f8ef7;
const V_VISITED  = 0x2d9e6b;
const V_ACTIVE   = 0xf5c518;
const EDGE_COLOR = 0x2a3a5a;
const EDGE_ACTIVE= 0x4f8ef7;

class GraphRenderer {
  constructor() {
    this.meshes      = [];
    this.vertMeshes  = [];
    this.edgeMeshes  = [];
    this._animReqs   = [];
  }

  handleEvent(event, snapshot, scene, camera) {
    switch (event) {
      case "adj_node_struct_defined": this._onAdjStruct(scene);    break;
      case "graph_struct_defined":    this._onGraphStruct(scene);  break;
      case "create_node_defined":     /* internal helper, no vis */ break;
      case "create_graph_defined":    this._onCreateGraph(scene);  break;
      case "add_edge_defined":        this._onAddEdge(scene);      break;
      case "bfs_defined":             this._onBFS(scene);          break;
      case "dfs_defined":             this._onDFS(scene);          break;
      case "print_graph_defined":     this._onPrint(scene);        break;
      default: console.warn(`GraphRenderer: unknown event "${event}"`);
    }
  }

  clear(scene) {
    this._animReqs.forEach(id => { cancelAnimationFrame(id); clearTimeout(id); });
    this._animReqs = [];
    this.meshes.forEach(m => scene.remove(m));
    this.meshes = []; this.vertMeshes = []; this.edgeMeshes = [];
  }

  _onAdjStruct(scene) {
    // Faint grid hint
    const grid = new THREE.GridHelper(10, 10, 0x1a1a2a, 0x1a1a2a);
    grid.position.y = -4;
    this._add(scene, grid);
    this._makeLabel(scene, "AdjNode list", 0, 3.3, 0, 0.16, "#2a2a4a");
  }

  _onGraphStruct(scene) {
    // Draw placeholder circles for each vertex
    VERTICES.forEach((v, i) => {
      const mesh = this._makeSphere(v.x, v.y, 0, 0.45, 0x2a2a3a, 0.5);
      this.vertMeshes[i] = mesh;
      this._add(scene, mesh);
    });
  }

  _onCreateGraph(scene) {
    // Solidify the vertex spheres and add labels
    VERTICES.forEach((v, i) => {
      const old = this.vertMeshes[i];
      if (old) { scene.remove(old); this.meshes = this.meshes.filter(m => m !== old); }
      const mesh = this._makeSphere(v.x, v.y, 0, 0.5, V_COLOR);
      this.vertMeshes[i] = mesh;
      this._add(scene, mesh);
      this._makeLabel(scene, v.label, v.x, v.y, 0, 0.2, "#ffffff");
    });
  }

  _onAddEdge(scene) {
    EDGES.forEach(([a, b], idx) => {
      const id = setTimeout(() => {
        const va = VERTICES[a], vb = VERTICES[b];
        const line = this._makeLine(va.x, va.y, 0, vb.x, vb.y, 0, EDGE_COLOR);
        this.edgeMeshes.push(line);
        this._add(scene, line);
      }, idx * 200);
      this._animReqs.push(id);
    });
  }

  _onBFS(scene) {
    // BFS from A: level 0→A, level 1→B,F, level 2→C,E,D(via F)...
    const bfsOrder = [0, 1, 5, 2, 4, 3];
    const levels   = [0, 1, 1, 2, 2, 2];
    bfsOrder.forEach((vi, step) => {
      const id = setTimeout(() => {
        const mesh = this.vertMeshes[vi];
        if (mesh) {
          mesh.material.color.setHex(V_ACTIVE);
          const id2 = setTimeout(() => { if (mesh.material) mesh.material.color.setHex(V_VISITED); }, 400);
          this._animReqs.push(id2);
        }
      }, step * 600);
      this._animReqs.push(id);
    });
    this._makeLabel(scene, "BFS from A", 0, 3.5, 0, 0.16, "#f5c518");
  }

  _onDFS(scene) {
    // DFS from A: A→B→C→D→E→F
    const dfsOrder = [0, 1, 2, 3, 4, 5];
    dfsOrder.forEach((vi, step) => {
      const id = setTimeout(() => {
        const mesh = this.vertMeshes[vi];
        if (mesh) {
          mesh.material.color.setHex(V_ACTIVE);
          const id2 = setTimeout(() => { if (mesh.material) mesh.material.color.setHex(V_VISITED); }, 350);
          this._animReqs.push(id2);
        }
        // Highlight the edge we just traversed
        if (step > 0) {
          const edge = this.edgeMeshes.find(e => {
            const pos = e.geometry?.attributes?.position?.array;
            if (!pos) return false;
            const a = VERTICES[dfsOrder[step-1]], b = VERTICES[vi];
            return (Math.abs(pos[0]-a.x)<0.1 && Math.abs(pos[3]-b.x)<0.1) ||
                   (Math.abs(pos[0]-b.x)<0.1 && Math.abs(pos[3]-a.x)<0.1);
          });
          if (edge) edge.material.color.setHex(EDGE_ACTIVE);
        }
      }, step * 550);
      this._animReqs.push(id);
    });
    this._makeLabel(scene, "DFS from A", 0, 3.5, 0, 0.16, "#a78bfa");
  }

  _onPrint(scene) {
    VERTICES.forEach((v, i) => {
      const mesh = this.vertMeshes[i];
      if (!mesh) return;
      const id = setTimeout(() => {
        const orig = mesh.material.color.getHex();
        mesh.material.color.setHex(V_ACTIVE);
        const id2 = setTimeout(() => { if (mesh.material) mesh.material.color.setHex(orig); }, 500);
        this._animReqs.push(id2);
      }, i * 400);
      this._animReqs.push(id);
    });
  }

  _makeSphere(x, y, z, r, color, opacity=1) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r,32,32), new THREE.MeshStandardMaterial({color,transparent:opacity<1,opacity}));
    m.position.set(x,y,z); return m;
  }
  _makeLine(x1,y1,z1,x2,y2,z2,color) {
    const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x1,y1,z1),new THREE.Vector3(x2,y2,z2)]);
    const mat = new THREE.LineBasicMaterial({color});
    const line = new THREE.Line(geo,mat);
    return line;
  }
  _add(scene,obj){scene.add(obj);this.meshes.push(obj);return obj;}
  _makeLabel(scene,text,x,y,z,size,color){
    const canvas=document.createElement("canvas");canvas.width=256;canvas.height=64;
    const ctx=canvas.getContext("2d");ctx.clearRect(0,0,256,64);
    ctx.fillStyle=color;ctx.font="bold 26px 'Space Mono', monospace";
    ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(text,128,32);
    const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(canvas),transparent:true}));
    sprite.position.set(x,y,z);sprite.scale.set(size*8,size*2,1);
    this._add(scene,sprite);return sprite;
  }
}

export default GraphRenderer;
