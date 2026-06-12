// playground/src/ui/HoverCard.js
// ─────────────────────────────────────────────────────────────────────────────
// Singleton popup card. Appears when the student hovers over a brick button.
// Shows four layers of information:
//   1. Function name (hc__title)
//   2. Plain-English explanation (hc__body)
//   3. C code preview (hc__code pre)
//   4. Dependencies + scene impact (hc__deps, hc__scene)
//
// Positioned via JS relative to the hovered brick element.
// Visibility toggled via the .hover-card--visible CSS class.
//
// Read spec Section 05 before implementing.
// ─────────────────────────────────────────────────────────────────────────────

class HoverCard {
  constructor() {
    this.el = document.getElementById("hover-card");
  }

  /**
   * Populate and show the card near the anchor element.
   *
   * @param {Object} brick       - brick definition object from JSON
   * @param {HTMLElement} anchorEl - the brick button being hovered
   * @param {string} brickState  - BRICK_STATES value from DependencyEngine
   */
  show(brick, anchorEl, brickState) {
    // TODO:
    // 1. Set hc__title text to brick.label
    // 2. Set hc__body text to brick.plain_english
    // 3. Set hc__code pre text to brick.code_snippet.join("\n")
    // 4. Set hc__deps:
    //    - If no deps → "No dependencies — can be placed first."
    //    - Else → "Needs: " + brick.depends_on.join(", ")
    //    - Add .hc__deps--warning class if brickState === "locked"
    // 5. Set hc__scene text to brick.scene_description
    // 6. Position card: getBoundingClientRect() on anchorEl,
    //    place card to the right (rect.right + 12px)
    // 7. Add .hover-card--visible class
  }

  /**
   * Hide the hover card.
   */
  hide() {
    this.el.classList.remove("hover-card--visible");
  }
}

export default HoverCard;
