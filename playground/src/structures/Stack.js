// playground/src/structures/Stack.js
// Incremental Three.js renderer for Stack — Phase 3b

import * as THREE from "../../../vendor/three/three.module.js";

const BOX_W      = 2.2;
const BOX_H      = 0.7;
const BOX_D      = 0.7;
const STACK_X    = 0;
const BASE_Y     = -3.0;
const SLOT_COUNT = 6;
const BOX_COLOR  = 0x1e1e2e;
const FILL_COLOR = 0x4f8ef7;
const TOP_COLOR  = 0x2d9e6b;
const EMPTY_COL  = 0x2a2a3a;
const ERROR_COL  = 0xff3333;

class StackRenderer {
  constructor() {
    this.meshes    = [];
    this.slotMeshes = []; // box outlines
    this.fillMeshes = []; // filled indicators
    this._animReqs = [];
    this.topIdx    = -1;  // mirrors stack top
  }

  handleEvent(event, snapshot, scene, camera) {
    switch (event) {
      case "struct_defined":   this._onStruct(scene);    break;
      case "init_defined":     this._onInit(scene);      break;
      case "push_defined":     this._onPush(scene);      break;
      case "pop_defined":      this._onPop(scene);       break;
      case "peek_defined":     this._onPeek(scene);      break;
      case "is_empty_defined": this._onIsEmpty(scene);   break;
      case "is_full_defined":  this._onIsFull(scene);    break;
      case "display_defined":  this._onDisplay(scene);   break;
      default: console.warn(`StackRenderer: unknown event "${event}"`);
    }
  }

  clear(scene) {
    this._animReqs.forEach(id => { cancelAnimationFrame(id); clearTimeout(id); });
    this._animReqs = [];
    this.meshes.forEach(m => scene.remove(m));
    this.meshes     = [];
    this.slotMeshes = [];
    this.fillMeshes = [];
    this.topIdx     = -1;
  }

  // ── Events ─────────────────────────────────────────────────────────────────

  _onStruct(scene) {
    // Draw the empty column of box outlines
    for (let i = 0; i < SLOT_COUNT; i++) {
      const y = BASE_Y + i * (BOX_H + 0.08);
      const box = this._makeBoxWire(STACK_X, y, 0, BOX_W, BOX_H, BOX_D, EMPTY_COL);
      this.slotMeshes[i] = box;
      this._add(scene, box);
      this._makeLabel(scene, String(i), STACK_X - BOX_W * 0.7, y, 0, 0.14, "#444466");
    }
    this._makeLabel(scene, "Stack", STACK_X, BASE_Y + SLOT_COUNT * (BOX_H + 0.08) + 0.4, 0, 0.18, "#4f8ef7");
  }

  _onInit(scene) {
    // TOP pointer label showing -1
    this.topLabel = this._makeLabel(scene, "TOP = -1", STACK_X + BOX_W * 0.9, BASE_Y - 0.4, 0, 0.16, "#f5c518");
  }

  _onPush(scene) {
    // Simulate push of value 42
    this.topIdx++;
    if (this.topIdx >= SLOT_COUNT) return;
    this._fillSlot(scene, this.topIdx, "42", FILL_COLOR);
    this._updateTopLabel(scene);
    // Animate a box sliding down from above
    const y = BASE_Y + this.topIdx * (BOX_H + 0.08);
    const ghost = this._makeBoxSolid(STACK_X, y + 3, 0, BOX_W * 0.85, BOX_H * 0.85, BOX_D * 0.85, FILL_COLOR, 0.7);
    this._add(scene, ghost);
    this._animateTo(ghost, STACK_X, y, 0, 500, () => { scene.remove(ghost); this.meshes = this.meshes.filter(m => m !== ghost); });
  }

  _onPop(scene) {
    if (this.topIdx < 0) return;
    const y = BASE_Y + this.topIdx * (BOX_H + 0.08);
    const ghost = this._makeBoxSolid(STACK_X, y, 0, BOX_W * 0.85, BOX_H * 0.85, BOX_D * 0.85, TOP_COLOR, 0.7);
    this._add(scene, ghost);
    this._animateTo(ghost, STACK_X, y + 3, 0, 500, () => { scene.remove(ghost); this.meshes = this.meshes.filter(m => m !== ghost); });
    // Clear the slot fill
    const fill = this.fillMeshes[this.topIdx];
    if (fill) { setTimeout(() => { scene.remove(fill); this.meshes = this.meshes.filter(m => m !== fill); delete this.fillMeshes[this.topIdx]; }, 300); }
    this.topIdx--;
    this._updateTopLabel(scene);
  }

  _onPeek(scene) {
    if (this.topIdx < 0) return;
    const y = BASE_Y + this.topIdx * (BOX_H + 0.08);
    const pulse = this._makeBoxSolid(STACK_X, y, 0, BOX_W * 0.9, BOX_H * 0.9, BOX_D * 0.9, TOP_COLOR, 0.5);
    this._add(scene, pulse);
    const id = setTimeout(() => { scene.remove(pulse); this.meshes = this.meshes.filter(m => m !== pulse); }, 1000);
    this._animReqs.push(id);
    this._makeLabel(scene, "peek →", STACK_X + BOX_W * 0.9, BASE_Y + this.topIdx * (BOX_H + 0.08), 0, 0.15, "#2d9e6b");
  }

  _onIsEmpty(scene) {
    this._makeLabel(scene, this.topIdx === -1 ? "isEmpty: true" : "isEmpty: false",
      STACK_X, BASE_Y - 0.9, 0, 0.14, this.topIdx === -1 ? "#4fc97e" : "#4a4f6a");
  }

  _onIsFull(scene) {
    this._makeLabel(scene, "MAX = " + SLOT_COUNT, STACK_X, BASE_Y + SLOT_COUNT * (BOX_H + 0.08) + 0.9, 0, 0.14, "#f59e0b");
    // Highlight the top box red as overflow warning
    const topY = BASE_Y + (SLOT_COUNT - 1) * (BOX_H + 0.08);
    const warn = this._makeBoxWire(STACK_X, topY, 0, BOX_W, BOX_H, BOX_D, ERROR_COL);
    this._add(scene, warn);
  }

  _onDisplay(scene) {
    // Pulse each filled slot top → bottom
    for (let i = this.topIdx; i >= 0; i--) {
      const idx = i;
      const id = setTimeout(() => {
        const fill = this.fillMeshes[idx];
        if (fill) {
          const orig = fill.material.color.getHex();
          fill.material.color.setHex(FILL_COLOR);
          const id2 = setTimeout(() => { if (fill.material) fill.material.color.setHex(orig); }, 400);
          this._animReqs.push(id2);
        }
      }, (this.topIdx - i) * 300);
      this._animReqs.push(id);
    }
  }

  // ── Internals ────────────────────────────────────────────────────────────────

  _fillSlot(scene, idx, label, color) {
    const y = BASE_Y + idx * (BOX_H + 0.08);
    const fill = this._makeBoxSolid(STACK_X, y, 0, BOX_W * 0.88, BOX_H * 0.88, BOX_D * 0.88, color, 0.85);
    this.fillMeshes[idx] = fill;
    this._add(scene, fill);
    this._makeLabel(scene, label, STACK_X, y, 0, 0.17, "#cdd6f4");
  }

  _updateTopLabel(scene) {
    // Remove old top label and re-add
    if (this.topLabel) { scene.remove(this.topLabel); this.meshes = this.meshes.filter(m => m !== this.topLabel); }
    const y = this.topIdx >= 0 ? BASE_Y + this.topIdx * (BOX_H + 0.08) : BASE_Y - 0.4;
    this.topLabel = this._makeLabel(scene, `TOP = ${this.topIdx}`, STACK_X + BOX_W * 0.9, y, 0, 0.16, "#f5c518");
  }

  _makeBoxWire(x, y, z, w, h, d, color) {
    const geo  = new THREE.BoxGeometry(w, h, d);
    const mat  = new THREE.MeshBasicMaterial({ color, wireframe: true });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    return mesh;
  }

  _makeBoxSolid(x, y, z, w, h, d, color, opacity = 1) {
    const geo  = new THREE.BoxGeometry(w, h, d);
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
    ctx.font = "bold 26px 'Space Mono', monospace";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(text, 128, 32);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true }));
    sprite.position.set(x, y, z);
    sprite.scale.set(size * 9, size * 2.2, 1);
    this._add(scene, sprite);
    return sprite;
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

export default StackRenderer;
