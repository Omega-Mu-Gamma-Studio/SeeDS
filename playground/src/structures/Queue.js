// playground/src/structures/Queue.js
// Incremental Three.js renderer for Queue — Phase 3b

import * as THREE from "../../../vendor/three/three.module.js";

const BOX_W     = 1.6;
const BOX_H     = 1.0;
const BOX_D     = 0.7;
const START_X   = -4.5;
const QUEUE_Y   = 0;
const SLOT_COUNT = 6;
const GAP       = 0.1;
const FILL_COL  = 0x4f8ef7;
const EMPTY_COL = 0x2a2a3a;
const FRONT_COL = 0x2d9e6b;
const REAR_COL  = 0xf59e0b;
const ERROR_COL = 0xff3333;

class QueueRenderer {
  constructor() {
    this.meshes     = [];
    this.fillMeshes = [];
    this._animReqs  = [];
    this.frontIdx   = -1;
    this.rearIdx    = -1;
    this.frontArrow = null;
    this.rearArrow  = null;
  }

  handleEvent(event, snapshot, scene, camera) {
    switch (event) {
      case "struct_defined":   this._onStruct(scene);   break;
      case "init_defined":     this._onInit(scene);     break;
      case "enqueue_defined":  this._onEnqueue(scene);  break;
      case "dequeue_defined":  this._onDequeue(scene);  break;
      case "front_defined":    this._onFront(scene);    break;
      case "is_empty_defined": this._onIsEmpty(scene);  break;
      case "is_full_defined":  this._onIsFull(scene);   break;
      case "display_defined":  this._onDisplay(scene);  break;
      default: console.warn(`QueueRenderer: unknown event "${event}"`);
    }
  }

  clear(scene) {
    this._animReqs.forEach(id => { cancelAnimationFrame(id); clearTimeout(id); });
    this._animReqs = [];
    this.meshes.forEach(m => scene.remove(m));
    this.meshes = []; this.fillMeshes = [];
    this.frontIdx = -1; this.rearIdx = -1;
    this.frontArrow = null; this.rearArrow = null;
  }

  _slotX(i) { return START_X + i * (BOX_W + GAP) + BOX_W / 2; }

  _onStruct(scene) {
    for (let i = 0; i < SLOT_COUNT; i++) {
      const box = this._makeBoxWire(this._slotX(i), QUEUE_Y, 0, BOX_W, BOX_H, BOX_D, EMPTY_COL);
      this._add(scene, box);
      this._makeLabel(scene, String(i), this._slotX(i), QUEUE_Y - BOX_H * 0.9, 0, 0.13, "#444466");
    }
    this._makeLabel(scene, "Queue →", START_X - 0.6, QUEUE_Y, 0, 0.16, "#4f8ef7");
  }

  _onInit(scene) {
    this.frontLabel = this._makeLabel(scene, "F=-1", this._slotX(0), QUEUE_Y + 1.0, 0, 0.15, "#2d9e6b");
    this.rearLabel  = this._makeLabel(scene, "R=-1", this._slotX(SLOT_COUNT - 1), QUEUE_Y + 1.0, 0, 0.15, "#f59e0b");
  }

  _onEnqueue(scene) {
    this.rearIdx++;
    if (this.rearIdx >= SLOT_COUNT) return;
    if (this.frontIdx === -1) this.frontIdx = 0;
    const vals = ["10", "20", "30"];
    const val  = vals[this.rearIdx] || String(this.rearIdx * 10);
    // Ghost slide in from the right
    const x = this._slotX(this.rearIdx);
    const ghost = this._makeBoxSolid(x + 4, QUEUE_Y, 0, BOX_W * 0.85, BOX_H * 0.85, BOX_D * 0.85, FILL_COL, 0.7);
    this._add(scene, ghost);
    this._animateTo(ghost, x, QUEUE_Y, 0, 450, () => {
      scene.remove(ghost); this.meshes = this.meshes.filter(m => m !== ghost);
      const fill = this._makeBoxSolid(x, QUEUE_Y, 0, BOX_W * 0.88, BOX_H * 0.88, BOX_D * 0.88, FILL_COL, 0.9);
      this.fillMeshes[this.rearIdx] = fill;
      this._add(scene, fill);
      this._makeLabel(scene, val, x, QUEUE_Y, 0, 0.16, "#cdd6f4");
    });
    this._updatePointerLabels(scene);
  }

  _onDequeue(scene) {
    if (this.frontIdx === -1 || this.frontIdx > this.rearIdx) return;
    const fill = this.fillMeshes[this.frontIdx];
    if (fill) this._animateTo(fill, this._slotX(this.frontIdx) - 4, QUEUE_Y, 0, 450, () => {
      scene.remove(fill); this.meshes = this.meshes.filter(m => m !== fill); delete this.fillMeshes[this.frontIdx];
    });
    this.frontIdx++;
    this._updatePointerLabels(scene);
  }

  _onFront(scene) {
    const fill = this.fillMeshes[this.frontIdx];
    if (fill) {
      const orig = fill.material.color.getHex();
      fill.material.color.setHex(FRONT_COL);
      const id = setTimeout(() => { if (fill.material) fill.material.color.setHex(orig); }, 900);
      this._animReqs.push(id);
    }
    this._makeLabel(scene, "peek front", this._slotX(this.frontIdx), QUEUE_Y - 1.2, 0, 0.14, "#2d9e6b");
  }

  _onIsEmpty(scene) {
    const empty = this.frontIdx === -1 || this.frontIdx > this.rearIdx;
    this._makeLabel(scene, empty ? "isEmpty: true" : "isEmpty: false",
      this._slotX(2), QUEUE_Y - 1.5, 0, 0.14, empty ? "#4fc97e" : "#4a4f6a");
  }

  _onIsFull(scene) {
    this._makeLabel(scene, "MAX = " + SLOT_COUNT, this._slotX(SLOT_COUNT - 1), QUEUE_Y + 1.5, 0, 0.14, "#f59e0b");
    const box = this._makeBoxWire(this._slotX(SLOT_COUNT - 1), QUEUE_Y, 0, BOX_W, BOX_H, BOX_D, ERROR_COL);
    this._add(scene, box);
  }

  _onDisplay(scene) {
    for (let i = this.frontIdx; i <= this.rearIdx && i >= 0; i++) {
      const idx = i;
      const id = setTimeout(() => {
        const fill = this.fillMeshes[idx];
        if (fill) {
          const orig = fill.material.color.getHex();
          fill.material.color.setHex(0xcdd6f4);
          const id2 = setTimeout(() => { if (fill.material) fill.material.color.setHex(orig); }, 350);
          this._animReqs.push(id2);
        }
      }, (i - this.frontIdx) * 280);
      this._animReqs.push(id);
    }
  }

  _updatePointerLabels(scene) {
    if (this.frontLabel) { scene.remove(this.frontLabel); this.meshes = this.meshes.filter(m => m !== this.frontLabel); }
    if (this.rearLabel)  { scene.remove(this.rearLabel);  this.meshes = this.meshes.filter(m => m !== this.rearLabel);  }
    const fx = this.frontIdx >= 0 ? this._slotX(this.frontIdx) : this._slotX(0);
    const rx = this.rearIdx  >= 0 ? this._slotX(this.rearIdx)  : this._slotX(SLOT_COUNT - 1);
    this.frontLabel = this._makeLabel(scene, `F=${this.frontIdx}`, fx, QUEUE_Y + 1.0, 0, 0.15, "#2d9e6b");
    this.rearLabel  = this._makeLabel(scene, `R=${this.rearIdx}`,  rx, QUEUE_Y + 1.0, 0, 0.15, "#f59e0b");
  }

  _makeBoxWire(x, y, z, w, h, d, color) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshBasicMaterial({ color, wireframe: true }));
    m.position.set(x, y, z); return m;
  }
  _makeBoxSolid(x, y, z, w, h, d, color, opacity = 1) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ color, transparent: opacity < 1, opacity }));
    m.position.set(x, y, z); return m;
  }
  _add(scene, obj) { scene.add(obj); this.meshes.push(obj); return obj; }
  _makeLabel(scene, text, x, y, z, size, color) {
    const canvas = document.createElement("canvas"); canvas.width = 256; canvas.height = 64;
    const ctx = canvas.getContext("2d"); ctx.clearRect(0,0,256,64);
    ctx.fillStyle = color; ctx.font = "bold 26px 'Space Mono', monospace";
    ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(text, 128, 32);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true }));
    sprite.position.set(x, y, z); sprite.scale.set(size*9, size*2.2, 1);
    this._add(scene, sprite); return sprite;
  }
  _animateTo(mesh, tx, ty, tz, duration, onDone) {
    const sx=mesh.position.x, sy=mesh.position.y, sz=mesh.position.z, start=performance.now();
    const tick=(now)=>{ const t=Math.min((now-start)/duration,1),e=1-Math.pow(1-t,3);
      mesh.position.set(sx+(tx-sx)*e,sy+(ty-sy)*e,sz+(tz-sz)*e);
      if(t<1){const id=requestAnimationFrame(tick);this._animReqs.push(id);}else if(onDone)onDone(); };
    this._animReqs.push(requestAnimationFrame(tick));
  }
}

export default QueueRenderer;
