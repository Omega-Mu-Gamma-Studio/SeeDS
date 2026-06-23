// =============================================================
//  SeeDS — PrimMST.js
//  Renders Prim's Minimum Spanning Tree algorithm.
//
//  Key visuals:
//    • Graph drawn with all edges in muted grey
//    • MST edges grow in GREEN as they are added (mark_mst_edge)
//    • Non-MST edges that are "considered" flash amber briefly
//      then return to grey (consider_edge)
//    • MST cost counter — top-right label "MST Cost: 0" that
//      updates each time an edge is committed
//    • Candidate edges panel — bottom strip showing the current
//      candidate (cheapest) edges under consideration, ordered
//      by weight
//    • Vertices in the MST set turn green (add_to_mst)
//    • The current "growing frontier" vertex pulses amber
//
//  JSON shape:
//    { type, vertices[], edges[], start, operations[] }
//  Each vertex: { id, label, x?, y?, z? }
//  Each edge:   { from, to, weight }
//
//  Operation types:
//    add_to_mst, consider_edge, mark_mst_edge, update_cost,
//    highlight, flag_error
// =============================================================

import * as THREE  from '../../vendor/three/three.module.js';
import eventBus    from '../core/eventBus.js';
import { EVENTS, LAYOUT, VISUAL } from '../core/constants.js';
import LabelSprite from '../renderer/LabelSprite.js';


// Colours
const COLOR_DEFAULT   = 0x4f8ef7;
const COLOR_IN_MST    = 0x4fc97e;   // green — vertex / edge in MST
const COLOR_CONSIDER  = 0xffc44d;   // amber — edge being considered
const COLOR_MST_EDGE  = 0x4fc97e;   // green — committed MST edge
const EMISSIVE_MST    = 0x1a5c38;
const EMISSIVE_ACTIVE = 0x6a4400;

const COST_LABEL_X    = 9.0;
const COST_LABEL_Y    = 6.5;
const CAND_Y          = -7.5;
const CAND_SLOT_W     = 3.0;


class PrimMST {
  constructor(scene, camera) {
    this._scene   = scene;
    this._camera  = camera;

    this._vertices   = new Map();   // id → { mesh, labelSprite, data, pos }
    this._edges      = new Map();   // "from→to" → { line, lineMat }
    this._extra      = [];

    // Cost counter (top-right)
    this._costLabel  = null;
    this._totalCost  = 0;

    // Candidate edges strip (bottom)
    this._candSlots  = [];
    this._candHeader = null;

    this._data       = null;
    this._activeVert = null;
  }


  // -----------------------------------------------------------
  //  Build
  // -----------------------------------------------------------
  build(data) {
    this._data = data;
    const verts  = data.vertices || [];
    const edges  = data.edges   || [];
    const n      = verts.length;
    const radius = LAYOUT.GRAPH_RADIUS;

    // ── Vertices ─────────────────────────────────────────────
    for (let i = 0; i < n; i++) {
      const v = verts[i];
      const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
      const x = (v.x !== undefined) ? v.x : radius * Math.cos(angle);
      const y = (v.y !== undefined) ? v.y : 0;
      const z = (v.z !== undefined) ? v.z : radius * Math.sin(angle);

      const geo = new THREE.SphereGeometry(VISUAL.GRAPH_VERTEX_RADIUS, 24, 24);
      const isStart = v.id === data.start;
      const mat = new THREE.MeshStandardMaterial({
        color: isStart ? COLOR_IN_MST : COLOR_DEFAULT,
        emissive: isStart ? EMISSIVE_MST : VISUAL.GRAPH_VERTEX_EMISSIVE,
        emissiveIntensity: isStart ? 0.55 : 0.3,
        roughness: 0.3, metalness: 0.4,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      this._scene.add(mesh);

      const labelSprite = LabelSprite.create(v.label || v.id, this._scene);
      labelSprite.setPosition(x, y + VISUAL.GRAPH_VERTEX_RADIUS + 0.65, z);

      this._vertices.set(v.id, { mesh, labelSprite, data: v, pos: { x, y, z } });
    }

    // ── Edges ─────────────────────────────────────────────────
    for (const e of edges) {
      const from = this._vertices.get(e.from);
      const to   = this._vertices.get(e.to);
      if (!from || !to) continue;

      const fPos = from.mesh.position;
      const tPos = to.mesh.position;
      const dir  = new THREE.Vector3().subVectors(tPos, fPos).normalize();
      const r    = VISUAL.GRAPH_VERTEX_RADIUS + 0.05;
      const start = fPos.clone().addScaledVector(dir,  r);
      const end   = tPos.clone().addScaledVector(dir, -r);

      const lineGeo = new THREE.BufferGeometry().setFromPoints([start, end]);
      const lineMat = new THREE.LineBasicMaterial({
        color: VISUAL.GRAPH_EDGE_DEFAULT, transparent: true, opacity: 0.5
      });
      const line = new THREE.Line(lineGeo, lineMat);
      this._scene.add(line);

      // Weight label
      const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
      const wLbl = LabelSprite.create(String(e.weight), this._scene);
      wLbl.setPosition(mid.x, mid.y + 0.45, mid.z);
      this._extra.push(wLbl);

      const edgeObj = { line, lineMat, weight: e.weight };
      this._edges.set(`${e.from}→${e.to}`, edgeObj);
      this._edges.set(`${e.to}→${e.from}`, edgeObj);
    }

    // ── MST Cost counter ──────────────────────────────────────
    this._costLabel = LabelSprite.create('MST Cost: 0', this._scene);
    this._costLabel.setPosition(COST_LABEL_X, COST_LABEL_Y, 0);

    // ── Candidate edges strip ─────────────────────────────────
    this._candHeader = LabelSprite.create('Candidate edges (cheapest first)', this._scene);
    this._candHeader.setPosition(0, CAND_Y - 1.5, 0);

    const maxCands = Math.min(n, 6);
    for (let i = 0; i < maxCands; i++) {
      const x = -((maxCands - 1) / 2) * CAND_SLOT_W + i * CAND_SLOT_W;
      const geo = new THREE.BoxGeometry(CAND_SLOT_W - 0.2, 1.1, 0.25);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x1e1e2e, transparent: true, opacity: 0.4,
        roughness: 0.5, metalness: 0.2,
      });
      const bg = new THREE.Mesh(geo, mat);
      bg.position.set(x, CAND_Y, 0);
      this._scene.add(bg);

      const lbl = LabelSprite.create('', this._scene);
      lbl.setPosition(x, CAND_Y, 0);

      this._candSlots.push({ bg, lbl });
    }

    if (data.errors?.length) {
      eventBus.emit(EVENTS.ERROR_PANEL_UPDATE, { errors: data.errors });
    }
  }


  // -----------------------------------------------------------
  //  Execute
  // -----------------------------------------------------------
  execute(op) {
    switch (op.type) {
      case 'add_to_mst':    this._addToMst(op.nodeId);                    break;
      case 'consider_edge': this._considerEdge(op.from, op.to);          break;
      case 'mark_mst_edge': this._markMstEdge(op.from, op.to, op.weight);break;
      case 'update_cost':   this._updateCost(op.cost);                   break;
      case 'cand_update':   this._candUpdate(op.entries);                 break;
      case 'highlight':     this._highlight(op.nodeId);                   break;
      case 'flag_error':    this._flagError(op.nodeId, op.errorType);    break;
      default:
        if (op.nodeId) this._highlight(op.nodeId);
    }
  }

  _addToMst(id) {
    this._clearActive();
    const v = this._vertices.get(id);
    if (!v) return;
    v.mesh.material.color.setHex(COLOR_IN_MST);
    v.mesh.material.emissive.setHex(EMISSIVE_MST);
    v.mesh.material.emissiveIntensity = 0.55;
    this._activeVert = id;
  }

  _considerEdge(fromId, toId) {
    const key = `${fromId}→${toId}`;
    const edge = this._edges.get(key) ?? this._edges.get(`${toId}→${fromId}`);
    if (!edge) return;
    edge.lineMat.color.setHex(COLOR_CONSIDER);
    edge.lineMat.opacity = 0.85;
    // Fade back to grey after a moment
    setTimeout(() => {
      if (edge.lineMat.color.getHex() === COLOR_CONSIDER) {
        edge.lineMat.color.setHex(VISUAL.GRAPH_EDGE_DEFAULT);
        edge.lineMat.opacity = 0.5;
      }
    }, 700);
  }

  _markMstEdge(fromId, toId, weight) {
    const edge = this._edges.get(`${fromId}→${toId}`) ?? this._edges.get(`${toId}→${fromId}`);
    if (!edge) return;
    edge.lineMat.color.setHex(COLOR_MST_EDGE);
    edge.lineMat.opacity = 1.0;
  }

  _updateCost(cost) {
    this._totalCost = cost;
    this._costLabel?.setText(`MST Cost: ${cost}`);
  }

  _candUpdate(entries) {
    for (let i = 0; i < this._candSlots.length; i++) {
      const slot  = this._candSlots[i];
      const entry = entries?.[i];
      if (entry) {
        slot.bg.material.color.setHex(0x2a3a5e);
        slot.bg.material.transparent = false;
        slot.bg.material.opacity = 1.0;
        slot.lbl.setText(`${entry.from}–${entry.to}: ${entry.weight}`);
      } else {
        slot.bg.material.color.setHex(0x1e1e2e);
        slot.bg.material.transparent = true;
        slot.bg.material.opacity = 0.35;
        slot.lbl.setText('');
      }
    }
  }

  _highlight(id) {
    this._clearActive();
    const v = this._vertices.get(id);
    if (!v) return;
    v.mesh.material.color.setHex(COLOR_CONSIDER);
    v.mesh.material.emissive.setHex(EMISSIVE_ACTIVE);
    v.mesh.material.emissiveIntensity = 0.65;
    this._activeVert = id;
  }

  _flagError(id, errorType) {
    const v = this._vertices.get(id);
    if (v) {
      v.mesh.material.color.setHex(VISUAL.ERROR_COLOR);
      v.mesh.material.emissive.setHex(VISUAL.ERROR_EMISSIVE);
      v.mesh.material.emissiveIntensity = 0.6;
    }
    const errors = this._data?.errors ?? [];
    if (errors.length) eventBus.emit(EVENTS.ERROR_PANEL_UPDATE, { errors });
  }

  _clearActive() {
    if (this._activeVert) {
      const v = this._vertices.get(this._activeVert);
      if (v) {
        v.mesh.material.emissiveIntensity = 0.3;
      }
      this._activeVert = null;
    }
  }


  // -----------------------------------------------------------
  //  Tick
  // -----------------------------------------------------------
  tick(delta, elapsed) {
    if (this._activeVert) {
      const v = this._vertices.get(this._activeVert);
      if (v) {
        const p = (Math.sin(elapsed * 4) + 1) / 2;
        v.mesh.material.emissiveIntensity = 0.4 + p * 0.45;
      }
    }
  }


  // -----------------------------------------------------------
  //  Dispose
  // -----------------------------------------------------------
  dispose() {
    for (const { mesh, labelSprite } of this._vertices.values()) {
      mesh.geometry.dispose(); mesh.material.dispose(); this._scene.remove(mesh);
      labelSprite.dispose();
    }
    this._vertices.clear();

    const uniqueEdges = new Set(this._edges.values());
    for (const { line, lineMat } of uniqueEdges) {
      line.geometry.dispose(); lineMat.dispose(); this._scene.remove(line);
    }
    this._edges.clear();

    for (const obj of this._extra) obj.dispose?.();
    this._extra = [];

    for (const { bg, lbl } of this._candSlots) {
      bg.geometry.dispose(); bg.material.dispose(); this._scene.remove(bg);
      lbl.dispose();
    }
    this._candSlots = [];

    this._costLabel?.dispose();
    this._candHeader?.dispose();
    this._costLabel  = null;
    this._candHeader = null;
    this._activeVert = null;
  }
}


export default PrimMST;