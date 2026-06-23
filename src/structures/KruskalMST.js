// =============================================================
//  SeeDS — KruskalMST.js
//  Renders Kruskal's Minimum Spanning Tree algorithm.
//
//  Key visuals:
//    • Sorted edge list panel on the LEFT — all edges sorted by
//      weight, highlighted one by one as algorithm processes them
//    • Union-Find component colour coding — each connected
//      component gets a distinct hue; merging two components
//      recolours one entire set to match the other
//    • Accepted edges glow GREEN, rejected (would-create-cycle)
//      edges flash RED briefly then turn grey
//    • MST cost counter top-right
//    • Component count badge top-left "Components: N"
//
//  JSON shape:
//    { type, vertices[], edges[], operations[] }
//  Each vertex: { id, label, x?, y?, z? }
//  Each edge:   { id, from, to, weight }
//
//  Operation types:
//    consider_edge, accept_edge, reject_edge, union_components,
//    update_cost, update_components, highlight, flag_error
// =============================================================

import * as THREE  from '../../vendor/three/three.module.js';
import eventBus    from '../core/eventBus.js';
import { EVENTS, LAYOUT, VISUAL } from '../core/constants.js';
import LabelSprite from '../renderer/LabelSprite.js';


// Component colour palette — up to 8 distinct components
const COMPONENT_COLORS = [
  0x5da8ff, 0xffc44d, 0x4fc97e, 0xff6b6b,
  0xb47dff, 0xff9f43, 0x48dbfb, 0xff6b81,
];

// Colours for edge states
const COLOR_CONSIDER  = 0xffffff;   // white flash — currently being evaluated
const COLOR_ACCEPT    = 0x4fc97e;   // green — added to MST
const COLOR_REJECT    = 0xff3333;   // red — would create cycle
const COLOR_IDLE      = VISUAL.GRAPH_EDGE_DEFAULT;

// Panel positions
const EDGE_LIST_X     = -11.0;
const EDGE_LIST_Y_TOP =  5.5;
const EDGE_ROW_H      = -1.25;
const COST_X          =  9.5;
const COMP_X          = -10.5;


class KruskalMST {
  constructor(scene, camera) {
    this._scene   = scene;
    this._camera  = camera;

    this._vertices    = new Map();   // id → { mesh, labelSprite, component, data, pos }
    this._edgesMap    = new Map();   // "from→to" / "to→from" → { line, lineMat, data }
    this._extra       = [];

    // Edge list panel (left)
    this._edgeListRows  = [];        // { bg, lbl, edgeId }  ordered by weight
    this._edgeListHeader = null;

    // Cost + component count labels
    this._costLabel    = null;
    this._compLabel    = null;

    // Union-Find: component id per vertex
    this._components   = new Map();  // vertId → componentId
    this._nextComp     = 0;

    this._totalCost    = 0;
    this._numComps     = 0;

    this._data         = null;
    this._activeVert   = null;
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

    // ── Vertices — each starts in its own component ─────────
    for (let i = 0; i < n; i++) {
      const v = verts[i];
      const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
      const x = (v.x !== undefined) ? v.x : radius * Math.cos(angle);
      const y = (v.y !== undefined) ? v.y : 0;
      const z = (v.z !== undefined) ? v.z : radius * Math.sin(angle);

      const compId = this._nextComp++;
      this._components.set(v.id, compId);

      const color = COMPONENT_COLORS[compId % COMPONENT_COLORS.length];
      const geo = new THREE.SphereGeometry(VISUAL.GRAPH_VERTEX_RADIUS, 24, 24);
      const mat = new THREE.MeshStandardMaterial({
        color, emissive: 0x111122, emissiveIntensity: 0.3,
        roughness: 0.3, metalness: 0.4,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      this._scene.add(mesh);

      const labelSprite = LabelSprite.create(v.label || v.id, this._scene);
      labelSprite.setPosition(x, y + VISUAL.GRAPH_VERTEX_RADIUS + 0.65, z);

      this._vertices.set(v.id, { mesh, labelSprite, component: compId, data: v, pos: { x, y, z } });
    }
    this._numComps = n;

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
        color: COLOR_IDLE, transparent: true, opacity: 0.5
      });
      const line = new THREE.Line(lineGeo, lineMat);
      this._scene.add(line);

      // Weight label
      const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
      const wLbl = LabelSprite.create(String(e.weight), this._scene);
      wLbl.setPosition(mid.x, mid.y + 0.45, mid.z);
      this._extra.push(wLbl);

      const edgeObj = { line, lineMat, data: e };
      const key = e.id ?? `${e.from}→${e.to}`;
      this._edgesMap.set(key, edgeObj);
      this._edgesMap.set(`${e.from}→${e.to}`, edgeObj);
      this._edgesMap.set(`${e.to}→${e.from}`, edgeObj);
    }

    // ── Sorted Edge List panel (left) ─────────────────────────
    this._edgeListHeader = LabelSprite.create('Edges (sorted ↑ weight)', this._scene);
    this._edgeListHeader.setPosition(EDGE_LIST_X, EDGE_LIST_Y_TOP + 1.2, 0);

    // Sort edges by weight for display
    const sorted = [...edges].sort((a, b) => a.weight - b.weight);
    for (let i = 0; i < sorted.length; i++) {
      const e = sorted[i];
      const y = EDGE_LIST_Y_TOP + i * EDGE_ROW_H;

      const geo = new THREE.BoxGeometry(3.8, 1.0, 0.25);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x1e1e2e, roughness: 0.6, metalness: 0.1,
      });
      const bg = new THREE.Mesh(geo, mat);
      bg.position.set(EDGE_LIST_X, y, 0);
      this._scene.add(bg);

      const fromV = this._vertices.get(e.from)?.data?.label ?? e.from;
      const toV   = this._vertices.get(e.to)?.data?.label   ?? e.to;
      const lbl = LabelSprite.create(`${fromV}–${toV}: ${e.weight}`, this._scene);
      lbl.setPosition(EDGE_LIST_X, y, 0);

      const key = e.id ?? `${e.from}→${e.to}`;
      this._edgeListRows.push({ bg, lbl, edgeId: key, fromId: e.from, toId: e.to });
    }

    // ── MST Cost + Component count ────────────────────────────
    this._costLabel = LabelSprite.create('MST Cost: 0', this._scene);
    this._costLabel.setPosition(COST_X, 6.5, 0);

    this._compLabel = LabelSprite.create(`Components: ${n}`, this._scene);
    this._compLabel.setPosition(COMP_X, -6.0, 0);

    if (data.errors?.length) {
      eventBus.emit(EVENTS.ERROR_PANEL_UPDATE, { errors: data.errors });
    }
  }


  // -----------------------------------------------------------
  //  Execute
  // -----------------------------------------------------------
  execute(op) {
    switch (op.type) {
      case 'consider_edge':    this._considerEdge(op.from, op.to);            break;
      case 'accept_edge':      this._acceptEdge(op.from, op.to, op.weight);   break;
      case 'reject_edge':      this._rejectEdge(op.from, op.to);              break;
      case 'union_components': this._unionComponents(op.setA, op.setB);       break;
      case 'update_cost':      this._updateCost(op.cost);                     break;
      case 'update_components':this._updateComponents(op.count);              break;
      case 'highlight':        this._highlight(op.nodeId);                    break;
      case 'flag_error':       this._flagError(op.nodeId, op.errorType);      break;
      default:
        if (op.nodeId) this._highlight(op.nodeId);
    }
  }

  _considerEdge(fromId, toId) {
    const edge = this._getEdge(fromId, toId);
    if (edge) {
      edge.lineMat.color.setHex(COLOR_CONSIDER);
      edge.lineMat.opacity = 1.0;
    }
    // Highlight the corresponding row in the edge list
    const row = this._edgeListRows.find(r => r.fromId === fromId && r.toId === toId);
    if (row) {
      row.bg.material.color.setHex(0x3a3a5e);
    }
  }

  _acceptEdge(fromId, toId, weight) {
    const edge = this._getEdge(fromId, toId);
    if (edge) {
      edge.lineMat.color.setHex(COLOR_ACCEPT);
      edge.lineMat.opacity = 1.0;
    }
    const row = this._edgeListRows.find(r => r.fromId === fromId && r.toId === toId);
    if (row) {
      row.bg.material.color.setHex(0x1a4c30);
    }
  }

  _rejectEdge(fromId, toId) {
    const edge = this._getEdge(fromId, toId);
    if (edge) {
      edge.lineMat.color.setHex(COLOR_REJECT);
      edge.lineMat.opacity = 0.9;
      setTimeout(() => {
        edge.lineMat.color.setHex(0x3a2020);
        edge.lineMat.opacity = 0.3;
      }, 700);
    }
    const row = this._edgeListRows.find(r => r.fromId === fromId && r.toId === toId);
    if (row) {
      row.bg.material.color.setHex(0x3a1a1a);
    }
  }

  _unionComponents(setAIds, setBIds) {
    // Find the colour of set A and repaint all of set B with it
    if (!setAIds?.length || !setBIds?.length) return;
    const compA = this._components.get(setAIds[0]);
    const color = COMPONENT_COLORS[compA % COMPONENT_COLORS.length];

    for (const id of setBIds) {
      this._components.set(id, compA);
      const v = this._vertices.get(id);
      if (v) {
        v.mesh.material.color.setHex(color);
        v.component = compA;
      }
    }
    // Also repaint setA vertices (in case they were from a smaller merged set)
    for (const id of setAIds) {
      this._components.set(id, compA);
      const v = this._vertices.get(id);
      if (v) {
        v.mesh.material.color.setHex(color);
        v.component = compA;
      }
    }
  }

  _updateCost(cost) {
    this._totalCost = cost;
    this._costLabel?.setText(`MST Cost: ${cost}`);
  }

  _updateComponents(count) {
    this._numComps = count;
    this._compLabel?.setText(`Components: ${count}`);
  }

  _highlight(id) {
    this._clearActive();
    const v = this._vertices.get(id);
    if (!v) return;
    v.mesh.scale.setScalar(1.2);
    v.mesh.material.emissiveIntensity = 0.7;
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
        v.mesh.scale.setScalar(1.0);
        v.mesh.material.emissiveIntensity = 0.3;
      }
      this._activeVert = null;
    }
  }

  _getEdge(fromId, toId) {
    return this._edgesMap.get(`${fromId}→${toId}`) ?? this._edgesMap.get(`${toId}→${fromId}`);
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
    for (const { mesh, labelSprite } of this._vertices.values()) {
      mesh.geometry.dispose(); mesh.material.dispose(); this._scene.remove(mesh);
      labelSprite.dispose();
    }
    this._vertices.clear();

    const uniqueEdges = new Set(this._edgesMap.values());
    for (const { line, lineMat } of uniqueEdges) {
      line.geometry.dispose(); lineMat.dispose(); this._scene.remove(line);
    }
    this._edgesMap.clear();

    for (const obj of this._extra) obj.dispose?.();
    this._extra = [];

    for (const { bg, lbl } of this._edgeListRows) {
      bg.geometry.dispose(); bg.material.dispose(); this._scene.remove(bg);
      lbl.dispose();
    }
    this._edgeListRows = [];

    [this._edgeListHeader, this._costLabel, this._compLabel].forEach(l => l?.dispose());
    this._edgeListHeader = null;
    this._costLabel      = null;
    this._compLabel      = null;
    this._activeVert     = null;
  }
}


export default KruskalMST;