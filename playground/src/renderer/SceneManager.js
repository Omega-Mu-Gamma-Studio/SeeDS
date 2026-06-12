// playground/src/renderer/SceneManager.js

import * as THREE from "../../../vendor/three/three.module.js";
import { OrbitControls } from "../../../vendor/three/jsm/controls/OrbitControls.js";

class SceneManager {
  constructor(canvas) {
    this.canvas = canvas;
    this._rafId = null;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(0x0f0f13, 1);
    this._resize();

    // Scene
    this.scene = new THREE.Scene();

    // Camera
    this.camera = new THREE.PerspectiveCamera(50, this._aspect(), 0.1, 1000);
    this.camera.position.set(0, 2, 14);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight.position.set(5, 10, 7);
    this.scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0x5b8ff7, 0.3);
    fillLight.position.set(-5, -3, -5);
    this.scene.add(fillLight);

    // OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping  = true;
    this.controls.dampingFactor  = 0.08;
    this.controls.minDistance    = 3;
    this.controls.maxDistance    = 60;

    // Resize handler
    window.addEventListener("resize", () => this._resize());
  }

  start() {
    const loop = () => {
      this._rafId = requestAnimationFrame(loop);
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
    };
    loop();
  }

  stop() {
    if (this._rafId) cancelAnimationFrame(this._rafId);
  }

  _aspect() {
    return this.canvas.clientWidth / this.canvas.clientHeight || 1;
  }

  _resize() {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    this.renderer.setSize(w, h, false);
    if (this.camera) {
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
    }
  }
}

export default SceneManager;
