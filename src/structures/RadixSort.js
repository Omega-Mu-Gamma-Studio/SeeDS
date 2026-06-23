// =============================================================
//  SeeDS — RadixSort.js
//  Radix Sort (LSD) visualiser.
//
//  Unlike bar-chart sorts, Radix works on digits so we show
//  TWO rows:
//    Top row    — the current array as a bar chart (same as SortRace)
//    Bottom row — 10 labelled "buckets" (0-9) that fill / drain
//                 as digits are distributed and collected.
//
//  JSON shape:
//  {
//    "type": "radix_sort",
//    "initialValues": [170, 45, 75, 90, 802, 24, 2, 66],
//    "steps": [
//      { "type": "digit_pass", "digit": 1, "place": "ones" },
//      { "type": "distribute", "value": 170, "bucket": 0, "valueIdx": 0, "state": [...] },
//      { "type": "collect",    "bucket": 0, "state": [...] },
//      { "type": "sorted",     "i": 0, "state": [...] },
//      { "type": "done",       "state": [...] }
//    ]
//  }
//
//  Step types:
//    digit_pass  → { digit, place }      new pass over a digit position
//    distribute  → { value, bucket, valueIdx, state }   move element to bucket
//    collect     → { bucket, state }     drain one bucket back to array
//    sorted      → { i, state }          mark position as finally sorted
//    done        → { state }
// =============================================================

import * as THREE from '../../vendor/three/three.module.js';
import { LAYOUT, VISUAL } from '../core/constants.js';
import LabelSprite from '../renderer/LabelSprite.js';


const BUCKET_COUNT   = 10;
const BUCKET_W       = 1.4;
const BUCKET_H_SLOT  = 0.7;   // height per item slot inside bucket
const BUCKET_GAP     = 0.25;
const BUCKET_ROW_Y   = -4.5;  // y of bucket label row
const ARRAY_ROW_Y    = 0;     // bars sit at y = 0 baseline

// Distinct accent colour for the "active bucket" walls
const BUCKET_ACTIVE_COLOR  = 0x5da8ff;
const BUCKET_DEFAULT_COLOR = 0x2a2a3a;
const ITEM_COLOR           = 0xffc44d;   // amber — items sitting in buckets


class RadixSort {
  constructor(scene, camera) {
    this._scene  = scene;
    this._camera = camera;

    this._bars          = [];    // top-row bar meshes
    this._barLabels     = [];    // value labels under each bar
    this._bucketWalls   = [];    // 10 bucket box outlines (LineSegments)
    this._bucketLabels  = [];    // 10 digit labels (0-9)
    this._bucketItems   = [];    // 10 arrays of small item meshes per bucket
    this._passLabel     = null;  // "Pass: ones / tens / hundreds" sprite
    this._labels        = [];    // all LabelSprites for dispose
    this._data          = null;
    this._maxV          = 1;
    this._n             = 0;
    this._barStep       = LAYOUT.BAR_WIDTH + LAYOUT.BAR_GAP;

    this.operations     = [];
  }


  // -----------------------------------------------------------
  //  Build
  // -----------------------------------------------------------
  build(data) {
    this._data = data;
    const vals = data.initialValues;
    this._n    = vals.length;
    this._maxV = Math.max(...vals);

    this._buildBars(vals);
    this._buildBuckets();

    // Pass label — above the bars
    this._passLabel = LabelSprite.create('Radix Sort  O(nk)', this._scene);
    this._passLabel.setPosition(0, LAYOUT.SORT_BAR_MAX_HEIGHT + 1.4, 0);
    this._labels.push(this._passLabel);

    // Title below everything
    const title = LabelSprite.create('Radix Sort (LSD)  O(nk)', this._scene);
    title.setPosition(0, BUCKET_ROW_Y - 1.6, 0);
    this._labels.push(title);

    this.operations = data.steps.map((s, idx) => ({ ...s, _idx: idx }));
    data.operations = this.operations;
  }


  // -----------------------------------------------------------
  //  Build bar-chart row
  // -----------------------------------------------------------
  _buildBars(vals) {
    const totalW = this._n * this._barStep - LAYOUT.BAR_GAP;
    const startX = -totalW / 2 + LAYOUT.BAR_WIDTH / 2;

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
      mesh.position.set(startX + i * this._barStep, ARRAY_ROW_Y + h / 2, 0);
      mesh.castShadow = true;
      this._scene.add(mesh);
      this._bars.push(mesh);

      const lbl = LabelSprite.create(`${vals[i]}`, this._scene);
      lbl.setPosition(startX + i * this._barStep, ARRAY_ROW_Y - 1.0, 0);
      this._barLabels.push(lbl);
      this._labels.push(lbl);
    }
  }


  // -----------------------------------------------------------
  //  Build 10 bucket outlines
  // -----------------------------------------------------------
  _buildBuckets() {
    const totalBW = BUCKET_COUNT * (BUCKET_W + BUCKET_GAP) - BUCKET_GAP;
    const startX  = -totalBW / 2 + BUCKET_W / 2;

    for (let b = 0; b < BUCKET_COUNT; b++) {
      const cx = startX + b * (BUCKET_W + BUCKET_GAP);

      // Bucket outline (LineSegments box)
      const pts = [
        // bottom
        -BUCKET_W/2, 0, 0,   BUCKET_W/2, 0, 0,
        BUCKET_W/2,  0, 0,   BUCKET_W/2, BUCKET_H_SLOT * this._n, 0,
        BUCKET_W/2,  BUCKET_H_SLOT * this._n, 0,  -BUCKET_W/2, BUCKET_H_SLOT * this._n, 0,
        -BUCKET_W/2, BUCKET_H_SLOT * this._n, 0,  -BUCKET_W/2, 0, 0,
      ];
      const geo  = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
      const mat  = new THREE.LineBasicMaterial({ color: BUCKET_DEFAULT_COLOR });
      const wall = new THREE.LineSegments(geo, mat);
      wall.position.set(cx, BUCKET_ROW_Y, 0);
      this._scene.add(wall);
      this._bucketWalls.push(wall);
      this._bucketItems.push([]);

      // Digit label
      const lbl = LabelSprite.create(`${b}`, this._scene);
      lbl.setPosition(cx, BUCKET_ROW_Y - 0.8, 0);
      this._bucketLabels.push(lbl);
      this._labels.push(lbl);
    }
  }


  // -----------------------------------------------------------
  //  Execute
  // -----------------------------------------------------------
  execute(op) {
    // Reset non-sorted bars
    this._bars.forEach(b => {
      if (!b.userData.sorted) {
        b.material.color.setHex(VISUAL.BAR_COLOR_DEFAULT);
        b.material.emissiveIntensity = 0.2;
      }
    });

    switch (op.type) {

      case 'digit_pass':
        // Update the pass label and reset bucket highlight
        if (this._passLabel) {
          this._passLabel.dispose();
          this._passLabel = LabelSprite.create(`Pass: ${op.place}  (digit ${op.digit})`, this._scene);
          this._passLabel.setPosition(0, LAYOUT.SORT_BAR_MAX_HEIGHT + 1.4, 0);
          this._labels.push(this._passLabel);
        }
        // Clear all buckets visually
        this._bucketWalls.forEach(w => w.material.color.setHex(BUCKET_DEFAULT_COLOR));
        this._clearAllBucketItems();
        break;

      case 'distribute': {
        // Highlight the bar being moved
        if (op.valueIdx !== undefined) {
          this._tintBar(op.valueIdx, ITEM_COLOR, 0.8);
        }
        // Update array state
        if (op.state) this._rebuildBars(op.state);
        // Add item chip to bucket
        const bucket = op.bucket;
        this._bucketWalls[bucket].material.color.setHex(BUCKET_ACTIVE_COLOR);
        this._addBucketItem(bucket, op.value);
        break;
      }

      case 'collect': {
        // Drain bucket — remove its chips
        const b = op.collect_bucket ?? op.bucket;
        this._bucketWalls[b].material.color.setHex(BUCKET_DEFAULT_COLOR);
        this._clearBucketItems(b);
        if (op.state) this._rebuildBars(op.state);
        break;
      }

      case 'sorted':
        if (op.state) this._rebuildBars(op.state);
        if (op.i !== undefined) {
          this._tintBar(op.i, VISUAL.BAR_COLOR_SORTED, 0.7);
          this._bars[op.i].userData.sorted = true;
        }
        break;

      case 'done':
        if (op.state) this._rebuildBars(op.state);
        this._clearAllBucketItems();
        this._bars.forEach(b => {
          b.material.color.setHex(VISUAL.BAR_COLOR_SORTED);
          b.material.emissiveIntensity = 0.6;
          b.userData.sorted = true;
        });
        if (this._passLabel) {
          this._passLabel.dispose();
          this._passLabel = LabelSprite.create('Sorted!', this._scene);
          this._passLabel.setPosition(0, LAYOUT.SORT_BAR_MAX_HEIGHT + 1.4, 0);
          this._labels.push(this._passLabel);
        }
        break;
    }
  }


  // -----------------------------------------------------------
  //  Bucket item helpers
  // -----------------------------------------------------------
  _addBucketItem(bucketIdx, value) {
    const items  = this._bucketItems[bucketIdx];
    const wall   = this._bucketWalls[bucketIdx];
    const slotY  = BUCKET_ROW_Y + items.length * BUCKET_H_SLOT + BUCKET_H_SLOT / 2;
    const geo    = new THREE.BoxGeometry(BUCKET_W * 0.8, BUCKET_H_SLOT * 0.7, 0.1);
    const mat    = new THREE.MeshStandardMaterial({
      color:             ITEM_COLOR,
      emissive:          0x7a5200,
      emissiveIntensity: 0.4,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(wall.position.x, slotY, 0.1);
    this._scene.add(mesh);
    items.push(mesh);
  }

  _clearBucketItems(bucketIdx) {
    for (const m of this._bucketItems[bucketIdx]) {
      m.geometry.dispose();
      m.material.dispose();
      this._scene.remove(m);
    }
    this._bucketItems[bucketIdx] = [];
  }

  _clearAllBucketItems() {
    for (let b = 0; b < BUCKET_COUNT; b++) this._clearBucketItems(b);
  }


  // -----------------------------------------------------------
  //  Bar helpers
  // -----------------------------------------------------------
  _tintBar(i, hex, emissive) {
    if (!this._bars[i]) return;
    this._bars[i].material.color.setHex(hex);
    this._bars[i].material.emissiveIntensity = emissive;
  }

  _rebuildBars(state) {
    const totalW = this._n * this._barStep - LAYOUT.BAR_GAP;
    const startX = -totalW / 2 + LAYOUT.BAR_WIDTH / 2;
    state.forEach((val, i) => {
      if (!this._bars[i]) return;
      const h = (val / this._maxV) * LAYOUT.SORT_BAR_MAX_HEIGHT;
      this._bars[i].geometry.dispose();
      this._bars[i].geometry = new THREE.BoxGeometry(LAYOUT.BAR_WIDTH, h, LAYOUT.BAR_WIDTH);
      this._bars[i].position.y = ARRAY_ROW_Y + h / 2;
    });
  }


  // -----------------------------------------------------------
  //  Tick
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
    for (const b of this._bars) { b.geometry.dispose(); b.material.dispose(); this._scene.remove(b); }
    for (const w of this._bucketWalls) { w.geometry.dispose(); w.material.dispose(); this._scene.remove(w); }
    this._clearAllBucketItems();
    for (const l of this._labels) l.dispose();
    for (const l of this._bucketLabels) l.dispose();
    this._bars        = [];
    this._barLabels   = [];
    this._bucketWalls = [];
    this._labels      = [];
  }
}


export default RadixSort;
