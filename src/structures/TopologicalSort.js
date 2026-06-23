// =============================================================
//  SeeDS — TopologicalSort.js
//  Renders a Directed Acyclic Graph (DAG) and steps through
//  DFS-based topological sort visually.
//
//  Key visuals:
//    • DAG with directed edges (arrowheads on all edges)
//    • DFS stack column — a vertical panel on the RIGHT showing
//      the current recursion stack as glowing slot boxes
//    • Result strip — a horizontal row at the BOTTOM that fills
//      LEFT-TO-RIGHT with vertices as they are popped off the
//      stack (i.e. in reverse finish order = topo order)
//    • In-degree label floating below each vertex — updates as
//      edges are "consumed"
//    • Cycle detection — vertex flashes red if a back-edge is
//      found (flag_error with errorType 'back_edge')
//
//  JSON shape:
//    { type, vertices[], edges[], operations[] }
//  Each vertex: { id, label, x?, y?, z?, inDegree? }
//  Each edge: { from, to } (all edges directed, no weight needed)
//
//  Operation types:
//    visit_vertex, dfs_push, dfs_pop, result_append,
//    traverse_edge, highlight, flag_error
// =============================================================

import * as THREE  from '../../vendor/three/three.module.js';
import eventBus    from '../core/eventBus.js';
import { EVENTS, LAYOUT, VISUAL } from '../core/constants.js';
import LabelSprite from '../renderer/LabelSprite.js';


// Colours
const COLOR_UNVISITED   = 0x4f8ef7;   // default vertex
const COLOR_IN_STACK    = 0xffc44d;   // amber  — currently on DFS stack
const COLOR_DONE        = 0x4fc97e;   // green  — fully processed
const COLOR_RESULT      = 0x7b5ea7;   // purple — in result strip
const COLOR_BACK_EDGE   = 0xff3333;   // red    — cycle detected!
const EMISSIVE_STACK    = 0x6a4400;
const EMISSIVE_DONE     = 0x1a5c38;
const EMISSIVE_RESULT   = 0x2d1a5c;

// Panel geometry
const STACK_X           =  9.5;   // right side of scene
const STACK_Y_TOP       =  5.0;
const STACK_SLOT_H      =  1.2;
const STACK_SLOT_W      =  2.4;
const RESULT_Y          = -7.5;   // below the graph


class TopologicalSort {
  constructor(scene, camera) {
    this._scene   = scene;
    this._camera  = camera;

    this._vertices     = new Map();   // id → { mesh, labelSprite, inDegLabel, data }
    this._edges        = new Map();   // "from→to" → { line, arrow }
    this._extra        = [];

    // DFS stack panel (right side)
    this._stackSlots   = [];          // array of { mesh, label } from top down
    this._stackItems   = [];          // current contents (vertex ids), top at [0]

    // Result strip (bottom)
    this._resultSlots  = [];
    this._resultCount  = 0;

    // Panel headers
    this._stackHeader  = null;
    this._resultHeader = null;

    this._data         = null;
    this._activeVert   = null;
  }


  // -----------------------------------------------------------
  //  Build
  // -----------------------------------------------------------
  build(data) {
    this._data = data;
    const verts = data.vertices || [];
    const edges = data.edges   || [];
    const n     = verts.length;

    // ── Layout vertices in a circle (or use given x/y) ──────
    const radius = LAYOUT.GRAPH_RADIUS;
    for (let i = 0; i < n; i++) {
      const v = verts[i];
      const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
      const x = (v.x !== undefined) ? v.x : radius * Math.cos(angle);
      const y = (v.y !== undefined) ? v.y : 0;
      const z = (v.z !== undefined) ? v.z : radius * Math.sin(angle);

      const geo = new THREE.SphereGeometry(VISUAL.GRAPH_VERTEX_RADIUS, 24, 24);
      const mat = new THREE.MeshStandardMaterial({
        color: COLOR_UNVISITED,
        emissive: VISUAL.GRAPH_VERTEX_EMISSIVE,
        emissiveIntensity: 0.3,
        roughness: 0.3,
        metalness: 0.4,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      this._scene.add(mesh);

      const labelSprite = LabelSprite.create(v.label || v.id, this._scene);
      labelSprite.setPosition(x, y + VISUAL.GRAPH_VERTEX_RADIUS + 0.65, z);

      // In-degree label below the vertex
      const indeg = (v.inDegree !== undefined) ? v.inDegree : '?';
      const inDegLabel = LabelSprite.create(`in: ${indeg}`, this._scene);
      inDegLabel.setPosition(x, y - VISUAL.GRAPH_VERTEX_RADIUS - 0.7, z);

      this._vertices.set(v.id, { mesh, labelSprite, inDegLabel, data: v });
    }

    // ── Draw directed edges ───────────────────────────────────
    for (const e of edges) {
      this._drawEdge(e.from, e.to, VISUAL.GRAPH_EDGE_DEFAULT);
    }

    // ── DFS Stack panel ───────────────────────────────────────
    this._stackHeader = LabelSprite.create('DFS Stack', this._scene);
    this._stackHeader.setPosition(STACK_X, STACK_Y_TOP + 1.4, 0);

    // Pre-build n empty stack slot boxes
    for (let i = 0; i < n; i++) {
      const y = STACK_Y_TOP - i * STACK_SLOT_H;
      const geo = new THREE.BoxGeometry(STACK_SLOT_W, STACK_SLOT_H * 0.85, 0.3);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x2a2a3a,
        transparent: true,
        opacity: 0.4,
        roughness: 0.5,
        metalness: 0.2,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(STACK_X, y, 0);
      this._scene.add(mesh);

      const label = LabelSprite.create('', this._scene);
      label.setPosition(STACK_X, y, 0);

      this._stackSlots.push({ mesh, label });
    }

    // ── Result strip panel ────────────────────────────────────
    this._resultHeader = LabelSprite.create('Topological Order →', this._scene);
    this._resultHeader.setPosition(0, RESULT_Y - 1.5, 0);

    for (let i = 0; i < n; i++) {
      const x = -((n - 1) / 2) * 2.2 + i * 2.2;
      const geo = new THREE.BoxGeometry(1.9, 1.1, 0.3);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x2a2a3a,
        transparent: true,
        opacity: 0.35,
        roughness: 0.5,
        metalness: 0.2,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, RESULT_Y, 0);
      this._scene.add(mesh);

      const label = LabelSprite.create('', this._scene);
      label.setPosition(x, RESULT_Y, 0);

      this._resultSlots.push({ mesh, label });
    }

    if (data.errors?.length) {
      eventBus.emit(EVENTS.ERROR_PANEL_UPDATE, { errors: data.errors });
    }
  }

  _drawEdge(fromId, toId, color) {
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
    const lineMat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.65 });
    const line = new THREE.Line(lineGeo, lineMat);
    this._scene.add(line);

    // Arrowhead
    const arrowDir = new THREE.Vector3().subVectors(end, start).normalize();
    const coneGeo  = new THREE.ConeGeometry(0.12, 0.35, 6);
    const coneMat  = new THREE.MeshStandardMaterial({ color });
    const cone     = new THREE.Mesh(coneGeo, coneMat);
    cone.position.copy(end.clone().sub(arrowDir.clone().multiplyScalar(0.1)));
    const up = new THREE.Vector3(0, 1, 0);
    if (Math.abs(arrowDir.dot(up)) < 0.999) cone.quaternion.setFromUnitVectors(up, arrowDir);
    else cone.rotation.set(arrowDir.y < 0 ? Math.PI : 0, 0, 0);
    this._scene.add(cone);

    this._edges.set(`${fromId}→${toId}`, { line, lineMat, cone, coneMat });
  }


  // -----------------------------------------------------------
  //  Execute
  // -----------------------------------------------------------
  execute(op) {
    switch (op.type) {
      case 'visit_vertex':  this._visitVertex(op.nodeId);             break;
      case 'dfs_push':      this._dfsPush(op.nodeId);                 break;
      case 'dfs_pop':       this._dfsPop(op.nodeId);                  break;
      case 'result_append': this._resultAppend(op.nodeId);            break;
      case 'traverse_edge': this._traverseEdge(op.from, op.to, op.isBackEdge); break;
      case 'highlight':     this._highlight(op.nodeId);               break;
      case 'flag_error':    this._flagError(op.nodeId, op.errorType); break;
      default:
        if (op.nodeId) this._highlight(op.nodeId);
    }
  }

  _visitVertex(id) {
    this._clearActive();
    const v = this._vertices.get(id);
    if (!v) return;
    v.mesh.material.color.setHex(COLOR_IN_STACK);
    v.mesh.material.emissive.setHex(EMISSIVE_STACK);
    v.mesh.material.emissiveIntensity = 0.55;
    this._activeVert = id;
  }

  _dfsPush(id) {
    const v = this._vertices.get(id);
    if (!v) return;

    this._stackItems.unshift(id);
    this._redrawStack();

    v.mesh.material.color.setHex(COLOR_IN_STACK);
    v.mesh.material.emissive.setHex(EMISSIVE_STACK);
    v.mesh.material.emissiveIntensity = 0.6;
  }

  _dfsPop(id) {
    const idx = this._stackItems.indexOf(id);
    if (idx !== -1) this._stackItems.splice(idx, 1);
    this._redrawStack();

    const v = this._vertices.get(id);
    if (v) {
      v.mesh.material.color.setHex(COLOR_DONE);
      v.mesh.material.emissive.setHex(EMISSIVE_DONE);
      v.mesh.material.emissiveIntensity = 0.5;
    }
  }

  _resultAppend(id) {
    const v = this._vertices.get(id);
    const label = v?.data?.label ?? id;

    const slot = this._resultSlots[this._resultCount];
    if (!slot) return;
    slot.mesh.material.color.setHex(COLOR_RESULT);
    slot.mesh.material.transparent = false;
    slot.mesh.material.opacity = 1.0;
    slot.mesh.material.emissive = new THREE.Color(EMISSIVE_RESULT);
    slot.mesh.material.emissiveIntensity = 0.4;
    slot.label.setText(label);
    this._resultCount++;
  }

  _redrawStack() {
    // Top of stack = index 0 = top slot visually
    for (let i = 0; i < this._stackSlots.length; i++) {
      const slot = this._stackSlots[i];
      const vertId = this._stackItems[i];
      if (vertId) {
        const v = this._vertices.get(vertId);
        const lbl = v?.data?.label ?? vertId;
        slot.mesh.material.color.setHex(COLOR_IN_STACK);
        slot.mesh.material.transparent = false;
        slot.mesh.material.opacity = 1.0;
        slot.label.setText(lbl);
      } else {
        slot.mesh.material.color.setHex(0x2a2a3a);
        slot.mesh.material.transparent = true;
        slot.mesh.material.opacity = 0.4;
        slot.label.setText('');
      }
    }
  }

  _traverseEdge(fromId, toId, isBackEdge) {
    const key = `${fromId}→${toId}`;
    const edge = this._edges.get(key);
    if (!edge) return;
    const c = isBackEdge ? COLOR_BACK_EDGE : VISUAL.GRAPH_VISITED_COLOR;
    edge.lineMat.color.setHex(c);
    edge.lineMat.opacity = 1.0;
    edge.coneMat.color.setHex(c);
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
    if (!v) return;
    v.mesh.material.color.setHex(COLOR_BACK_EDGE);
    v.mesh.material.emissive.setHex(0x5a0000);
    v.mesh.material.emissiveIntensity = 0.7;
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
    // Pulse the topmost stack slot
    if (this._stackSlots.length > 0 && this._stackItems.length > 0) {
      const top = this._stackSlots[0];
      const p = (Math.sin(elapsed * 5) + 1) / 2;
      top.mesh.material.emissiveIntensity = 0.3 + p * 0.5;
    }
  }


  // -----------------------------------------------------------
  //  Dispose
  // -----------------------------------------------------------
  dispose() {
    for (const { mesh, labelSprite, inDegLabel } of this._vertices.values()) {
      mesh.geometry.dispose(); mesh.material.dispose(); this._scene.remove(mesh);
      labelSprite.dispose();
      if (inDegLabel) inDegLabel.dispose();
    }
    this._vertices.clear();

    for (const { line, lineMat, cone, coneMat } of this._edges.values()) {
      line.geometry.dispose(); lineMat.dispose(); this._scene.remove(line);
      cone.geometry.dispose(); coneMat.dispose(); this._scene.remove(cone);
    }
    this._edges.clear();

    for (const { mesh, label } of [...this._stackSlots, ...this._resultSlots]) {
      mesh.geometry.dispose(); mesh.material.dispose(); this._scene.remove(mesh);
      label.dispose();
    }
    this._stackSlots  = [];
    this._resultSlots = [];

    [this._stackHeader, this._resultHeader].forEach(l => l?.dispose());
    this._stackHeader  = null;
    this._resultHeader = null;
    this._activeVert   = null;
  }
}


export default TopologicalSort;