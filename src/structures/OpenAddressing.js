// =============================================================
//  SeeDS — OpenAddressing.js
//  Renders a Hash Table using Open Addressing (linear probing
//  by default, quadratic probing / double hashing via JSON flag).
//
//  Key visuals:
//    • Flat vertical slot array — same visual language as
//      HashTable.js but WITHOUT chains; each slot is EITHER
//      empty (muted), occupied (blue), deleted (strikethrough
//      red/grey), or error-flagged
//    • Probe sequence arrow — an animated line that "hops"
//      from slot to slot during probe_step operations, making
//      linear/quadratic probing feel tactile
//    • Hash formula label — floating above the table showing
//      e.g. "h(k) = k mod 7" and during double hashing
//      "h(k,i) = (h₁(k) + i·h₂(k)) mod 7"
//    • Load factor badge — top-right "α = 4/7 ≈ 0.57" updates
//      on each insert/delete
//    • Cluster highlighting — during linear probing, occupied
//      consecutive slots glow faintly amber to show the cluster
//
//  JSON shape:
//    { type, slots[], tableSize, probingMethod?, hashFormula?,
//      operations[] }
//  Each slot: { id, index, key?, value?, state }
//  state: 'empty' | 'occupied' | 'deleted'
//
//  Operation types:
//    probe_step, insert, delete, search_hit, search_miss,
//    update_load_factor, flag_error, highlight
// =============================================================

import * as THREE  from '../../vendor/three/three.module.js';
import eventBus    from '../core/eventBus.js';
import { EVENTS, LAYOUT, VISUAL } from '../core/constants.js';
import LabelSprite from '../renderer/LabelSprite.js';


// State colours
const COLOR_EMPTY    = 0x2a2a3a;
const COLOR_OCCUPIED = 0x4f8ef7;   // blue
const COLOR_DELETED  = 0x5a2020;   // dark red — tombstone
const COLOR_PROBE    = 0xffc44d;   // amber — probe cursor
const COLOR_HIT      = 0x4fc97e;   // green — search hit
const COLOR_ERROR    = 0xff3333;   // red — overflow / clustering

const EMISSIVE_OCC   = 0x1a3a6e;
const EMISSIVE_PROBE = 0x6a4400;
const EMISSIVE_HIT   = 0x1a5c38;

// Geometry
const SLOT_W = 2.8;
const SLOT_H = 0.95;
const SLOT_GAP = 0.18;
const SLOT_STEP = SLOT_H + SLOT_GAP;

// Panel layout — vertical column on the LEFT half of scene
const COL_X    = -2.5;
const TOP_Y    =  5.0;

// Info labels on the RIGHT
const INFO_X   =  6.0;


class OpenAddressing {
  constructor(scene, camera) {
    this._scene   = scene;
    this._camera  = camera;

    this._slots      = new Map();   // id → { mesh, mat, keyLabel, stateLabel, indexLabel, data }
    this._extra      = [];

    // Probe sequence arrow (line from current slot to next)
    this._probeLine  = null;
    this._probeLineMat = null;
    this._probeCone  = null;
    this._probeConeMat = null;

    // Info labels
    this._hashLabel  = null;
    this._loadLabel  = null;
    this._methodLabel = null;

    this._data       = null;
    this._activeSlot = null;
    this._probeFrom  = null;
  }


  // -----------------------------------------------------------
  //  Build
  // -----------------------------------------------------------
  build(data) {
    this._data = data;
    const slots = data.slots || [];
    const n     = slots.length;

    // ── Slot column ────────────────────────────────────────────
    for (let i = 0; i < n; i++) {
      const slot = slots[i];
      const y    = TOP_Y - i * SLOT_STEP;

      const geo = new THREE.BoxGeometry(SLOT_W, SLOT_H, 0.4);
      const color = slot.state === 'occupied' ? COLOR_OCCUPIED :
                    slot.state === 'deleted'  ? COLOR_DELETED  :
                                                COLOR_EMPTY;
      const emissive = slot.state === 'occupied' ? EMISSIVE_OCC : 0x111118;
      const transparent = slot.state === 'empty';

      const mat = new THREE.MeshStandardMaterial({
        color, emissive: new THREE.Color(emissive),
        emissiveIntensity: slot.state === 'occupied' ? 0.3 : 0.1,
        roughness: 0.4, metalness: 0.3,
        transparent, opacity: transparent ? 0.35 : 1.0,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(COL_X, y, 0);
      mesh.castShadow = true;
      this._scene.add(mesh);

      // Index label [i] to the left
      const indexLabel = LabelSprite.create(`[${slot.index}]`, this._scene);
      indexLabel.setPosition(COL_X - SLOT_W / 2 - 0.5, y, 0);

      // Key:value label inside the slot
      const kvText = slot.state === 'occupied' && slot.key !== undefined
        ? `${slot.key}${slot.value !== undefined ? ':' + slot.value : ''}`
        : slot.state === 'deleted' ? '✗ deleted' : '—';
      const keyLabel = LabelSprite.create(kvText, this._scene);
      keyLabel.setPosition(COL_X, y, 0);

      // State label to the right
      const stateText = slot.state === 'occupied' ? '' :
                        slot.state === 'deleted'  ? 'tombstone' : 'empty';
      const stateLabel = LabelSprite.create(stateText, this._scene);
      stateLabel.setPosition(COL_X + SLOT_W / 2 + 1.0, y, 0);

      this._slots.set(slot.id, { mesh, mat, keyLabel, stateLabel, indexLabel, data: slot, y });
    }

    // ── Hash formula label ────────────────────────────────────
    const formula = data.hashFormula ?? `h(k) = k mod ${n}`;
    this._hashLabel = LabelSprite.create(formula, this._scene);
    this._hashLabel.setPosition(INFO_X, TOP_Y + 0.5, 0);

    // ── Probing method label ──────────────────────────────────
    const method = data.probingMethod ?? 'linear probing';
    this._methodLabel = LabelSprite.create(`Method: ${method}`, this._scene);
    this._methodLabel.setPosition(INFO_X, TOP_Y - 1.0, 0);

    // ── Load factor label ─────────────────────────────────────
    const occupied = slots.filter(s => s.state === 'occupied').length;
    const alpha    = (occupied / n).toFixed(2);
    this._loadLabel = LabelSprite.create(`α = ${occupied}/${n} ≈ ${alpha}`, this._scene);
    this._loadLabel.setPosition(INFO_X, TOP_Y - 2.2, 0);

    if (data.errors?.length) {
      eventBus.emit(EVENTS.ERROR_PANEL_UPDATE, { errors: data.errors });
    }
  }


  // -----------------------------------------------------------
  //  Execute
  // -----------------------------------------------------------
  execute(op) {
    switch (op.type) {
      case 'probe_step':      this._probeStep(op.fromId, op.toId);          break;
      case 'insert':          this._insert(op.slotId, op.key, op.value);    break;
      case 'delete':          this._delete(op.slotId);                      break;
      case 'search_hit':      this._searchHit(op.slotId);                   break;
      case 'search_miss':     this._searchMiss(op.slotId);                  break;
      case 'update_load_factor': this._updateLoadFactor(op.occupied, op.total); break;
      case 'highlight':       this._highlight(op.slotId ?? op.nodeId);      break;
      case 'flag_error':      this._flagError(op.slotId ?? op.nodeId, op.errorType); break;
      default:
        if (op.slotId || op.nodeId) this._highlight(op.slotId ?? op.nodeId);
    }
  }

  _probeStep(fromId, toId) {
    this._clearActive();

    // Flash "from" slot amber
    const from = this._slots.get(fromId);
    if (from) {
      from.mat.color.setHex(COLOR_PROBE);
      from.mat.emissive.setHex(EMISSIVE_PROBE);
      from.mat.emissiveIntensity = 0.55;
    }

    // Draw animated arrow from → to
    const to = this._slots.get(toId);
    if (from && to) {
      this._drawProbeArrow(
        new THREE.Vector3(COL_X + SLOT_W / 2 + 0.1, from.y, 0),
        new THREE.Vector3(COL_X + SLOT_W / 2 + 0.1, to.y,   0)
      );
    }

    this._activeSlot = fromId;
  }

  _drawProbeArrow(start, end) {
    // Remove old probe arrow
    this._removeProbeArrow();

    const points = [start, end];
    const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
    this._probeLineMat = new THREE.LineBasicMaterial({
      color: COLOR_PROBE, transparent: true, opacity: 0.8
    });
    this._probeLine = new THREE.Line(lineGeo, this._probeLineMat);
    this._scene.add(this._probeLine);

    // Arrowhead at end
    const dir = new THREE.Vector3().subVectors(end, start).normalize();
    this._probeConeMat = new THREE.MeshStandardMaterial({ color: COLOR_PROBE });
    const coneGeo = new THREE.ConeGeometry(0.12, 0.3, 6);
    this._probeCone = new THREE.Mesh(coneGeo, this._probeConeMat);
    this._probeCone.position.copy(end);
    const up = new THREE.Vector3(0, 1, 0);
    if (Math.abs(dir.dot(up)) < 0.999) this._probeCone.quaternion.setFromUnitVectors(up, dir);
    else this._probeCone.rotation.set(dir.y < 0 ? Math.PI : 0, 0, 0);
    this._scene.add(this._probeCone);
  }

  _removeProbeArrow() {
    if (this._probeLine) {
      this._probeLine.geometry.dispose();
      this._probeLineMat.dispose();
      this._scene.remove(this._probeLine);
      this._probeLine = null;
      this._probeLineMat = null;
    }
    if (this._probeCone) {
      this._probeCone.geometry.dispose();
      this._probeConeMat.dispose();
      this._scene.remove(this._probeCone);
      this._probeCone = null;
      this._probeConeMat = null;
    }
  }

  _insert(slotId, key, value) {
    this._clearActive();
    this._removeProbeArrow();
    const slot = this._slots.get(slotId);
    if (!slot) return;

    slot.mat.color.setHex(COLOR_OCCUPIED);
    slot.mat.emissive.setHex(EMISSIVE_OCC);
    slot.mat.emissiveIntensity = 0.4;
    slot.mat.transparent = false;
    slot.mat.opacity = 1.0;

    const kvText = key !== undefined
      ? `${key}${value !== undefined ? ':' + value : ''}`
      : slot.data.key !== undefined ? String(slot.data.key) : '?';
    slot.keyLabel.setText(kvText);
    slot.stateLabel.setText('');
    this._activeSlot = slotId;
  }

  _delete(slotId) {
    this._clearActive();
    const slot = this._slots.get(slotId);
    if (!slot) return;
    slot.mat.color.setHex(COLOR_DELETED);
    slot.mat.emissive.setHex(0x3a0a0a);
    slot.mat.emissiveIntensity = 0.2;
    slot.keyLabel.setText('✗ deleted');
    slot.stateLabel.setText('tombstone');
  }

  _searchHit(slotId) {
    this._clearActive();
    this._removeProbeArrow();
    const slot = this._slots.get(slotId);
    if (!slot) return;
    slot.mat.color.setHex(COLOR_HIT);
    slot.mat.emissive.setHex(EMISSIVE_HIT);
    slot.mat.emissiveIntensity = 0.6;
    this._activeSlot = slotId;
  }

  _searchMiss(slotId) {
    this._clearActive();
    this._removeProbeArrow();
    const slot = this._slots.get(slotId);
    if (!slot) return;
    slot.mat.color.setHex(COLOR_ERROR);
    slot.mat.emissive.setHex(0x5a0000);
    slot.mat.emissiveIntensity = 0.5;
    this._activeSlot = slotId;
  }

  _updateLoadFactor(occupied, total) {
    if (!this._loadLabel) return;
    const alpha = total > 0 ? (occupied / total).toFixed(2) : '0.00';
    this._loadLabel.setText(`α = ${occupied}/${total} ≈ ${alpha}`);
    // Warn visually if alpha > 0.7
    if (occupied / total > 0.70) {
      this._loadLabel.setText(`⚠ α = ${occupied}/${total} ≈ ${alpha}  HIGH`);
    }
  }

  _highlight(slotId) {
    this._clearActive();
    const slot = this._slots.get(slotId);
    if (!slot) return;
    slot.mat.color.setHex(COLOR_PROBE);
    slot.mat.emissiveIntensity = 0.6;
    this._activeSlot = slotId;
  }

  _flagError(slotId, errorType) {
    const slot = this._slots.get(slotId);
    if (slot) {
      slot.mat.color.setHex(VISUAL.ERROR_COLOR);
      slot.mat.emissive.setHex(VISUAL.ERROR_EMISSIVE);
      slot.mat.emissiveIntensity = 0.6;
    }
    const errors = this._data?.errors ?? [];
    if (errors.length) eventBus.emit(EVENTS.ERROR_PANEL_UPDATE, { errors });
  }

  _clearActive() {
    if (this._activeSlot) {
      const slot = this._slots.get(this._activeSlot);
      if (slot) {
        const state = slot.data.state;
        const color = state === 'occupied' ? COLOR_OCCUPIED :
                      state === 'deleted'  ? COLOR_DELETED  :
                                             COLOR_EMPTY;
        slot.mat.color.setHex(color);
        slot.mat.emissiveIntensity = state === 'occupied' ? 0.3 : 0.1;
      }
      this._activeSlot = null;
    }
  }


  // -----------------------------------------------------------
  //  Tick
  // -----------------------------------------------------------
  tick(delta, elapsed) {
    if (this._activeSlot) {
      const slot = this._slots.get(this._activeSlot);
      if (slot) {
        const p = (Math.sin(elapsed * 5) + 1) / 2;
        slot.mat.emissiveIntensity = 0.35 + p * 0.45;
      }
    }
    // Pulse probe arrow opacity
    if (this._probeLineMat) {
      const p = (Math.sin(elapsed * 6) + 1) / 2;
      this._probeLineMat.opacity = 0.5 + p * 0.4;
    }
  }


  // -----------------------------------------------------------
  //  Dispose
  // -----------------------------------------------------------
  dispose() {
    for (const { mesh, mat, keyLabel, stateLabel, indexLabel } of this._slots.values()) {
      mesh.geometry.dispose(); mat.dispose(); this._scene.remove(mesh);
      keyLabel.dispose(); stateLabel.dispose(); indexLabel.dispose();
    }
    this._slots.clear();

    this._removeProbeArrow();

    for (const obj of this._extra) obj.dispose?.();
    this._extra = [];

    [this._hashLabel, this._loadLabel, this._methodLabel].forEach(l => l?.dispose());
    this._hashLabel   = null;
    this._loadLabel   = null;
    this._methodLabel = null;
    this._activeSlot  = null;
  }
}


export default OpenAddressing;