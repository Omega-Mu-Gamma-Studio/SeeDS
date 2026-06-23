// =============================================================
//  SeeDS — CircularQueue.js
//  Renders a Circular Queue as horizontal 3D slots with a
//  wrap-around torus arc connecting rear back to front.
//
//  Key visual: the arc above the slot row that lights up
//  amber when the queue is full, and flashes during a wrap.
//
//  JSON shape:
//    { type, slots[], capacity, front, rear, length, operations[] }
//  Each slot: { id, index, value, empty, error }
// =============================================================

import * as THREE  from '../../vendor/three/three.module.js';
import eventBus    from '../core/eventBus.js';
import { EVENTS, LAYOUT, VISUAL } from '../core/constants.js';
import LabelSprite from '../renderer/LabelSprite.js';


// Extra VISUAL constants specific to CircularQueue
const ARC_COLOR_DEFAULT = 0x7a8aaa;   // grey — idle arc
const ARC_COLOR_WRAP    = 0xffc44d;   // amber — wrap in progress
const ARC_COLOR_FULL    = 0xff3333;   // red — queue is full
const ARC_Y_OFFSET      = 3.8;        // how far above the slot row the arc sits
const SLOT_COLOR_FRONT  = 0x5da8ff;   // blue — front pointer slot
const SLOT_COLOR_REAR   = 0xffc44d;   // amber — rear pointer slot


class CircularQueueStructure {
  constructor(scene, camera) {
    this._scene  = scene;
    this._camera = camera;

    this._slots      = new Map();  // id → { mesh, label, idxLabel, data }
    this._active     = null;
    this._data       = null;
    this._frontIdx   = 0;
    this._rearIdx    = -1;
    this._capacity   = 0;

    // Arc visual elements
    this._arcMesh       = null;
    this._arcLabel      = null;   // "↩ wraps to [0]"
    this._capLabel      = null;   // "capacity = N"
    this._fullLabel     = null;   // "FULL" / "EMPTY" label
    this._frontPtr      = null;
    this._rearPtr       = null;

    // Pulse tracking
    this._arcPulse      = false;
    this._pulsedSlots   = new Set();
  }


  // -----------------------------------------------------------
  //  Build
  // -----------------------------------------------------------
  build(data) {
    this._data     = data;
    this._capacity = data.capacity ?? data.slots?.length ?? 6;
    this._frontIdx = data.front ?? 0;
    this._rearIdx  = data.rear  ?? (data.slots?.length - 1);

    const W    = VISUAL.QUEUE_SLOT_SIZE;
    const H    = VISUAL.QUEUE_SLOT_HEIGHT;
    const D    = VISUAL.QUEUE_SLOT_SIZE;
    const gap  = VISUAL.QUEUE_GAP;
    const step = W + gap;
    const slots = data.slots || [];
    const totalW = slots.length * step - gap;
    const startX = -totalW / 2 + W / 2;
    const y = LAYOUT.QUEUE_Y;

    // ── Slots ────────────────────────────────────────────────
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      const x = startX + i * step;
      const isFront = (i === this._frontIdx);
      const isRear  = (i === this._rearIdx);
      const isError = !!slot.error;

      const geo = new THREE.BoxGeometry(W, H, D);
      const mat = new THREE.MeshStandardMaterial({
        color:     isError  ? VISUAL.ERROR_COLOR :
                   isFront  ? SLOT_COLOR_FRONT   :
                   isRear   ? SLOT_COLOR_REAR     :
                              VISUAL.NODE_COLOR,
        emissive:  isError ? VISUAL.ERROR_EMISSIVE : 0x1a3a6e,
        emissiveIntensity: (isFront || isRear) ? 0.5 : 0.2,
        roughness: 0.3,
        metalness: 0.4,
        transparent: slot.empty,
        opacity:     slot.empty ? 0.3 : 1.0,
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

    // ── Front / Rear pointer arrows ──────────────────────────
    this._buildPointers(slots, y, H, step, startX);

    // ── Wrap-around arc ──────────────────────────────────────
    this._buildArc(totalW, startX, slots.length, step, W, y, H);

    // ── capacity label ───────────────────────────────────────
    this._capLabel = LabelSprite.create(`capacity = ${this._capacity}`, this._scene);
    this._capLabel.setPosition(0, y + ARC_Y_OFFSET + 2.0, 0);

    if (data.errors?.length) {
      eventBus.emit(EVENTS.ERROR_PANEL_UPDATE, { errors: data.errors });
    }
  }

  _buildPointers(slots, y, H, step, startX) {
    if (this._frontIdx >= 0 && this._frontIdx < slots.length) {
      const fSlot = slots[this._frontIdx];
      const fBox  = this._slots.get(fSlot.id);
      if (fBox) {
        this._frontPtr = LabelSprite.create('▼ FRONT', this._scene);
        this._frontPtr.setPosition(fBox.mesh.position.x, y + H / 2 + 2.8, 0);
      }
    }

    if (this._rearIdx >= 0 && this._rearIdx < slots.length) {
      const rSlot = slots[this._rearIdx];
      const rBox  = this._slots.get(rSlot.id);
      if (rBox) {
        this._rearPtr = LabelSprite.create('▲ REAR', this._scene);
        this._rearPtr.setPosition(rBox.mesh.position.x, y - H / 2 - 2.8, 0);
      }
    }
  }

  _buildArc(totalW, startX, slotCount, step, W, y, H) {
    // Build a half-torus arc that curves above the slot row,
    // connecting the last slot (rear side) back to slot [0] (front side).
    // We use a partial torus — π radians of tube.

    if (slotCount < 2) return;

    // Arc spans the full width of the slot row; center it at x=0
    const arcRadius = totalW / 2 + W * 0.5;  // slightly wider than the row
    const tubeRadius = 0.10;

    // A TubeGeometry along a custom curve gives us a nice top arc
    const arcCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-totalW / 2 - W * 0.3, y + ARC_Y_OFFSET * 0.3, 0),  // left anchor (slot[0] side)
      new THREE.Vector3(0,                      y + ARC_Y_OFFSET,       0),  // apex
      new THREE.Vector3( totalW / 2 + W * 0.3, y + ARC_Y_OFFSET * 0.3, 0),  // right anchor (rear side)
    );

    const tubeGeo = new THREE.TubeGeometry(arcCurve, 32, tubeRadius, 8, false);
    const arcMat  = new THREE.MeshStandardMaterial({
      color:    ARC_COLOR_DEFAULT,
      emissive: 0x222233,
      emissiveIntensity: 0.3,
      roughness: 0.4,
      metalness: 0.5,
    });

    this._arcMesh = new THREE.Mesh(tubeGeo, arcMat);
    this._scene.add(this._arcMesh);

    // Wrap label — sits at the apex of the arc
    this._arcLabel = LabelSprite.create('↩ wraps to [0]', this._scene);
    this._arcLabel.setPosition(0, y + ARC_Y_OFFSET + 0.9, 0);
    this._arcLabel.setVisible(false);   // hidden until a wrap happens
  }


  // -----------------------------------------------------------
  //  Execute
  // -----------------------------------------------------------
  execute(op) {
    switch (op.type) {
      case 'enqueue':    this._enqueue(op.slotId, op.value);          break;
      case 'dequeue':    this._dequeue(op.slotId);                    break;
      case 'wrap':       this._wrap(op.fromIndex, op.toIndex);        break;
      case 'full':       this._setFull();                             break;
      case 'empty':      this._setEmpty();                            break;
      case 'highlight':  this._highlight(op.slotId ?? op.nodeId);    break;
      case 'flag_error': this._flagError(op.slotId, op.errorType);   break;
      default:
        if (op.slotId || op.nodeId) this._highlight(op.slotId ?? op.nodeId);
    }
  }

  _enqueue(slotId, value) {
    this._clearActive();
    const box = this._slots.get(slotId);
    if (!box) return;

    box.mesh.material.color.setHex(SLOT_COLOR_REAR);
    box.mesh.material.emissiveIntensity = 0.7;
    box.mesh.material.transparent = false;
    box.mesh.material.opacity = 1.0;
    box.label.setText(String(value));
    this._active = slotId;

    // Advance rear pointer
    if (this._rearPtr) {
      this._rearPtr.setPosition(
        box.mesh.position.x,
        box.mesh.position.y - VISUAL.QUEUE_SLOT_HEIGHT / 2 - 2.8,
        0
      );
    }

    // Check if rear just wrapped (rear index < previous rear index)
    const slotData = box.data;
    if (slotData.index === 0 && this._rearIdx > 0) {
      // A wrap happened — illuminate arc
      this._illuminateArc(ARC_COLOR_WRAP, true);
    }
    this._rearIdx = slotData.index;
  }

  _dequeue(slotId) {
    const box = this._slots.get(slotId);
    if (!box) return;

    box.mesh.material.transparent = true;
    box.mesh.material.opacity = 0.2;
    box.mesh.material.color.setHex(0x555a70);
    box.label.setText('');

    // Advance front pointer
    if (this._frontPtr) {
      const W   = VISUAL.QUEUE_SLOT_SIZE;
      const gap = VISUAL.QUEUE_GAP;
      const newFrontX = box.mesh.position.x + W + gap;
      this._frontPtr.setPosition(
        newFrontX,
        box.mesh.position.y + VISUAL.QUEUE_SLOT_HEIGHT / 2 + 2.8,
        0
      );
    }

    // Dim arc back to default if queue is no longer full
    this._illuminateArc(ARC_COLOR_DEFAULT, false);
    if (this._fullLabel) {
      this._fullLabel.dispose();
      this._fullLabel = null;
    }
  }

  _wrap(fromIndex, toIndex) {
    // Flash arc brightly — the signature circular-queue moment!
    this._illuminateArc(ARC_COLOR_WRAP, true);
    this._arcLabel.setVisible(true);
    this._arcPulse = true;

    // Flash slot [0] (toIndex) to show the wrap target
    const slot0 = this._getSlotByIndex(toIndex);
    if (slot0) {
      slot0.mesh.material.color.setHex(0xffffff);
      slot0.mesh.material.emissiveIntensity = 0.9;
      this._pulsedSlots.add(slot0);
    }
  }

  _setFull() {
    this._illuminateArc(ARC_COLOR_FULL, false);
    this._arcLabel.setVisible(true);
    this._arcLabel.setText('↩ wraps to [0] — FULL');

    // Add FULL label at rear
    if (!this._fullLabel) {
      const rearBox = this._getRearBox();
      if (rearBox) {
        this._fullLabel = LabelSprite.create('FULL', this._scene);
        this._fullLabel.setPosition(
          rearBox.mesh.position.x,
          rearBox.mesh.position.y - VISUAL.QUEUE_SLOT_HEIGHT / 2 - 4.5,
          0
        );
      }
    }
  }

  _setEmpty() {
    // Fade all slots
    for (const box of this._slots.values()) {
      box.mesh.material.transparent = true;
      box.mesh.material.opacity = 0.2;
      box.mesh.material.color.setHex(0x333344);
      box.label.setText('');
    }
    this._illuminateArc(ARC_COLOR_DEFAULT, false);
    this._arcLabel.setVisible(false);
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
      if (prev) {
        prev.mesh.material.color.setHex(VISUAL.NODE_COLOR);
        prev.mesh.material.emissiveIntensity = 0.2;
      }
      this._active = null;
    }
  }

  _illuminateArc(color, pulse) {
    if (!this._arcMesh) return;
    this._arcMesh.material.color.setHex(color);
    this._arcMesh.material.emissiveIntensity = pulse ? 0.6 : 0.3;
    this._arcPulse = pulse;
  }

  _getSlotByIndex(idx) {
    for (const box of this._slots.values()) {
      if (box.data.index === idx) return box;
    }
    return null;
  }

  _getRearBox() {
    for (const box of this._slots.values()) {
      if (box.data.index === this._rearIdx) return box;
    }
    return null;
  }


  // -----------------------------------------------------------
  //  Tick — per-frame pulse effects
  // -----------------------------------------------------------
  tick(delta, elapsed) {
    // Pulse active slot
    if (this._active) {
      const box = this._slots.get(this._active);
      if (box) {
        const p = (Math.sin(elapsed * 4) + 1) / 2;
        box.mesh.material.emissiveIntensity = 0.4 + p * 0.4;
      }
    }

    // Pulse arc when wrapping
    if (this._arcPulse && this._arcMesh) {
      const p = (Math.sin(elapsed * 6) + 1) / 2;
      this._arcMesh.material.emissiveIntensity = 0.3 + p * 0.7;
    }
  }


  // -----------------------------------------------------------
  //  Dispose — release ALL Three.js resources
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

    if (this._arcMesh) {
      this._arcMesh.geometry.dispose();
      this._arcMesh.material.dispose();
      this._scene.remove(this._arcMesh);
    }

    [ this._arcLabel, this._capLabel, this._fullLabel,
      this._frontPtr, this._rearPtr ].forEach(l => l?.dispose());

    this._active    = null;
    this._arcMesh   = null;
    this._arcLabel  = null;
    this._capLabel  = null;
    this._fullLabel = null;
    this._frontPtr  = null;
    this._rearPtr   = null;
  }
}


export default CircularQueueStructure;