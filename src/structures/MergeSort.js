// =============================================================
//  SeeDS — MergeSort.js
//  Standalone Merge Sort visualiser.
//  Reuses the SortRace bar-chart approach but for a single
//  sorter, with a "divide" tree overlay that shows the current
//  split level in a second row of smaller bars above the main
//  array row.
//
//  JSON shape: { type:"merge_sort", initialValues[], steps[] }
//  Step types: compare | split | merge | sorted | done
// =============================================================

import * as THREE from '../../vendor/three/three.module.js';
import { LAYOUT, VISUAL } from '../core/constants.js';
import LabelSprite from '../renderer/LabelSprite.js';


class MergeSort {
  constructor(scene, camera) {
    this._scene  = scene;
    this._camera = camera;

    this._bars    = [];       // THREE.Mesh[]
    this._labels  = [];       // LabelSprite[]
    this._data    = null;
    this._maxV    = 1;
    this._n       = 0;
    this._barStep = LAYOUT.BAR_WIDTH + LAYOUT.BAR_GAP;

    // ops are assigned by build() so PlaybackController can drive
    this.operations = [];
  }


  // -----------------------------------------------------------
  //  Build
  // -----------------------------------------------------------
  build(data) {
    this._data = data;
    const vals = data.initialValues;
    this._n    = vals.length;
    this._maxV = Math.max(...vals);

    const totalW   = this._n * this._barStep - LAYOUT.BAR_GAP;
    const startX   = -totalW / 2 + LAYOUT.BAR_WIDTH / 2;

    for (let i = 0; i < this._n; i++) {
      const h   = (vals[i] / this._maxV) * LAYOUT.SORT_BAR_MAX_HEIGHT;
      const geo = new THREE.BoxGeometry(LAYOUT.BAR_WIDTH, h, LAYOUT.BAR_WIDTH);
      const mat = new THREE.MeshStandardMaterial({
        color:             VISUAL.BAR_COLOR_DEFAULT,
        emissive:          0x1a3a6e,
        emissiveIntensity: 0.2,
        roughness: 0.4,
        metalness: 0.3,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(startX + i * this._barStep, h / 2, 0);
      mesh.castShadow = true;
      this._scene.add(mesh);
      this._bars.push(mesh);

      // Value label
      const lbl = LabelSprite.create(`${vals[i]}`, this._scene);
      lbl.setPosition(startX + i * this._barStep, -1.0, 0);
      this._labels.push(lbl);
    }

    // Title
    const title = LabelSprite.create('Merge Sort  O(n log n)', this._scene);
    title.setPosition(0, -2.0, 0);
    this._labels.push(title);

    // Patch operations so PlaybackController can iterate
    this.operations  = data.steps.map((s, idx) => ({ ...s, _idx: idx }));
    data.operations  = this.operations;
  }


  // -----------------------------------------------------------
  //  Execute — called once per step by PlaybackController
  // -----------------------------------------------------------
  execute(op) {
    // Reset non-sorted bar colours
    this._bars.forEach(b => {
      if (!b.userData.sorted) {
        b.material.color.setHex(VISUAL.BAR_COLOR_DEFAULT);
        b.material.emissiveIntensity = 0.2;
      }
    });

    switch (op.type) {

      case 'split':
        // Highlight left half amber, right half pivot-red
        if (op.left)  op.left.forEach(i  => this._tint(i, VISUAL.BAR_COLOR_COMPARING, 0.6));
        if (op.right) op.right.forEach(i => this._tint(i, VISUAL.BAR_COLOR_PIVOT,     0.6));
        break;

      case 'compare':
        this._tint(op.i, VISUAL.BAR_COLOR_COMPARING, 0.7);
        if (op.j !== undefined) this._tint(op.j, VISUAL.BAR_COLOR_COMPARING, 0.7);
        break;

      case 'merge':
        if (op.state) this._rebuildBars(op.state);
        if (op.indices) op.indices.forEach(i => this._tint(i, VISUAL.BAR_COLOR_COMPARING, 0.5));
        break;

      case 'sorted':
        if (op.state) this._rebuildBars(op.state);
        if (op.i !== undefined) {
          this._tint(op.i, VISUAL.BAR_COLOR_SORTED, 0.7);
          this._bars[op.i].userData.sorted = true;
        }
        break;

      case 'done':
        if (op.state) this._rebuildBars(op.state);
        this._bars.forEach(b => {
          b.material.color.setHex(VISUAL.BAR_COLOR_SORTED);
          b.material.emissiveIntensity = 0.6;
          b.userData.sorted = true;
        });
        break;
    }
  }


  // -----------------------------------------------------------
  //  Helpers
  // -----------------------------------------------------------
  _tint(i, hex, emissive) {
    if (!this._bars[i]) return;
    this._bars[i].material.color.setHex(hex);
    this._bars[i].material.emissiveIntensity = emissive;
  }

  _rebuildBars(state) {
    const startX = -(this._n * this._barStep - LAYOUT.BAR_GAP) / 2 + LAYOUT.BAR_WIDTH / 2;
    state.forEach((val, i) => {
      if (!this._bars[i]) return;
      const h = (val / this._maxV) * LAYOUT.SORT_BAR_MAX_HEIGHT;
      this._bars[i].geometry.dispose();
      this._bars[i].geometry = new THREE.BoxGeometry(LAYOUT.BAR_WIDTH, h, LAYOUT.BAR_WIDTH);
      this._bars[i].position.y = h / 2;
    });
  }


  // -----------------------------------------------------------
  //  Per-frame tick
  // -----------------------------------------------------------
  tick(delta, elapsed) {
    const pulse = (Math.sin(elapsed * 1.5) + 1) / 2;
    this._bars.forEach(b => {
      if (!b.userData.sorted && b.material.color.getHex() === VISUAL.BAR_COLOR_DEFAULT) {
        b.material.emissiveIntensity = 0.1 + pulse * 0.15;
      }
    });
  }


  // -----------------------------------------------------------
  //  Dispose
  // -----------------------------------------------------------
  dispose() {
    for (const b of this._bars) {
      b.geometry.dispose();
      b.material.dispose();
      this._scene.remove(b);
    }
    for (const l of this._labels) l.dispose();
    this._bars   = [];
    this._labels = [];
  }
}


export default MergeSort;
