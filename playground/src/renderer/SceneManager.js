// playground/src/renderer/SceneManager.js
// ─────────────────────────────────────────────────────────────────────────────
// Sets up the Three.js scene, camera, lights, and render loop for the 50% panel.
// Written fresh for playground — only shares vendor/three with standard mode.
//
// Reference the existing src/renderer/ files for style guidance, but do NOT
// import from them. Keep playground self-contained.
//
// THREE.js import path — 3 levels up to repo root, then into vendor:
//   "../../../vendor/three/three.module.js"
// ─────────────────────────────────────────────────────────────────────────────

import * as THREE from "../../../vendor/three/three.module.js";

class SceneManager {
  /**
   * @param {HTMLCanvasElement} canvas - the #pg-canvas element
   */
  constructor(canvas) {
    // TODO: store canvas ref
    // TODO: create THREE.WebGLRenderer, THREE.Scene, THREE.PerspectiveCamera
    // TODO: set up ambient + directional lights
    // TODO: set up OrbitControls if desired (import from vendor/three/jsm/)
    // TODO: handle window resize
  }

  /**
   * Starts the animation loop.
   */
  start() {
    // TODO: requestAnimationFrame loop → renderer.render(scene, camera)
  }

  /**
   * Stops the animation loop.
   */
  stop() {
    // TODO: cancel animation frame
  }
}

export default SceneManager;
