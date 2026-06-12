// playground/src/structures/LinkedList.js
// Full incremental Three.js renderer for Linked List — Phase 3a

import * as THREE from "../../../vendor/three/three.module.js";

// ── Visual constants ──────────────────────────────────────────────────────────
const NODE_RADIUS   = 0.55;
const NODE_SPACING  = 2.8;
const NODE_COLOR    = 0x4f8ef7;
const NULL_COLOR    = 0x2a2a3a;
const ARROW_COLOR   = 0x4f8ef7;
const ERROR_COLOR   = 0xff3333;
const PLACED_COLOR  = 0x2d9e6b;
const TRAVERSE_CLR  = 0xf5c518;
const SEARCH_HIT    = 0x4fc97e;

class LinkedListRenderer {
  constructor() {
    this.meshes     = [];   // every Three.js object we own
    this.nodeGroup  = [];   // { mesh, label } — logical node list for layout
    this._animReqs  = [];   // rAF ids to cancel on clear
  }

  handleEvent(event, snapshot, scene, camera) {
    switch (event) {
      case "node_struct_defined":    this._onStructDefined(scene);         break;
      case "create_node_defined":    this._onCreateNode(scene);            break;
      case "insert_head_defined":    this._onInsertHead(scene);            break;
      case "insert_tail_defined":    this._onInsertTail(scene);            break;
      case "insert_at_defined":      this._onInsertAt(scene);              break;
      case "delete_head_defined":    this._onDeleteHead(scene);            break;
      case "delete_node_defined":    this._onDeleteNode(scene);            break;
      case "traverse_defined":       this._onTraverse(scene);              break;
      case "search_defined":         this._onSearch(scene);                break;
      case "free_list_defined":      this._onFreeList(scene);              break;
      default:
        console.warn(`LinkedListRenderer: unknown event "${event}"`);
    }
  }

  clear(scene) {
    this._animReqs.forEach(id => cancelAnimationFrame(id));
    this._animReqs = [];
    this.meshes.forEach(m => scene.remove(m));
    this.meshes    = [];
    this.nodeGroup = [];
  }

  // ── Scene events ────────────────────────────────────────────────────────────

  // 1. struct Node → single grey placeholder sphere
  _onStructDefined(scene) {
    const mesh = this._makeSphere(0, 0, 0, 0.7, NULL_COLOR, 0.5);
    mesh.userData.isPlaceholder = true;
    this._add(scene, mesh);
  }

  // 2. createNode() → turn placeholder into a real styled node + NULL dot
  _onCreateNode(scene) {
    // Remove placeholder if it exists
    const ph = this.meshes.find(m => m.userData.isPlaceholder);
    if (ph) { scene.remove(ph); this.meshes = this.meshes.filter(m => m !== ph); }

    // Spawn the first demo node at origin
    this._spawnNode(scene, 0, "42");

    // NULL terminator dot
    const nullDot = this._makeSphere(NODE_SPACING, 0, 0, 0.18, NULL_COLOR);
    this._add(scene, nullDot);
    this._makeLabel(scene, "NULL", NODE_SPACING, -0.55, 0, 0.18, "#666688");

    // Arrow from node to NULL
    this._makeArrow(scene, 0.55, 0, 0, NODE_SPACING - 0.2, 0, 0);
  }

  // 3. insertHead() → demo: a second node prepended to the left
  _onInsertHead(scene) {
    // Add a node to the left at -NODE_SPACING
    const newMesh = this._spawnNode(scene, -NODE_SPACING, "17");
    // Arrow: new → existing
    this._makeArrow(scene, -NODE_SPACING + 0.55, 0, 0, -0.55, 0, 0);
    // Move existing NULL dot and label further right
    this._pulseColor(newMesh, PLACED_COLOR, 800);
  }

  // 4. insertTail() → demo: another node appended to the right
  _onInsertTail(scene) {
    const rightX = NODE_SPACING * 2;
    const mesh = this._spawnNode(scene, rightX, "99");
    // Arrow from previous rightmost to new
    this._makeArrow(scene, NODE_SPACING - 0.4, 0, 0, rightX - 0.55, 0, 0);
    this._pulseColor(mesh, PLACED_COLOR, 800);
  }

  // 5. insertAt() → highlight arrow re-routing with a differently coloured node
  _onInsertAt(scene) {
    const midX = NODE_SPACING * 0.5;
    const mesh = this._makeSphere(midX, 1.4, 0, NODE_RADIUS, 0xf59e0b);
    this._add(scene, mesh);
    this._makeLabel(scene, "insertAt", midX, 2.2, 0, 0.13, "#f59e0b");
    // Show re-route arrows in amber
    this._makeArrowColor(scene, -NODE_SPACING + 0.55, 0, 0, midX - 0.4, 1.2, 0, 0xf59e0b);
    this._makeArrowColor(scene, midX + 0.4, 1.2, 0, 0.55, 0.2, 0, 0xf59e0b);
    this._pulseColor(mesh, PLACED_COLOR, 1200);
  }

  // 6. deleteHead() → dim the leftmost node
  _onDeleteHead(scene) {
    const leftmost = this.meshes.find(m =>
      m.geometry?.type === "SphereGeometry" &&
      !m.userData.isNull &&
      m.position.x === Math.min(...this.meshes
        .filter(x => x.geometry?.type === "SphereGeometry" && !x.userData.isNull)
        .map(x => x.position.x))
    );
    if (leftmost) {
      this._fadeOut(leftmost, 1000);
      // Ghost marker
      const ghost = this._makeSphere(leftmost.position.x, leftmost.position.y, 0, NODE_RADIUS, ERROR_COLOR, 0.15);
      this._add(scene, ghost);
      this._makeLabel(scene, "freed", leftmost.position.x, -1.4, 0, 0.12, "#ff3333");
    }
  }

  // 7. deleteNode() → show a middle-of-list deletion with gap close
  _onDeleteNode(scene) {
    const target = this._makeSphere(0, 0, 0, NODE_RADIUS * 0.85, ERROR_COLOR, 0.25);
    target.userData.isNull = false;
    this._add(scene, target);
    this._makeLabel(scene, "deleted", 0, -1.4, 0, 0.12, "#ff3333");
    // Bypass arrow
    this._makeArrowColor(scene, -NODE_SPACING + 0.55, 0.05, 0, NODE_SPACING - 0.55, 0.05, 0, PLACED_COLOR);
  }

  // 8. traverse() → animate a glowing packet along the list
  _onTraverse(scene) {
    const packet = this._makeSphere(-NODE_SPACING, 0, 0, 0.28, TRAVERSE_CLR);
    this._add(scene, packet);
    const targets = [-NODE_SPACING, 0, NODE_SPACING * 2];
    let i = 0;
    const step = () => {
      if (i >= targets.length) {
        scene.remove(packet);
        this.meshes = this.meshes.filter(m => m !== packet);
        return;
      }
      this._animateTo(packet, targets[i], 0, 0, 500, () => {
        i++;
        const id = setTimeout(step, 300);
        this._animReqs.push(id);
      });
      i++;
    };
    step();
    this._makeLabel(scene, "traverse →", 0, 1.5, 0, 0.13, "#f5c518");
  }

  // 9. search() → traverse + highlight one node green
  _onSearch(scene) {
    this._makeLabel(scene, "search(99)", NODE_SPACING * 2, 1.5, 0, 0.13, "#4fc97e");
    // Highlight the tail node (99) in green
    const rightMost = this.meshes.filter(m =>
      m.geometry?.type === "SphereGeometry" && !m.userData.isPlaceholder
    ).sort((a, b) => b.position.x - a.position.x)[0];
    if (rightMost) this._pulseColor(rightMost, SEARCH_HIT, 0);
  }

  // 10. freeList() → fade all nodes out sequentially
  _onFreeList(scene) {
    const nodes = this.meshes.filter(m =>
      m.geometry?.type === "SphereGeometry" && !m.userData.isPlaceholder
    ).sort((a, b) => a.position.x - b.position.x);

    nodes.forEach((mesh, idx) => {
      const delay = idx * 250;
      const id = setTimeout(() => this._fadeOut(mesh, 600), delay);
      this._animReqs.push(id);
    });
    this._makeLabel(scene, "free →", 0, 2.2, 0, 0.13, "#ff6b6b");
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  _makeSphere(x, y, z, r, color, opacity = 1) {
    const geo  = new THREE.SphereGeometry(r, 32, 32);
    const mat  = new THREE.MeshStandardMaterial({
      color,
      transparent: opacity < 1,
      opacity,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    return mesh;
  }

  _add(scene, obj) {
    scene.add(obj);
    this.meshes.push(obj);
    return obj;
  }

  _spawnNode(scene, x, label) {
    const mesh = this._makeSphere(x, 0, 0, NODE_RADIUS, NODE_COLOR);
    this._add(scene, mesh);
    this._makeLabel(scene, label, x, -0.95, 0, 0.2, "#cdd6f4");
    return mesh;
  }

  _makeLabel(scene, text, x, y, z, size, color) {
    // Sprite-based label using canvas texture
    const canvas  = document.createElement("canvas");
    canvas.width  = 256;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, 256, 64);
    ctx.fillStyle = color;
    ctx.font = "bold 28px 'Space Mono', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 128, 32);

    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
    const sprite = new THREE.Sprite(mat);
    sprite.position.set(x, y, z);
    sprite.scale.set(size * 8, size * 2, 1);
    this._add(scene, sprite);
    return sprite;
  }

  _makeArrow(scene, x1, y1, z1, x2, y2, z2) {
    return this._makeArrowColor(scene, x1, y1, z1, x2, y2, z2, ARROW_COLOR);
  }

  _makeArrowColor(scene, x1, y1, z1, x2, y2, z2, color) {
    const dir    = new THREE.Vector3(x2 - x1, y2 - y1, z2 - z1);
    const len    = dir.length();
    const origin = new THREE.Vector3(x1, y1, z1);
    dir.normalize();
    const arrow = new THREE.ArrowHelper(dir, origin, len, color, 0.25, 0.15);
    this._add(scene, arrow);
    return arrow;
  }

  _pulseColor(mesh, color, delay) {
    const original = mesh.material.color.getHex();
    const id = setTimeout(() => {
      if (mesh.material) {
        mesh.material.color.setHex(color);
        const id2 = setTimeout(() => {
          if (mesh.material) mesh.material.color.setHex(original);
        }, 800);
        this._animReqs.push(id2);
      }
    }, delay);
    this._animReqs.push(id);
  }

  _fadeOut(mesh, duration) {
    if (!mesh.material) return;
    mesh.material.transparent = true;
    const start    = performance.now();
    const startOp  = mesh.material.opacity;
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      if (mesh.material) mesh.material.opacity = startOp * (1 - t);
      if (t < 1) {
        const id = requestAnimationFrame(tick);
        this._animReqs.push(id);
      } else if (mesh.parent) {
        mesh.parent.remove(mesh);
        this.meshes = this.meshes.filter(m => m !== mesh);
      }
    };
    const id = requestAnimationFrame(tick);
    this._animReqs.push(id);
  }

  _animateTo(mesh, tx, ty, tz, duration, onDone) {
    const sx = mesh.position.x, sy = mesh.position.y, sz = mesh.position.z;
    const start = performance.now();
    const tick  = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const e = 1 - Math.pow(1 - t, 3); // ease-out cubic
      mesh.position.set(
        sx + (tx - sx) * e,
        sy + (ty - sy) * e,
        sz + (tz - sz) * e
      );
      if (t < 1) {
        const id = requestAnimationFrame(tick);
        this._animReqs.push(id);
      } else if (onDone) onDone();
    };
    const id = requestAnimationFrame(tick);
    this._animReqs.push(id);
  }
}

export default LinkedListRenderer;
