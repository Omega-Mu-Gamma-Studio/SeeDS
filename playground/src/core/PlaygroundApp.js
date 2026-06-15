// playground/src/core/PlaygroundApp.js

import SceneManager      from "../renderer/SceneManager.js";
import StructureRenderer from "../renderer/StructureRenderer.js";
import PlaygroundState   from "../state/PlaygroundState.js";
import { evaluate }      from "../state/DependencyEngine.js";
import BrickPanel        from "../ui/BrickPanel.js";
import BuildCanvas       from "../ui/BuildCanvas.js";
import CodePanel         from "../ui/CodePanel.js";
import HoverCard         from "../ui/HoverCard.js";
import ThemeEngine        from "./ThemeEngine.js";
import ThemePicker        from "../ui/ThemePicker.js";

const DEFAULT_DS = "linked_list";

async function init() {
  // 1. Three.js scene
  const canvas   = document.getElementById("pg-canvas");
  const sceneMgr = new SceneManager(canvas);
  sceneMgr.start();

  // ── Theme system ────────────────────────────────────────────────────────
  const themeEngine = new ThemeEngine();
  themeEngine.load();                    // restore saved theme from localStorage

  const themePicker = new ThemePicker(themeEngine);
  themePicker.mount();                   // renders the 🎨 button into the DOM

  // 2. Brick data
  let brickDefs = await loadBricks(DEFAULT_DS);

  // 3. State
  const state = new PlaygroundState(DEFAULT_DS, brickDefs);

  // 4. UI
  const hoverCard    = new HoverCard();
  const brickPanel   = new BrickPanel(document.getElementById("brick-panel"), hoverCard);
  const buildCanvas  = new BuildCanvas();
  const codePanel    = new CodePanel(document.getElementById("code-panel"));
  const structRender = new StructureRenderer(sceneMgr.scene, sceneMgr.camera);
  structRender.setDSType(DEFAULT_DS);

  // Apply initial theme colors to Three.js scene
  structRender.applyTheme(themeEngine.getColors());

  // Re-color 3D scene whenever user picks a new theme
  themeEngine.onChange(() => {
    structRender.applyTheme(themeEngine.getColors());
  });

  // 5. Tab switching
  document.querySelectorAll(".work-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".work-tab").forEach(t => t.classList.remove("work-tab--active"));
      document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("tab-pane--active"));
      tab.classList.add("work-tab--active");
      document.getElementById(`tab-${tab.dataset.tab}`).classList.add("tab-pane--active");
    });
  });

  // 6. Reset button
  document.getElementById("reset-btn").addEventListener("click", () => {
    state.reset();
    structRender.setDSType(state.dsType); // clears 3D scene
    const snap = state.snapshot();
    const deps = evaluate(snap);
    brickPanel.render(snap, deps);
    buildCanvas.render(snap, deps);
    codePanel.render(snap);
  });

  // 7. Initial render
  const snap = state.snapshot();
  const deps = evaluate(snap);
  brickPanel.render(snap, deps);
  buildCanvas.render(snap, deps);
  codePanel.render(snap);

  // 8. Brick placed (fired by BuildCanvas on drop)
  document.addEventListener("brick:placed", (e) => {
    const { brickId } = e.detail;
    const newSnap = state.placeBrick(brickId);
    const newDeps = evaluate(newSnap);

    brickPanel.render(newSnap, newDeps);
    buildCanvas.render(newSnap, newDeps);
    codePanel.render(newSnap);

    const brick = brickDefs.find(b => b.id === brickId);
    if (brick) structRender.handleEvent(brick.scene_event, newSnap);

    // Auto-scroll build canvas to bottom so new brick is visible
    const bc = document.getElementById("build-canvas");
    bc.scrollTop = bc.scrollHeight;
  });

  // 9. DS switching
  document.addEventListener("ds:changed", async (e) => {
    const { dsType } = e.detail;
    brickDefs = await loadBricks(dsType);
    state.reset();
    state.dsType    = dsType;
    state.brickDefs = brickDefs;
    structRender.setDSType(dsType);
    const freshSnap = state.snapshot();
    const freshDeps = evaluate(freshSnap);
    brickPanel.render(freshSnap, freshDeps);
    buildCanvas.render(freshSnap, freshDeps);
    codePanel.render(freshSnap);
  });
}

async function loadBricks(dsType) {
  const filename = dsType.replace(/_/g, "-");
  const res = await fetch(`/playground/bricks/${filename}.json`);
  if (!res.ok) throw new Error(`Could not load bricks/${filename}.json`);
  const json = await res.json();
  return json.bricks;
}

init().catch(err => console.error("PlaygroundApp init failed:", err));
