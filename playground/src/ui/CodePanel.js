// playground/src/ui/CodePanel.js
// ─────────────────────────────────────────────────────────────────────────────
// The 30% middle panel. Renders the live C code as bricks are placed.
//
// Each placed brick's code_snippet becomes a .code-block div.
// If a brick was placed BEFORE its dependencies, that block gets
// .code-block--error and an inline warning message.
//
// CRITICAL: The dependency check must verify ORDER, not just presence.
//   A brick placed at index 2 that needs a dep at index 3 is an error,
//   even though both are in the placed array.
//
// Read spec Section 05 before implementing.
// ─────────────────────────────────────────────────────────────────────────────

class CodePanel {
  /**
   * @param {HTMLElement} containerEl - the #code-panel div
   */
  constructor(containerEl) {
    this.el = containerEl;
  }

  /**
   * Re-renders the entire code panel from the current snapshot.
   * Called by PlaygroundApp after every brick placement or DS switch.
   *
   * @param {Object} snapshot - PlaygroundState.snapshot()
   */
  render(snapshot) {
    this.el.innerHTML = "";

    // TODO: For each brickId in snapshot.placed (in order):
    //   1. Find the brick def from snapshot.bricks.
    //   2. Check if ALL deps were placed BEFORE this brick (index check, not just presence).
    //   3. Create a .code-block div (add .code-block--error if order is wrong).
    //   4. Add .code-block__label with brick.label.
    //   5. If error: add .code-block__error-msg listing the missing/out-of-order deps.
    //   6. Add <pre> with brick.code_snippet.join("\n").
    //   7. Append to this.el.
  }
}

export default CodePanel;
