// playground/src/core/PlaygroundApp.js
// ─────────────────────────────────────────────────────────────────────────────
// Main controller. Runs when playground/index.html loads.
// Boots Three.js scene, loads brick JSON, wires all components together.
// Think of it as the conductor — it doesn't play instruments, it cues everyone.
//
// Read spec Section 08 before implementing.
// ─────────────────────────────────────────────────────────────────────────────

import SceneManager     from "../renderer/SceneManager.js";
import StructureRenderer from "../renderer/StructureRenderer.js";
import PlaygroundState  from "../state/PlaygroundState.js";
import { evaluate }     from "../state/DependencyEngine.js";
import BrickPanel       from "../ui/BrickPanel.js";
import CodePanel        from "../ui/CodePanel.js";
import HoverCard        from "../ui/HoverCard.js";

const DEFAULT_DS = "linked_list";

async function init() {
  // TODO Step 1 — Boot the Three.js scene via SceneManager.
  // TODO Step 2 — Load default brick JSON via loadBricks(DEFAULT_DS).
  // TODO Step 3 — Instantiate PlaygroundState with dsType + brickDefs.
  // TODO Step 4 — Instantiate HoverCard, BrickPanel, CodePanel, StructureRenderer.
  // TODO Step 5 — Render initial (empty) state snapshot.
  // TODO Step 6 — Wire "brick:placed" custom event → state → all three panels.
  // TODO Step 7 — Wire "ds:changed" custom event → reload bricks → reset state → re-render.
}

async function loadBricks(dsType) {
  // TODO: fetch `../../bricks/${dsType.replace("_", "-")}.json`
  // Return json.bricks array.
}

init();
