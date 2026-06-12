// playground/src/structures/BinaryTree.js
// Incremental Three.js renderer for Binary Tree — Phase 3a

import * as THREE from "../../../vendor/three/three.module.js";

const NODE_RADIUS  = 0.52;
const NODE_COLOR   = 0x4f8ef7;
const NULL_COLOR   = 0x2a2a3a;
const PLACED_COLOR = 0x2d9e6b;
const TRAVERSE_CLR = 0xf5c518;
const SEARCH_HIT   = 0x4fc97e;
const ERROR_COLOR  = 0xff3333;

// Static demo tree layout: value → {x, y, parent}
const DEMO_TREE = [
  { val: "50", x:  0,    y:  0,    parent: null },
  { val: "30", x: -2.5,  y: -2.0,  parent: 0    },
  { val: "70", x:  2.5,  y: -2.0,  parent: 0    },
  { val: "20", x: -3.8,  y: -4.0,  parent: 1    },
  { val: "40", x: -1.2,  y: -4.0,  parent: 1    },
  { val: "60", x:  1.2,  y: -4.0,  parent: 2    },
  { val: "80", x:  3.8,  y: -4.0,  parent: 2    },
];

class BinaryTreeRenderer {
  constructor() {
    this.meshes    = [];
    this.nodeMeshes = []; // indexed same as DEMO_TREE
    this._animReqs = [];
  }

  handleEvent(event, snapshot, scene, camera) {
    switch (event) {
      case "node_struct_defined":  this._onStructDefined(scene);  break;
      case "create_node_defined":  this._onCreateNode(scene);     break;
      case "insert_defined":       this._onInsert(scene);         break;
      case "search_defined":       this._onSearch(scene);         break;
      case "inorder_defined":      this._onInorder(scene);        break;
      case "preorder_defined":     this._onPreorder(scene);       break;
      case "postorder_defined":    this._onPostorder(scene);      break;
      case "delete_node_defined":  this._onDelete(scene);         break;
      case "height_defined":       this._onHeight(scene);         break;
      default: console.warn(`BinaryTreeRenderer: unknown event "${event}"`);
    }
  }

  clear(scene) {
    this._animReqs.forEach(id => { cancelAnimationFrame(id); clearTimeout(id); });
    this._animReqs = [];
    this.meshes.forEach(m => scene.remove(m));
    this.meshes     = [];
    this.nodeMeshes = [];
  }

  // ── Events ─────────────────────────────────────────────────────────────────

  _onStructDefined(scene) {
    const ph = this._makeSphere(0, 0, 0, 0.7, NULL_COLOR, 0.4);
    ph.userData.isPlaceholder = true;
    this._add(scene, ph);
  }

  _onCreateNode(scene) {
    const ph = this.meshes.find(m => m.userData.isPlaceholder);
    if (ph) { scene.remove(ph); this.meshes = this.meshes.filter(m => m !== ph); }

    // Root only
    const root = DEMO_TREE[0];
    const mesh = this._makeSphere(root.x, root.y, 0, NODE_RADIUS, NODE_COLOR);
    this._add(scene, mesh);
    this.nodeMeshes[0] = mesh;
    this._makeLabel(scene, root.val, root.x, root.y + 0.85, 0, 0.18, "#cdd6f4");
    // Two NULL placeholders below
    this._makeLabel(scene, "NULL", root.x - 1.0, root.y - 1.0, 0, 0.14, "#444466");
    this._makeLabel(scene, "NULL", root.x + 1.0, root.y - 1.0, 0, 0.14, "#444466");
  }

  _onInsert(scene) {
    // Build the full demo tree
    DEMO_TREE.forEach((node, idx) => {
      if (idx === 0 && this.nodeMeshes[0]) return; // root already exists
      const mesh = this._makeSphere(node.x, node.y, 0, NODE_RADIUS, NODE_COLOR);
      this._add(scene, mesh);
      this.nodeMeshes[idx] = mesh;
      this._makeLabel(scene, node.val, node.x, node.y + 0.75, 0, 0.16, "#cdd6f4");
      // Edge to parent
      if (node.parent !== null) {
        const p = DEMO_TREE[node.parent];
        this._makeArrow(scene, p.x, p.y - 0.52, 0, node.x, node.y + 0.52, 0);
      }
    });
  }

  _onSearch(scene) {
    // Highlight path 50→70→60 (searching for 60)
    const path = [0, 2, 5];
    path.forEach((idx, step) => {
      const id = setTimeout(() => {
        const m = this.nodeMeshes[idx];
        if (m) {
          m.material.color.setHex(step === path.length - 1 ? SEARCH_HIT : TRAVERSE_CLR);
        }
      }, step * 500);
      this._animReqs.push(id);
    });
    this._makeLabel(scene, "search(60)", 1.2, 1.2, 0, 0.15, "#4fc97e");
  }

  _onInorder(scene) {
    // Inorder: 20,30,40,50,60,70,80 → indices 3,1,4,0,5,2,6
    const order = [3, 1, 4, 0, 5, 2, 6];
    this._traverseHighlight(order, TRAVERSE_CLR);
    this._makeLabel(scene, "L→Root→R", 0, 1.4, 0, 0.15, "#f5c518");
  }

  _onPreorder(scene) {
    // Preorder: 50,30,20,40,70,60,80 → 0,1,3,4,2,5,6
    const order = [0, 1, 3, 4, 2, 5, 6];
    this._traverseHighlight(order, 0xf59e0b);
    this._makeLabel(scene, "Root→L→R", 0, 1.4, 0, 0.15, "#f59e0b");
  }

  _onPostorder(scene) {
    // Postorder: 20,40,30,60,80,70,50 → 3,4,1,5,6,2,0
    const order = [3, 4, 1, 5, 6, 2, 0];
    this._traverseHighlight(order, 0xa78bfa);
    this._makeLabel(scene, "L→R→Root", 0, 1.4, 0, 0.15, "#a78bfa");
  }

  _onDelete(scene) {
    // Delete node 30 (idx 1) — show successor (40, idx 4) swooping up
    const target = this.nodeMeshes[1];
    const succ   = this.nodeMeshes[4];
    if (target) this._fadeOut(target, 800);
    if (succ) {
      const id = setTimeout(() => {
        this._animateTo(succ, DEMO_TREE[1].x, DEMO_TREE[1].y, 0, 600, null);
        succ.material.color.setHex(PLACED_COLOR);
      }, 900);
      this._animReqs.push(id);
    }
    this._makeLabel(scene, "delete(30)", DEMO_TREE[1].x, DEMO_TREE[1].y - 1.2, 0, 0.14, "#ff6b6b");
  }

  _onHeight(scene) {
    // Show depth labels beside each node
    const depths = [0, 1, 1, 2, 2, 2, 2];
    DEMO_TREE.forEach((node, idx) => {
      this._makeLabel(scene, `h:${depths[idx]}`, node.x + 0.85, node.y + 0.2, 0, 0.13, "#4a4f8a");
    });
    this._makeLabel(scene, "height = 2", 0, 1.4, 0, 0.15, "#4f8ef7");
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  _traverseHighlight(order, color) {
    order.forEach((idx, step) => {
      const id = setTimeout(() => {
        const m = this.nodeMeshes[idx];
        if (m) {
          m.material.color.setHex(color);
          const id2 = setTimeout(() => { if (m.material) m.material.color.setHex(NODE_COLOR); }, 600);
          this._animReqs.push(id2);
        }
      }, step * 450);
      this._animReqs.push(id);
    });
  }

  _makeSphere(x, y, z, r, color, opacity = 1) {
    const geo  = new THREE.SphereGeometry(r, 32, 32);
    const mat  = new THREE.MeshStandardMaterial({ color, transparent: opacity < 1, opacity });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    return mesh;
  }

  _add(scene, obj) { scene.add(obj); this.meshes.push(obj); return obj; }

  _makeLabel(scene, text, x, y, z, size, color) {
    const canvas = document.createElement("canvas");
    canvas.width = 256; canvas.height = 64;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, 256, 64);
    ctx.fillStyle = color;
    ctx.font = "bold 28px 'Space Mono', monospace";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(text, 128, 32);
    const tex    = new THREE.CanvasTexture(canvas);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
    sprite.position.set(x, y, z);
    sprite.scale.set(size * 8, size * 2, 1);
    this._add(scene, sprite);
    return sprite;
  }

  _makeArrow(scene, x1, y1, z1, x2, y2, z2) {
    const dir = new THREE.Vector3(x2-x1, y2-y1, z2-z1);
    const len = dir.length();
    dir.normalize();
    const arrow = new THREE.ArrowHelper(dir, new THREE.Vector3(x1,y1,z1), len, 0x2a4a7a, 0.2, 0.12);
    this._add(scene, arrow);
    return arrow;
  }

  _fadeOut(mesh, duration) {
    if (!mesh?.material) return;
    mesh.material.transparent = true;
    const start = performance.now(), startOp = mesh.material.opacity;
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      if (mesh.material) mesh.material.opacity = startOp * (1 - t);
      if (t < 1) { const id = requestAnimationFrame(tick); this._animReqs.push(id); }
      else if (mesh.parent) { mesh.parent.remove(mesh); this.meshes = this.meshes.filter(m => m !== mesh); }
    };
    this._animReqs.push(requestAnimationFrame(tick));
  }

  _animateTo(mesh, tx, ty, tz, duration, onDone) {
    const sx = mesh.position.x, sy = mesh.position.y, sz = mesh.position.z;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const e = 1 - Math.pow(1 - t, 3);
      mesh.position.set(sx+(tx-sx)*e, sy+(ty-sy)*e, sz+(tz-sz)*e);
      if (t < 1) { const id = requestAnimationFrame(tick); this._animReqs.push(id); }
      else if (onDone) onDone();
    };
    this._animReqs.push(requestAnimationFrame(tick));
  }
}

export default BinaryTreeRenderer;
