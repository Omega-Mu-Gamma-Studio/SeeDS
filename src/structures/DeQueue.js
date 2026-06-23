// =============================================================
//  SeeDS — DeQueue.js
//  Renders a Double-Ended Queue (Deque) as horizontal 3D slots.
//  Both ends are "active" — push and pop can happen at front OR rear.
//
//  Key visual: two distinctly coloured pointer arrows (blue FRONT,
//  amber REAR) that each retract or extend on every operation,
//  making clear which end is being touched.
//
//  JSON shape:
//    { type, slots[], front, rear, length, capacity?, operations[] }
//  Each slot: { id, index, value, empty, error }
//
//  Operation types:
//    push_front, push_rear, pop_front, pop_rear, highlight, flag_error
// =============================================================

import * as THREE  from '../../vendor/three/three.module.js';
import eventBus    from '../core/eventBus.js';
import { EVENTS, LAYOUT, VISUAL } from '../core/constants.js';
import LabelSprite from '../renderer/LabelSprite.js';


// Colour palette — front and rear get different hues so the eye
// can track each end independently.
const COLOR_FRONT_SLOT    = 0x5da8ff;   // blue  — front push/pop
const COLOR_REAR_SLOT     = 0xffc44d;   // amber — rear push/pop
const COLOR_EMPTY         = 0x2a2a3a;   // dark muted — empty slot
const COLOR_IDLE          = 0x4f8ef7;   // default occupied slot

// Vertical pointer offsets so front and rear labels never collide
const Y_FRONT_PTR_OFFSET  =  2.8;   // above the row
const Y_REAR_PTR_OFFSET   = -2.8;   // below the row

// "Direction flash" colours shown briefly on push/pop
const FLASH_PUSH = 0x4fc97e;  // green  — something arrived
const FLASH_POP  = 0xff6b6b;  // salmon — something left


class DeQueueStructure {
  constructor(scene, camera) {
    this._scene  = scene;
    this._camera = camera;

    this._slots    = new Map();  // id → { mesh, label, idxLabel, data }
    this._data     = null;
    this._active   = null;

    // Pointer labels
    this._frontPtr  = null;   // "◀ FRONT"
    this._rearPtr   = null;   // "REAR ▶"

    // Direction indicator strips — small arrows above/below showing
    // which way each end expands ("← grows" / "grows →")
    this._frontDirLabel = null;
    this._rearDirLabel  = null;

    // Misc state
    this._frontIdx  = 0;
    this._rearIdx   = 0;
    this._capacity  = 0;

    // For tick() pulsing
    this._flashSlot  = null;
    this._flashTimer = 0;
  }


  // -----------------------------------------------------------
  //  Build
  // -----------------------------------------------------------
  build(data) {
    this._data     = data;
    this._frontIdx = data.front ?? 0;
    this._rearIdx  = data.rear  ?? (data.slots?.length - 1);
    this._capacity = data.capacity ?? data.slots?.length ?? 8;

    const W    = VISUAL.QUEUE_SLOT_SIZE;
    const H    = VISUAL.QUEUE_SLOT_HEIGHT;
    const D    = VISUAL.QUEUE_SLOT_SIZE;
    const gap  = VISUAL.QUEUE_GAP;
    const step = W + gap;
    const slots  = data.slots || [];
    const totalW = slots.length * step - gap;
    const startX = -totalW / 2 + W / 2;
    const y = LAYOUT.QUEUE_Y;

    // ── Slots ────────────────────────────────────────────────
    for (let i = 0; i < slots.length; i++) {
      const slot  = slots[i];
      const x     = startX + i * step;
      const isFront = (i === this._frontIdx);
      const isRear  = (i === this._rearIdx);
      const isError = !!slot.error;

      const geo = new THREE.BoxGeometry(W, H, D);
      const mat = new THREE.MeshStandardMaterial({
        color: isError  ? VISUAL.ERROR_COLOR :
               slot.empty ? COLOR_EMPTY      :
               isFront  ? COLOR_FRONT_SLOT   :
               isRear   ? COLOR_REAR_SLOT    :
                          COLOR_IDLE,
        emissive: isError ? VISUAL.ERROR_EMISSIVE : 0x1a3a6e,
        emissiveIntensity: (isFront || isRear) ? 0.5 : 0.2,
        roughness: 0.3,
        metalness: 0.4,
        transparent: slot.empty,
        opacity:     slot.empty ? 0.25 : 1.0,
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, 0);
      mesh.castShadow = true;
      mesh.userData.slotData = slot;
      this._scene.add(mesh);

      const label = LabelSprite.create(
        slot.empty ? '' : String(slot.value), this._scene
      );
      label.setPosition(x, y + H / 2 + 1.5, 0);

      const idxLabel = LabelSprite.create(`[${slot.index}]`, this._scene);
      idxLabel.setPosition(x, y - H / 2 - 1.3, 0);

      this._slots.set(slot.id, { mesh, label, idxLabel, data: slot });
    }

    // ── Pointer arrows ───────────────────────────────────────
    this._buildPointers(slots, y, H, step, startX);

    // ── Direction labels ─────────────────────────────────────
    //  These tell the viewer which way each end can extend.
    //  Front label sits to the LEFT, rear label to the RIGHT.
    const leftX  = startX - W * 0.5;
    const rightX = startX + (slots.length - 1) * step + W * 0.5;

    this._frontDirLabel = LabelSprite.create('◀ pushes left', this._scene);
    this._frontDirLabel.setPosition(leftX - 1.8, y, 0);

    this._rearDirLabel = LabelSprite.create('pushes right ▶', this._scene);
    this._rearDirLabel.setPosition(rightX + 1.8, y, 0);

    if (data.errors?.length) {
      eventBus.emit(EVENTS.ERROR_PANEL_UPDATE, { errors: data.errors });
    }
  }

  _buildPointers(slots, y, H) {
    // FRONT — blue pointer, appears above the slot row
    const fSlot = slots[this._frontIdx];
    const fBox  = fSlot ? this._slots.get(fSlot.id) : null;
    if (fBox) {
      this._frontPtr = LabelSprite.create('◀ FRONT', this._scene);
      this._frontPtr.setPosition(
        fBox.mesh.position.x,
        y + H / 2 + Y_FRONT_PTR_OFFSET,
        0
      );
    }

    // REAR — amber pointer, appears below the slot row
    const rSlot = slots[this._rearIdx];
    const rBox  = rSlot ? this._slots.get(rSlot.id) : null;
    if (rBox) {
      this._rearPtr = LabelSprite.create('REAR ▶', this._scene);
      this._rearPtr.setPosition(
        rBox.mesh.position.x,
        y + H / 2 + Y_REAR_PTR_OFFSET * -1,   // below
        0
      );
    }
  }


  // -----------------------------------------------------------
  //  Execute
  // -----------------------------------------------------------
  execute(op) {
    switch (op.type) {
      case 'push_rear':   this._pushRear(op.slotId, op.value);   break;
      case 'push_front':  this._pushFront(op.slotId, op.value);  break;
      case 'pop_rear':    this._popRear(op.slotId);              break;
      case 'pop_front':   this._popFront(op.slotId);             break;
      case 'highlight':   this._highlight(op.slotId ?? op.nodeId); break;
      case 'flag_error':  this._flagError(op.slotId, op.errorType); break;
      default:
        if (op.slotId || op.nodeId) this._highlight(op.slotId ?? op.nodeId);
    }
  }

  // ── push_rear ── new element arrives at the right end ──────
  _pushRear(slotId, value) {
    this._clearActive();
    const box = this._slots.get(slotId);
    if (!box) return;

    box.mesh.material.color.setHex(COLOR_REAR_SLOT);
    box.mesh.material.emissiveIntensity = 0.7;
    box.mesh.material.transparent = false;
    box.mesh.material.opacity = 1.0;
    box.label.setText(String(value));
    this._active = slotId;

    // Move rear pointer rightward to this slot
    if (this._rearPtr) {
      this._rearPtr.setPosition(
        box.mesh.position.x,
        box.mesh.position.y - VISUAL.QUEUE_SLOT_HEIGHT / 2 - Math.abs(Y_REAR_PTR_OFFSET),
        0
      );
    }
    this._rearIdx = box.data.index;

    // Brief green flash to signal "element arrived"
    this._triggerFlash(slotId, FLASH_PUSH);
  }

  // ── push_front ── new element arrives at the left end ──────
  _pushFront(slotId, value) {
    this._clearActive();
    const box = this._slots.get(slotId);
    if (!box) return;

    box.mesh.material.color.setHex(COLOR_FRONT_SLOT);
    box.mesh.material.emissiveIntensity = 0.7;
    box.mesh.material.transparent = false;
    box.mesh.material.opacity = 1.0;
    box.label.setText(String(value));
    this._active = slotId;

    // Move front pointer leftward to this slot
    if (this._frontPtr) {
      this._frontPtr.setPosition(
        box.mesh.position.x,
        box.mesh.position.y + VISUAL.QUEUE_SLOT_HEIGHT / 2 + Y_FRONT_PTR_OFFSET,
        0
      );
    }
    this._frontIdx = box.data.index;

    this._triggerFlash(slotId, FLASH_PUSH);
  }

  // ── pop_rear ── element leaves from the right end ──────────
  _popRear(slotId) {
    const box = this._slots.get(slotId);
    if (!box) return;

    this._triggerFlash(slotId, FLASH_POP);

    // Fade the slot
    box.mesh.material.transparent = true;
    box.mesh.material.opacity = 0.2;
    box.mesh.material.color.setHex(COLOR_EMPTY);
    box.label.setText('');

    // Retract rear pointer one step to the left
    if (this._rearPtr) {
      const W   = VISUAL.QUEUE_SLOT_SIZE;
      const gap = VISUAL.QUEUE_GAP;
      const newX = box.mesh.position.x - (W + gap);
      this._rearPtr.setPosition(
        newX,
        box.mesh.position.y - VISUAL.QUEUE_SLOT_HEIGHT / 2 - Math.abs(Y_REAR_PTR_OFFSET),
        0
      );
    }
  }

  // ── pop_front ── element leaves from the left end ──────────
  _popFront(slotId) {
    const box = this._slots.get(slotId);
    if (!box) return;

    this._triggerFlash(slotId, FLASH_POP);

    // Fade the slot
    box.mesh.material.transparent = true;
    box.mesh.material.opacity = 0.2;
    box.mesh.material.color.setHex(COLOR_EMPTY);
    box.label.setText('');

    // Advance front pointer one step to the right
    if (this._frontPtr) {
      const W   = VISUAL.QUEUE_SLOT_SIZE;
      const gap = VISUAL.QUEUE_GAP;
      const newX = box.mesh.position.x + (W + gap);
      this._frontPtr.setPosition(
        newX,
        box.mesh.position.y + VISUAL.QUEUE_SLOT_HEIGHT / 2 + Y_FRONT_PTR_OFFSET,
        0
      );
    }
  }

  _highlight(slotId) {
    this._clearActive();
    const box = this._slots.get(slotId);
    if (!box) return;
    box.mesh.material.color.setHex(VISUAL.NODE_HOVER_COLOR);
    box.mesh.material.emissiveIntensity = 0.6;
    this._active = slotId;
  }

  _flagError(slotId, errorType) {
    const box = this._slots.get(slotId);
    if (!box) return;
    box.mesh.material.color.setHex(VISUAL.ERROR_COLOR);
    box.mesh.material.emissive.setHex(VISUAL.ERROR_EMISSIVE);
    box.mesh.material.emissiveIntensity = 0.6;
    box.mesh.material.transparent = false;
    box.mesh.material.opacity = 1.0;

    const errors = this._data?.errors ?? [];
    if (errors.length) eventBus.emit(EVENTS.ERROR_PANEL_UPDATE, { errors });
  }

  _clearActive() {
    if (this._active) {
      const prev = this._slots.get(this._active);
      if (prev && !prev.data.error) {
        prev.mesh.material.color.setHex(COLOR_IDLE);
        prev.mesh.material.emissiveIntensity = 0.2;
      }
      this._active = null;
    }
  }

  // Store which slot to flash and what colour, tick() drives it
  _triggerFlash(slotId, color) {
    this._flashSlot  = { id: slotId, color };
    this._flashTimer = 0;
  }


  // -----------------------------------------------------------
  //  Tick — per-frame pulse effects
  // -----------------------------------------------------------
  tick(delta, elapsed) {
    // Active slot heartbeat
    if (this._active) {
      const box = this._slots.get(this._active);
      if (box) {
        const p = (Math.sin(elapsed * 4) + 1) / 2;
        box.mesh.material.emissiveIntensity = 0.4 + p * 0.4;
      }
    }

    // Push/pop flash — bright for first 0.4 s then fades
    if (this._flashSlot) {
      this._flashTimer += delta;
      const box = this._slots.get(this._flashSlot.id);
      if (box) {
        const t = Math.min(this._flashTimer / 0.4, 1.0);
        if (t < 1.0) {
          // Lerp emissive intensity from 1.0 → 0.2
          box.mesh.material.emissiveIntensity = 1.0 - t * 0.8;
        } else {
          this._flashSlot = null;
        }
      } else {
        this._flashSlot = null;
      }
    }
  }


  // -----------------------------------------------------------
  //  Dispose — every mesh, geometry, material, label gone
  // -----------------------------------------------------------
  dispose() {
    for (const { mesh, label, idxLabel } of this._slots.values()) {
      mesh.geometry.dispose();
      mesh.material.dispose();
      this._scene.remove(mesh);
      label.dispose();
      if (idxLabel) idxLabel.dispose();
    }
    this._slots.clear();

    [
      this._frontPtr,
      this._rearPtr,
      this._frontDirLabel,
      this._rearDirLabel,
    ].forEach(l => l?.dispose());

    this._active     = null;
    this._flashSlot  = null;
    this._frontPtr   = null;
    this._rearPtr    = null;
    this._frontDirLabel = null;
    this._rearDirLabel  = null;
  }
}


export default DeQueueStructure;