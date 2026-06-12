// playground/src/state/PlaygroundState.js
// ─────────────────────────────────────────────────────────────────────────────
// The brain of Playground Mode. Tracks which bricks have been placed,
// in what order, and which errors are active.
//
// GOLDEN RULE: This is the single source of truth.
// CodePanel and StructureRenderer both read from snapshot() — never from each
// other and never from the DOM.
//
// Read spec Section 05 before implementing.
// ─────────────────────────────────────────────────────────────────────────────

class PlaygroundState {
  /**
   * @param {string} dsType     - e.g. "linked_list"
   * @param {Array}  brickDefs  - array loaded from the brick JSON file
   */
  constructor(dsType, brickDefs) {
    // TODO:
    // this.dsType    = dsType;
    // this.brickDefs = brickDefs;
    // this.placed    = [];         // brick IDs in placement order
    // this.errors    = new Set();  // active error type strings
  }

  /**
   * Call this when a brick is dropped/clicked.
   * Checks dependencies — if unmet, still places it but marks an error.
   * Returns a state snapshot for all listeners to consume.
   *
   * @param  {string} brickId
   * @returns {Object} snapshot
   */
  placeBrick(brickId) {
    // TODO:
    // 1. Find brick def by id.
    // 2. Check depends_on — if any dep missing from this.placed, add error.
    // 3. Push brickId to this.placed regardless (wrong order = show error, not block).
    // 4. Return this.snapshot().
  }

  /**
   * Returns a plain object snapshot of current state.
   * CodePanel and StructureRenderer read this — never the class directly.
   *
   * @returns {{ dsType, placed, errors, bricks }}
   */
  snapshot() {
    // TODO: return { dsType, placed: [...this.placed], errors: [...this.errors], bricks: this.brickDefs }
  }

  /**
   * Resets placed bricks and errors. Called when the user switches DS type.
   */
  reset() {
    // TODO: this.placed = []; this.errors = new Set();
  }
}

export default PlaygroundState;
