// =============================================================
//  SeeDS — Dijkstra.js
//  Renders Dijkstra's shortest-path algorithm on a weighted
//  undirected graph (or directed — driven by JSON).
//
//  Key visuals:
//    • Distance table panel — LEFT column showing current best
//      known distance to each vertex (∞ initially, updates live)
//    • Priority queue strip — BOTTOM panel showing the min-heap
//      entries as (vertex, dist) pill boxes
//    • Settled vertices turn GREEN with a "✓ dist" badge above
//    • Relaxed edges glow amber temporarily then dim to a
//      "settled" blue if they become part of the shortest path
//    • Source vertex badge shows "src = 0"
//
//  JSON shape:
//    { type, vertices[], edges[], source, operations[] }
//  Each vertex: { id, label, x?, y?, z? }
//  Each edge:   { from, to, weight }
//
//  Operation types:
//    set_dist, settle, relax_edge, pq_update, highlight,
//    mark_path, flag_error
// =============================================================

import * as THREE  from '../../vendor/three/three.module.js';
import eventBus    from '../core/eventBus.js';
import { EVENTS, LAYOUT, VISUAL } from '../core/constants.js';
import LabelSprite from '../renderer/LabelSprite.js';


// Colours
const COLOR_DEFAULT   = 0x4f8ef7;
const COLOR_SETTLED   = 0x4fc97e;   // green — min distance found
const COLOR_ACTIVE    = 0xffc44d;   // amber — currently being relaxed from
const COLOR_PATH      = 0xffc44d;   // amber — on the shortest path
const EMISSIVE_SETTLE = 0x1a5c38;
const EMISSIVE_ACTIVE = 0x6a4400;

// Panel positions
const DIST_TABLE_X    = -10.5;
const DIST_TABLE_Y    =  4.5;
const DIST_ROW_H      = -1.3;
const PQ_Y            = -7.5;
const PQ_SLOT_W       =  2.6;


class Dijkstra {
  constructor(scene, camera) {
    this._scene   = scene;
    this._camera  = camera;

    this._vertices    = new Map();   // id → { mesh, labelSprite, distBadge, data }
    this._edges       = new Map();   // "a→b" and "b→a" → { line, lineMat }
    this._extra       = [];

    // Distance table (left panel)
    this._distRows    = new Map();   // vertId → { bg, label }
    this._distHeader  = null;

    // Priority queue strip (bottom)
    this._pqSlots     = [];          // array of { bg, label }
    this._pqHeader    = null;

    // Settled badges  —  "✓ 7" above a vertex
    this._settledBadges = new Map(); // vertId → LabelSprite

    this._data        = null;
    this._dists       = new Map();   // vertId → current known distance
    this._activeVert  = null;
  }


  // -----------------------------------------------------------
  //  Build
  // -----------------------------------------------------------
  build(data) {
    this._data = data;
    const verts  = data.vertices || [];
    const edges  = data.edges   || [];
    const source = data.source;
    const n      = verts.length;
    const radius = LAYOUT.GRAPH_RADIUS;

    // Init all distances to ∞
    for (const v of verts) this._dists.set(v.id, Infinity);
    if (source) this._dists.set(source, 0);

    // ── Vertices ─────────────────────────────────────────────
    for (let i = 0; i < n; i++) {
      const v = verts[i];
      const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
      const x = (v.x !== undefined) ? v.x : radius * Math.cos(angle);
      const y = (v.y !== undefined) ? v.y : 0;
      const z = (v.z !== undefined) ? v.z : radius * Math.sin(angle);

      const geo = new THREE.SphereGeometry(VISUAL.GRAPH_VERTEX_RADIUS, 24, 24);
      const isSource = v.id === source;
      const mat = new THREE.MeshStandardMaterial({
        color: isSource ? COLOR_ACTIVE : COLOR_DEFAULT,
        emissive: isSource ? EMISSIVE_ACTIVE : VISUAL.GRAPH_VERTEX_EMISSIVE,
        emissiveIntensity: isSource ? 0.55 : 0.3,
        roughness: 0.3,
        metalness: 0.4,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      this._scene.add(mesh);

      const labelSprite = LabelSprite.create(v.label || v.id, this._scene);
      labelSprite.setPosition(x, y + VISUAL.GRAPH_VERTEX_RADIUS + 0.65, z);

      // Distance badge below vertex — starts as "∞" except source "0"
      const distText = isSource ? 'dist: 0' : 'dist: ∞';
      const distBadge = LabelSprite.create(distText, this._scene);
      distBadge.setPosition(x, y - VISUAL.GRAPH_VERTEX_RADIUS - 0.75, z);

      this._vertices.set(v.id, { mesh, labelSprite, distBadge, data: v, pos: { x, y, z } });
    }

    // ── Edges ─────────────────────────────────────────────────
    for (const e of edges) {
      this._drawEdge(e.from, e.to, e.weight, data.directed);
    }

    // ── Distance table panel (left) ────────────────────────────
    this._distHeader = LabelSprite.create('Distances', this._scene);
    this._distHeader.setPosition(DIST_TABLE_X, DIST_TABLE_Y + 1.2, 0);

    for (let i = 0; i < n; i++) {
      const v = verts[i];
      const y = DIST_TABLE_Y + i * DIST_ROW_H;

      const geo = new THREE.BoxGeometry(3.6, 1.05, 0.25);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x1e1e2e,
        roughness: 0.6,
        metalness: 0.1,
      });
      const bg = new THREE.Mesh(geo, mat);
      bg.position.set(DIST_TABLE_X, y, 0);
      this._scene.add(bg);

      const dist = v.id === source ? 0 : Infinity;
      const lbl = LabelSprite.create(
        `${v.label || v.id}: ${dist === Infinity ? '∞' : dist}`,
        this._scene
      );
      lbl.setPosition(DIST_TABLE_X, y, 0);

      this._distRows.set(v.id, { bg, lbl });
    }

    // ── Priority queue strip (bottom) ─────────────────────────
    this._pqHeader = LabelSprite.create('Priority Queue (min)', this._scene);
    this._pqHeader.setPosition(0, PQ_Y - 1.5, 0);

    for (let i = 0; i < n; i++) {
      const x = -((n - 1) / 2) * PQ_SLOT_W + i * PQ_SLOT_W;
      const geo = new THREE.BoxGeometry(PQ_SLOT_W - 0.2, 1.1, 0.25);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x1e1e2e,
        transparent: true,
        opacity: 0.4,
        roughness: 0.5,
        metalness: 0.2,
      });
      const bg = new THREE.Mesh(geo, mat);
      bg.position.set(x, PQ_Y, 0);
      this._scene.add(bg);

      const lbl = LabelSprite.create('', this._scene);
      lbl.setPosition(x, PQ_Y, 0);

      this._pqSlots.push({ bg, lbl, x });
    }

    if (data.errors?.length) {
      eventBus.emit(EVENTS.ERROR_PANEL_UPDATE, { errors: data.errors });
    }
  }

  _drawEdge(fromId, toId, weight, directed) {
    const from = this._vertices.get(fromId);
    const to   = this._vertices.get(toId);
    if (!from || !to) return;

    const fPos = from.mesh.position;
    const tPos = to.mesh.position;
    const dir  = new THREE.Vector3().subVectors(tPos, fPos).normalize();
    const r    = VISUAL.GRAPH_VERTEX_RADIUS + 0.05;
    const start = fPos.clone().addScaledVector(dir,  r);
    const end   = tPos.clone().addScaledVector(dir, -r);

    const lineGeo = new THREE.BufferGeometry().setFromPoints([start, end]);
    const lineMat = new THREE.LineBasicMaterial({
      color: VISUAL.GRAPH_EDGE_DEFAULT, transparent: true, opacity: 0.55
    });
    const line = new THREE.Line(lineGeo, lineMat);
    this._scene.add(line);

    // Weight label at midpoint, slightly above
    if (weight !== undefined && weight !== null) {
      const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
      const wLbl = LabelSprite.create(String(weight), this._scene);
      wLbl.setPosition(mid.x, mid.y + 0.45, mid.z);
      this._extra.push(wLbl);
    }

    // Store both directions for undirected lookups
    const edgeObj = { line, lineMat };
    this._edges.set(`${fromId}→${toId}`, edgeObj);
    if (!directed) this._edges.set(`${toId}→${fromId}`, edgeObj);
  }


  // -----------------------------------------------------------
  //  Execute
  // -----------------------------------------------------------
  execute(op) {
    switch (op.type) {
      case 'set_dist':    this._setDist(op.nodeId, op.dist);                break;
      case 'settle':      this._settle(op.nodeId);                          break;
      case 'relax_edge':  this._relaxEdge(op.from, op.to, op.newDist);     break;
      case 'pq_update':   this._pqUpdate(op.entries);                       break;
      case 'highlight':   this._highlight(op.nodeId);                       break;
      case 'mark_path':   this._markPath(op.from, op.to);                  break;
      case 'flag_error':  this._flagError(op.nodeId, op.errorType);        break;
      default:
        if (op.nodeId) this._highlight(op.nodeId);
    }
  }

  _setDist(id, dist) {
    this._dists.set(id, dist);
    const v = this._vertices.get(id);
    if (v) {
      v.distBadge.setText(`dist: ${dist === Infinity ? '∞' : dist}`);
    }
    const row = this._distRows.get(id);
    if (row) {
      const lbl = this._vertices.get(id)?.data?.label ?? id;
      row.lbl.setText(`${lbl}: ${dist === Infinity ? '∞' : dist}`);
      // Highlight row briefly
      row.bg.material.color.setHex(0x3a2a5e);
      setTimeout(() => { row.bg.material.color.setHex(0x1e1e2e); }, 600);
    }
  }

  _settle(id) {
    this._clearActive();
    const v = this._vertices.get(id);
    if (!v) return;
    v.mesh.material.color.setHex(COLOR_SETTLED);
    v.mesh.material.emissive.setHex(EMISSIVE_SETTLE);
    v.mesh.material.emissiveIntensity = 0.5;

    // Settled badge above vertex
    const dist = this._dists.get(id);
    const old = this._settledBadges.get(id);
    if (old) old.dispose();
    const badge = LabelSprite.create(`✓ ${dist}`, this._scene);
    badge.setPosition(v.pos.x, v.pos.y + VISUAL.GRAPH_VERTEX_RADIUS + 1.6, v.pos.z);
    this._settledBadges.set(id, badge);

    // Update distance table row to green
    const row = this._distRows.get(id);
    if (row) row.bg.material.color.setHex(0x1a4c30);
  }

  _relaxEdge(fromId, toId, newDist) {
    this._clearActive();
    const edge = this._edges.get(`${fromId}→${toId}`) ?? this._edges.get(`${toId}→${fromId}`);
    if (edge) {
      edge.lineMat.color.setHex(COLOR_ACTIVE);
      edge.lineMat.opacity = 1.0;
    }
    const to = this._vertices.get(toId);
    if (to) {
      to.mesh.material.color.setHex(COLOR_ACTIVE);
      to.mesh.material.emissive.setHex(EMISSIVE_ACTIVE);
      to.mesh.material.emissiveIntensity = 0.6;
      this._activeVert = toId;
    }
    if (newDist !== undefined) this._setDist(toId, newDist);
  }

  _pqUpdate(entries) {
    // entries: array of { label, dist } ordered min-first
    for (let i = 0; i < this._pqSlots.length; i++) {
      const slot = this._pqSlots[i];
      const entry = entries?.[i];
      if (entry) {
        slot.bg.material.color.setHex(0x3a2a5e);
        slot.bg.material.transparent = false;
        slot.bg.material.opacity = 1.0;
        slot.lbl.setText(`${entry.label}:${entry.dist === Infinity ? '∞' : entry.dist}`);
      } else {
        slot.bg.material.color.setHex(0x1e1e2e);
        slot.bg.material.transparent = true;
        slot.bg.material.opacity = 0.35;
        slot.lbl.setText('');
      }
    }
  }

  _markPath(fromId, toId) {
    const edge = this._edges.get(`${fromId}→${toId}`) ?? this._edges.get(`${toId}→${fromId}`);
    if (edge) {
      edge.lineMat.color.setHex(COLOR_PATH);
      edge.lineMat.opacity = 1.0;
    }
  }

  _highlight(id) {
    this._clearActive();
    const v = this._vertices.get(id);
    if (!v) return;
    v.mesh.material.color.setHex(COLOR_ACTIVE);
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
      if (v && !v.data.settled) {
        v.mesh.material.color.setHex(COLOR_DEFAULT);
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
        v.mesh.material.emissiveIntensity = 0.4 + p * 0.4;
      }
    }
  }


  // -----------------------------------------------------------
  //  Dispose
  // -----------------------------------------------------------
  dispose() {
    for (const { mesh, labelSprite, distBadge } of this._vertices.values()) {
      mesh.geometry.dispose(); mesh.material.dispose(); this._scene.remove(mesh);
      labelSprite.dispose(); distBadge.dispose();
    }
    this._vertices.clear();

    for (const { line, lineMat } of new Set(this._edges.values())) {
      line.geometry.dispose(); lineMat.dispose(); this._scene.remove(line);
    }
    this._edges.clear();

    for (const obj of this._extra) obj.dispose?.();
    this._extra = [];

    for (const { bg, lbl } of this._distRows.values()) {
      bg.geometry.dispose(); bg.material.dispose(); this._scene.remove(bg);
      lbl.dispose();
    }
    this._distRows.clear();

    for (const { bg, lbl } of this._pqSlots) {
      bg.geometry.dispose(); bg.material.dispose(); this._scene.remove(bg);
      lbl.dispose();
    }
    this._pqSlots = [];

    for (const badge of this._settledBadges.values()) badge.dispose();
    this._settledBadges.clear();

    [this._distHeader, this._pqHeader].forEach(l => l?.dispose());
    this._distHeader = null;
    this._pqHeader   = null;
    this._activeVert = null;
  }
}


export default Dijkstra;