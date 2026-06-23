// =============================================================
//  SeeDS — ExpressionTree.js
//  Renders an Expression Tree — a binary tree where internal
//  nodes are operators (+, -, *, /) and leaves are operands.
//
//  Key visuals:
//    • Operator nodes  → amber spheres (distinct, prominent)
//    • Operand nodes   → blue spheres  (standard node colour)
//    • Expression strip → LabelSprite below the scene that
//      builds up the infix/postfix string as traversal runs
//    • Evaluation badge → floating "= 14" above operator nodes
//      after both children have been visited
//    • Traversal label  → "In-Order" or "Post-Order" static
//      label in the top-left of the scene
//
//  JSON shape:
//    { type, nodes[], root, expression?, traversalType?,
//      operations[] }
//  Each node:
//    { id, value, left?, right?, isOperator, result? }
//
//  Operation types:
//    traverse, visit, evaluate, highlight, set_traversal,
//    flag_error
// =============================================================

import * as THREE  from '../../vendor/three/three.module.js';
import eventBus    from '../core/eventBus.js';
import { EVENTS, LAYOUT, VISUAL } from '../core/constants.js';
import NodeMesh    from '../renderer/NodeMesh.js';
import EdgeMesh    from '../renderer/EdgeMesh.js';
import LabelSprite from '../renderer/LabelSprite.js';


// Colour palette
const COLOR_OPERATOR  = 0xffc44d;   // amber  — operator node (+, -, *, /)
const COLOR_OPERAND   = 0x5da8ff;   // blue   — operand node (number / var)
const COLOR_VISITED   = 0x4fc97e;   // green  — node has been visited
const COLOR_ACTIVE    = 0xffffff;   // white  — currently highlighted
const EMISSIVE_OP     = 0x6a4400;   // amber emissive
const EMISSIVE_OPND   = 0x1a3a6e;   // blue emissive
const EMISSIVE_VISIT  = 0x1a5c38;   // green emissive


class ExpressionTree {
  constructor(scene, camera) {
    this._scene  = scene;
    this._camera = camera;

    this._nodes    = new Map();   // id → { mesh: NodeMesh, data, pos }
    this._edges    = new Map();   // "p→c" → EdgeMesh
    this._labels   = new Map();   // id → LabelSprite (value label above node)
    this._evalBadges = new Map(); // id → LabelSprite ("= N" floating badge)

    this._data          = null;
    this._activeNode    = null;
    this._activeEdge    = null;

    // Bottom expression strip — builds up during traversal
    this._exprStrip     = null;
    this._exprText      = '';

    // Top-left traversal type label
    this._traversalLabel = null;

    // Track visited nodes so we know when to show eval badges
    this._visited = new Set();
  }


  // -----------------------------------------------------------
  //  Build
  // -----------------------------------------------------------
  build(data) {
    this._data = data;
    const nodeMap = new Map(data.nodes.map(n => [n.id, n]));

    // Layout: same recursive algorithm as BinaryTree.js
    const positions = new Map();
    this._layoutNode(data.root, 0, 0, 1, nodeMap, positions);

    // ── Create node meshes & value labels ───────────────────
    for (const [id, pos] of positions) {
      const node = nodeMap.get(id);

      // Build a custom NodeMesh but override colour for operators
      const mesh = NodeMesh.create(node, this._scene);
      mesh.setPosition(pos.x, pos.y, 0);

      // Override material colour based on isOperator flag
      this._styleNode(mesh, node);

      const label = LabelSprite.create(String(node.value), this._scene);
      label.setPosition(pos.x, pos.y + VISUAL.NODE_RADIUS + 0.85, 0);

      this._nodes.set(id, { mesh, data: node, pos });
      this._labels.set(id, label);
    }

    // ── Draw edges ────────────────────────────────────────────
    for (const node of data.nodes) {
      for (const side of ['left', 'right']) {
        const childId = node[side];
        if (!childId) continue;
        const from = this._nodes.get(node.id);
        const to   = this._nodes.get(childId);
        if (!from || !to) continue;
        const edge = EdgeMesh.create(from.mesh.position, to.mesh.position, this._scene);
        this._edges.set(`${node.id}→${childId}`, edge);
      }
    }

    // ── Expression strip (bottom of scene) ───────────────────
    // Sits well below the lowest tree level
    const lowestY = Math.min(...[...positions.values()].map(p => p.y));
    this._exprStrip = LabelSprite.create('', this._scene);
    this._exprStrip.setPosition(0, lowestY - 3.2, 0);

    // ── Traversal type label (top of scene) ──────────────────
    const highestY = Math.max(...[...positions.values()].map(p => p.y));
    const traversalText = data.traversalType
      ? this._formatTraversalType(data.traversalType)
      : '';
    this._traversalLabel = LabelSprite.create(traversalText, this._scene);
    this._traversalLabel.setPosition(0, highestY + 3.0, 0);

    if (data.errors?.length) {
      eventBus.emit(EVENTS.ERROR_PANEL_UPDATE, { errors: data.errors });
    }
  }

  // Recursive layout — identical to BinaryTree._layoutNode
  _layoutNode(id, level, xOffset, spread, nodeMap, positions) {
    if (!id || !nodeMap.has(id)) return;
    const node = nodeMap.get(id);
    positions.set(id, {
      x: xOffset,
      y: -level * LAYOUT.TREE_LEVEL_HEIGHT,
    });
    const half = spread * LAYOUT.TREE_H_SPREAD;
    if (node.left)  this._layoutNode(node.left,  level + 1, xOffset - half, half, nodeMap, positions);
    if (node.right) this._layoutNode(node.right, level + 1, xOffset + half, half, nodeMap, positions);
  }

  // Apply operator vs operand colour to a NodeMesh
  _styleNode(mesh, nodeData) {
    const m = mesh._mesh?.material;
    if (!m) return;
    if (nodeData.isOperator) {
      m.color.setHex(COLOR_OPERATOR);
      m.emissive.setHex(EMISSIVE_OP);
      m.emissiveIntensity = 0.45;
    } else {
      m.color.setHex(COLOR_OPERAND);
      m.emissive.setHex(EMISSIVE_OPND);
      m.emissiveIntensity = 0.3;
    }
  }

  _formatTraversalType(t) {
    if (t === 'inorder')   return 'Traversal: In-Order';
    if (t === 'postorder') return 'Traversal: Post-Order';
    if (t === 'preorder')  return 'Traversal: Pre-Order';
    return `Traversal: ${t}`;
  }


  // -----------------------------------------------------------
  //  Execute
  // -----------------------------------------------------------
  execute(op) {
    switch (op.type) {
      case 'traverse':      this._traverse(op.from, op.to);              break;
      case 'visit':         this._visit(op.nodeId, op.fragment);         break;
      case 'evaluate':      this._evaluate(op.nodeId, op.result);        break;
      case 'highlight':     this._highlight(op.nodeId);                  break;
      case 'set_traversal': this._setTraversal(op.traversalType);        break;
      case 'flag_error':    this._flagError(op.nodeId, op.errorType);    break;
      default:
        if (op.nodeId) this._highlight(op.nodeId);
    }
  }

  // ── traverse: highlight edge then move to destination ──────
  _traverse(fromId, toId) {
    this._clearActive();
    const from = this._nodes.get(fromId);
    const to   = this._nodes.get(toId);
    const edge = this._edges.get(`${fromId}→${toId}`);

    if (from) { from.mesh.setActive(true); this._activeNode = from.mesh; }
    if (edge) { edge.setActive(true);      this._activeEdge = edge; }

    if (to) {
      setTimeout(() => {
        from?.mesh.setActive(false);
        edge?.setActive(false);
        to.mesh.setActive(true);
        this._activeNode = to.mesh;
        this._activeEdge = null;
      }, 380);
    }
  }

  // ── visit: mark node green, append fragment to expression strip
  _visit(nodeId, fragment) {
    this._clearActive();
    const entry = this._nodes.get(nodeId);
    if (!entry) return;

    this._visited.add(nodeId);

    // Turn node green
    const m = entry.mesh._mesh?.material;
    if (m) {
      m.color.setHex(COLOR_VISITED);
      m.emissive.setHex(EMISSIVE_VISIT);
      m.emissiveIntensity = 0.5;
    }
    entry.mesh.setActive(true);
    this._activeNode = entry.mesh;

    // Append to the expression strip
    if (fragment !== undefined && fragment !== null) {
      this._exprText = this._exprText
        ? `${this._exprText}  ${fragment}`
        : String(fragment);
      this._exprStrip.setText(this._exprText);
    }
  }

  // ── evaluate: show floating "= result" badge above operator ─
  _evaluate(nodeId, result) {
    const entry = this._nodes.get(nodeId);
    if (!entry) return;

    // Remove old badge for this node if there is one
    const old = this._evalBadges.get(nodeId);
    if (old) { old.dispose(); this._evalBadges.delete(nodeId); }

    const badge = LabelSprite.create(`= ${result}`, this._scene);
    badge.setPosition(
      entry.pos.x,
      entry.pos.y + VISUAL.NODE_RADIUS + 2.2,
      0
    );
    this._evalBadges.set(nodeId, badge);

    // Also give the node a brief bright pulse
    entry.mesh.setActive(true);
    this._activeNode = entry.mesh;
  }

  // ── highlight: standard pulse ───────────────────────────────
  _highlight(nodeId) {
    this._clearActive();
    const entry = this._nodes.get(nodeId);
    if (!entry) return;
    entry.mesh.setActive(true);
    this._activeNode = entry.mesh;
  }

  // ── set_traversal: update the traversal type label ──────────
  _setTraversal(traversalType) {
    if (this._traversalLabel) {
      this._traversalLabel.setText(this._formatTraversalType(traversalType));
    }
  }

  // ── flag_error ───────────────────────────────────────────────
  _flagError(nodeId, errorType) {
    const entry = this._nodes.get(nodeId);
    if (entry) entry.mesh.setError(errorType);
    const errors = this._data?.errors ?? [];
    if (errors.length) eventBus.emit(EVENTS.ERROR_PANEL_UPDATE, { errors });
  }

  _clearActive() {
    if (this._activeNode) { this._activeNode.setActive(false); this._activeNode = null; }
    if (this._activeEdge) { this._activeEdge.setActive(false); this._activeEdge = null; }
  }


  // -----------------------------------------------------------
  //  Tick
  // -----------------------------------------------------------
  tick(delta, elapsed) {
    for (const { mesh } of this._nodes.values()) mesh.tick(delta, elapsed);
  }


  // -----------------------------------------------------------
  //  Dispose — clean up every object in the scene
  // -----------------------------------------------------------
  dispose() {
    for (const { mesh }  of this._nodes.values())  mesh.dispose();
    for (const edge      of this._edges.values())  edge.dispose();
    for (const label     of this._labels.values()) label.dispose();
    for (const badge     of this._evalBadges.values()) badge.dispose();

    this._nodes.clear();
    this._edges.clear();
    this._labels.clear();
    this._evalBadges.clear();
    this._visited.clear();

    this._exprStrip?.dispose();
    this._traversalLabel?.dispose();

    this._activeNode    = null;
    this._activeEdge    = null;
    this._exprStrip     = null;
    this._traversalLabel = null;
    this._exprText      = '';
  }
}


export default ExpressionTree;