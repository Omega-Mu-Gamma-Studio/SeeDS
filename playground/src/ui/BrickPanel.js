// playground/src/ui/BrickPanel.js
// ─────────────────────────────────────────────────────────────────────────────
// The 20% left panel. Renders:
//   1. DS selector buttons at the top (#ds-selector)
//   2. The brick list below (#brick-list)
//
// Emits two custom DOM events that PlaygroundApp.js listens to:
//   "brick:placed"  — detail: { brickId }
//   "ds:changed"    — detail: { dsType }
//
// Reads from: PlaygroundState snapshot + DependencyEngine Map.
// Does NOT talk directly to CodePanel or StructureRenderer.
//
// Read spec Section 05 before implementing.
// ─────────────────────────────────────────────────────────────────────────────

import { DS_TYPES, DS_LABELS } from "../core/constants.js";

class BrickPanel {
  /**
   * @param {HTMLElement} containerEl  - the #brick-panel div
   * @param {HoverCard}   hoverCard    - singleton HoverCard instance
   */
  constructor(containerEl, hoverCard) {
    this.container  = containerEl;
    this.hoverCard  = hoverCard;
    this.dsSelector = containerEl.querySelector("#ds-selector");
    this.brickList  = containerEl.querySelector("#brick-list");

    // TODO: render DS selector buttons (one per DS_TYPES entry)
    // Each button: class="ds-btn", click → dispatch "ds:changed" event
    this._renderDSSelector();
  }

  /**
   * Re-renders the brick list based on current state.
   * Called by PlaygroundApp after every brick placement or DS switch.
   *
   * @param {Object}           snapshot - PlaygroundState.snapshot()
   * @param {Map<string, string>} deps  - DependencyEngine.evaluate() result
   */
  render(snapshot, deps) {
    // TODO:
    // Clear this.brickList.
    // For each brick in snapshot.bricks (in order by brick.order):
    //   Create a <button class="brick-btn brick-btn--{state}">
    //   brick-btn--locked   if deps.get(brick.id) === LOCKED
    //   brick-btn--placed   if deps.get(brick.id) === PLACED
    //   (default)           if AVAILABLE
    //
    //   On mouseenter → this.hoverCard.show(brick, btn, deps.get(brick.id))
    //   On mouseleave → this.hoverCard.hide()
    //   On click (if not LOCKED and not PLACED) →
    //     document.dispatchEvent(new CustomEvent("brick:placed", { detail: { brickId: brick.id } }))
  }

  _renderDSSelector() {
    // TODO: for each type in DS_TYPES, create a .ds-btn button
    // On click → dispatch "ds:changed" event + set .ds-btn--active class
  }
}

export default BrickPanel;
