// playground/src/ui/BrickPanel.js
// ─────────────────────────────────────────────────────────────────────────────
// The 20% left palette. Renders DS selector + draggable brick buttons.
// Bricks are now DRAGGED to the Build canvas — not clicked to place.
// Placed bricks still show a checkmark so the user knows what's been used.
// Locked bricks are dimmed and not draggable.
// ─────────────────────────────────────────────────────────────────────────────

import { DS_TYPES, DS_LABELS } from "../core/constants.js";
import { BRICK_STATES }        from "../state/DependencyEngine.js";

class BrickPanel {
  constructor(containerEl, hoverCard) {
    this.container    = containerEl;
    this.hoverCard    = hoverCard;
    this.dsSelector   = containerEl.querySelector("#ds-selector");
    this.brickList    = containerEl.querySelector("#brick-list");
    this.activeDsType = "linked_list";

    this._renderDSSelector();
  }

  render(snapshot, deps) {
    this.brickList.innerHTML = "";

    const sorted = [...snapshot.bricks].sort((a, b) => a.order - b.order);

    for (const brick of sorted) {
      const state = deps.get(brick.id) || BRICK_STATES.AVAILABLE;

      const btn = document.createElement("div");
      btn.className = "brick-btn";
      btn.textContent = brick.label;

      if (state === BRICK_STATES.PLACED) {
        btn.classList.add("brick-btn--placed");
        btn.draggable = false;
      } else if (state === BRICK_STATES.LOCKED) {
        btn.classList.add("brick-btn--locked");
        btn.draggable = false;
        btn.title = "Place dependencies first";
      } else {
        // AVAILABLE — draggable
        btn.draggable = true;
        btn.addEventListener("dragstart", (e) => {
          e.dataTransfer.setData("text/plain", brick.id);
          e.dataTransfer.effectAllowed = "copy";
          btn.classList.add("brick-btn--dragging");
        });
        btn.addEventListener("dragend", () => {
          btn.classList.remove("brick-btn--dragging");
        });
      }

      btn.addEventListener("mouseenter", () => this.hoverCard.show(brick, btn, state));
      btn.addEventListener("mouseleave", () => this.hoverCard.hide());

      this.brickList.appendChild(btn);
    }
  }

  _renderDSSelector() {
    this.dsSelector.innerHTML = "";
    for (const type of DS_TYPES) {
      const btn = document.createElement("button");
      btn.className = "ds-btn";
      btn.type = "button";
      btn.textContent = DS_LABELS[type];
      if (type === this.activeDsType) btn.classList.add("ds-btn--active");

      btn.addEventListener("click", () => {
        this.activeDsType = type;
        this.dsSelector.querySelectorAll(".ds-btn")
          .forEach(b => b.classList.remove("ds-btn--active"));
        btn.classList.add("ds-btn--active");
        document.dispatchEvent(new CustomEvent("ds:changed", { detail: { dsType: type } }));
      });

      this.dsSelector.appendChild(btn);
    }
  }
}

export default BrickPanel;
