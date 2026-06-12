// playground/src/ui/BuildCanvas.js
// ─────────────────────────────────────────────────────────────────────────────
// The Build tab's drag-and-drop chain canvas.
//
// The brick library (left panel) sets draggable="true" on each brick button
// and stores the brickId in the drag event. When dropped here, the brick
// appends to the chain and fires "brick:placed".
//
// The chain itself is just a visual representation of PlaygroundState.placed[].
// Connectors draw automatically between adjacent bricks.
// No ordering enforcement here — errors show in the Code tab.
// ─────────────────────────────────────────────────────────────────────────────

import { BRICK_STATES } from "../state/DependencyEngine.js";

class BuildCanvas {
  constructor() {
    this.chainList       = document.getElementById("chain-list");
    this.dropZone        = document.getElementById("drop-zone");
    this.dropConnector   = document.getElementById("drop-zone-connector");

    this._bindDropZone();
  }

  // ── Public ─────────────────────────────────────────────────────────────────

  // Called by PlaygroundApp after every state change.
  render(snapshot, deps) {
    this.chainList.innerHTML = "";

    if (snapshot.placed.length === 0) {
      this.dropConnector.classList.remove("visible");
      this.dropZone.querySelector(".drop-zone__hint").textContent = "drag a brick here";
      return;
    }

    snapshot.placed.forEach((brickId, idx) => {
      const brick      = snapshot.bricks.find(b => b.id === brickId);
      if (!brick) return;

      const state      = deps.get(brickId);
      const hasError   = this._hasOrderError(snapshot, brickId);

      // Connector above this brick (not for the first one)
      if (idx > 0) {
        const conn = document.createElement("div");
        conn.className = "chain-connector" + (hasError ? " chain-connector--error" : "");
        this.chainList.appendChild(conn);
      }

      // The brick block itself
      const block = document.createElement("div");
      block.className = "chain-brick" + (hasError ? " chain-brick--error" : "");
      block.textContent = brick.label;
      block.dataset.brickId = brickId;

      // Tooltip on hover showing what went wrong
      if (hasError) {
        const missing = brick.depends_on.filter(dep => {
          const depIdx = snapshot.placed.indexOf(dep);
          return depIdx === -1 || depIdx >= snapshot.placed.indexOf(brickId);
        });
        const missingLabels = missing.map(id => {
          const b = snapshot.bricks.find(x => x.id === id);
          return b ? b.label : id;
        });
        block.title = `⚠ Needs: ${missingLabels.join(", ")} — place those first`;
      }

      this.chainList.appendChild(block);
    });

    // Show connector between last chain brick and drop zone
    this.dropConnector.classList.add("visible");
    this.dropZone.querySelector(".drop-zone__hint").textContent = "drop next brick";
  }

  // ── Private ────────────────────────────────────────────────────────────────

  _hasOrderError(snapshot, brickId) {
    const brick   = snapshot.bricks.find(b => b.id === brickId);
    if (!brick || brick.depends_on.length === 0) return false;
    const thisIdx = snapshot.placed.indexOf(brickId);
    return brick.depends_on.some(dep => {
      const depIdx = snapshot.placed.indexOf(dep);
      return depIdx === -1 || depIdx >= thisIdx;
    });
  }

  _bindDropZone() {
    // The entire build canvas is a drop target, not just the drop-zone div.
    // This way the user can drop anywhere in the panel.
    const canvas = document.getElementById("build-canvas");

    canvas.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
      this.dropZone.classList.add("drag-over");
    });

    canvas.addEventListener("dragleave", (e) => {
      // Only remove if leaving the canvas entirely
      if (!canvas.contains(e.relatedTarget)) {
        this.dropZone.classList.remove("drag-over");
      }
    });

    canvas.addEventListener("drop", (e) => {
      e.preventDefault();
      this.dropZone.classList.remove("drag-over");

      const brickId = e.dataTransfer.getData("text/plain");
      if (!brickId) return;

      document.dispatchEvent(new CustomEvent("brick:placed", {
        detail: { brickId }
      }));
    });
  }
}

export default BuildCanvas;
