// playground/src/structures/HashTable.js
// Incremental Three.js renderer for Hash Table — Phase 3c

import * as THREE from "../../../vendor/three/three.module.js";

const BUCKET_COUNT = 7;
const BUCKET_W     = 1.8;
const BUCKET_H     = 0.75;
const BUCKET_D     = 0.6;
const START_Y      = 2.4;
const STEP_Y       = -(BUCKET_H + 0.15);
const LEFT_X       = -1.0;
let   FILL_COL = 0x4f8ef7;
let   EMPTY_COL = 0x2a2a3a;
let   HIT_COL = 0x2d9e6b;
let   CHAIN_COL = 0xf59e0b;
let   ERROR_COL = 0xff3333;

class HashTableRenderer {
  constructor() {
    this.meshes      = [];
    this.bucketMeshes= [];
    this.chainNodes  = []; // per-bucket arrays of fill meshes
    this._animReqs   = [];
  }

  handleEvent(event, snapshot, scene, camera) {
    switch (event) {
      case "hash_node_struct_defined":  this._onHashNodeStruct(scene); break;
      case "hash_table_struct_defined": this._onTableStruct(scene);    break;
      case "create_table_defined":      this._onCreateTable(scene);    break;
      case "hash_defined":              this._onHash(scene);           break;
      case "insert_defined":            this._onInsert(scene);         break;
      case "search_defined":            this._onSearch(scene);         break;
      case "delete_defined":            this._onDelete(scene);         break;
      case "display_defined":           this._onDisplay(scene);        break;
      default: console.warn(`HashTableRenderer: unknown event "${event}"`);
    }
  }

  setColors(p) {
    FILL_COL  = p.node;
    EMPTY_COL = p.boxEmpty;
    HIT_COL   = p.nodeHit;
    CHAIN_COL = p.edgeAlt;
    ERROR_COL = p.nodeError;
  }

  clear(scene) {
    this._animReqs.forEach(id=>{cancelAnimationFrame(id);clearTimeout(id);});
    this._animReqs=[];
    this.meshes.forEach(m=>scene.remove(m));
    this.meshes=[]; this.bucketMeshes=[]; this.chainNodes=[];
  }

  _bucketY(i) { return START_Y + i * STEP_Y; }

  _onHashNodeStruct(scene) {
    // Placeholder column outline
    const ph = this._makeBoxWire(LEFT_X, 0, 0, BUCKET_W, BUCKET_COUNT*(BUCKET_H+0.15)+0.2, BUCKET_D, 0x1a1a2a);
    this._add(scene, ph);
    this._makeLabel(scene, "HashNode", LEFT_X, START_Y + 0.6, 0, 0.16, "#2a2a4a");
  }

  _onTableStruct(scene) {
    // Draw all empty bucket outlines
    for (let i = 0; i < BUCKET_COUNT; i++) {
      const box = this._makeBoxWire(LEFT_X, this._bucketY(i), 0, BUCKET_W, BUCKET_H, BUCKET_D, EMPTY_COL);
      this.bucketMeshes[i] = box;
      this.chainNodes[i]   = [];
      this._add(scene, box);
    }
  }

  _onCreateTable(scene) {
    // Add bucket index labels
    for (let i = 0; i < BUCKET_COUNT; i++) {
      this._makeLabel(scene, `[${i}]`, LEFT_X - BUCKET_W * 0.85, this._bucketY(i), 0, 0.15, "#4a4f6a");
      this._makeLabel(scene, "NULL", LEFT_X + BUCKET_W * 0.6, this._bucketY(i), 0, 0.13, "#2a2a4a");
    }
    this._makeLabel(scene, "size = 7", LEFT_X, START_Y + 1.0, 0, 0.14, "#4f8ef7");
  }

  _onHash(scene) {
    // Animate: key 15 → 15 % 7 = 1
    const key = 15, result = key % BUCKET_COUNT;
    this._makeLabel(scene, `${key} % 7 = ${result}`, LEFT_X + BUCKET_W + 1.2, this._bucketY(result), 0, 0.15, "#f5c518");
    // Flash target bucket
    const bm = this.bucketMeshes[result];
    if (bm) {
      bm.material.color.setHex(0xf5c518);
      const id = setTimeout(() => { if (bm.material) bm.material.color.setHex(EMPTY_COL); }, 1000);
      this._animReqs.push(id);
    }
  }

  _onInsert(scene) {
    // Insert a few demo key:value pairs
    const inserts = [
      { key: 15, val: "A", bucket: 1 },
      { key: 22, val: "B", bucket: 1 }, // collision → chain
      { key:  7, val: "C", bucket: 0 },
      { key: 35, val: "D", bucket: 0 }, // collision
    ];
    inserts.forEach(({ key, val, bucket }, step) => {
      const id = setTimeout(() => {
        const chainIdx = this.chainNodes[bucket].length;
        const offsetX  = LEFT_X + BUCKET_W + 0.2 + chainIdx * 1.5;
        const fill     = this._makeBoxSolid(offsetX, this._bucketY(bucket), 0, BUCKET_W * 0.85, BUCKET_H * 0.85, BUCKET_D * 0.85, chainIdx === 0 ? FILL_COL : CHAIN_COL, 0.9);
        this.chainNodes[bucket].push(fill);
        this._add(scene, fill);
        this._makeLabel(scene, `${key}:${val}`, offsetX, this._bucketY(bucket), 0, 0.14, "#cdd6f4");
        if (chainIdx > 0) {
          const prev = this.chainNodes[bucket][chainIdx - 1];
          this._makeArrow(scene, prev.position.x + BUCKET_W*0.43, this._bucketY(bucket), 0, offsetX - BUCKET_W*0.43, this._bucketY(bucket), 0);
        }
      }, step * 400);
      this._animReqs.push(id);
    });
  }

  _onSearch(scene) {
    // Search key 22 — walk bucket 1's chain
    const bucket = 1;
    this.chainNodes[bucket].forEach((fill, i) => {
      const id = setTimeout(() => {
        const orig = fill.material.color.getHex();
        fill.material.color.setHex(i === 1 ? HIT_COL : 0xf59e0b);
        if (i !== 1) { const id2 = setTimeout(() => { if (fill.material) fill.material.color.setHex(orig); }, 400); this._animReqs.push(id2); }
      }, i * 500);
      this._animReqs.push(id);
    });
    this._makeLabel(scene, "search(22)", LEFT_X + BUCKET_W + 1.2, this._bucketY(bucket) - 0.6, 0, 0.14, "#4fc97e");
  }

  _onDelete(scene) {
    // Delete key 7 from bucket 0
    const bucket = 0;
    const target = this.chainNodes[bucket][0];
    if (target) this._fadeOut(target, 700);
    this._makeLabel(scene, "delete(7)", LEFT_X + BUCKET_W + 0.6, this._bucketY(bucket) - 0.6, 0, 0.14, "#ff6b6b");
  }

  _onDisplay(scene) {
    for (let i = 0; i < BUCKET_COUNT; i++) {
      const bucket = i;
      const bm = this.bucketMeshes[bucket];
      if (!bm) continue;
      const id = setTimeout(() => {
        bm.material.color.setHex(FILL_COL);
        const id2 = setTimeout(() => { if (bm.material) bm.material.color.setHex(EMPTY_COL); }, 450);
        this._animReqs.push(id2);
      }, i * 300);
      this._animReqs.push(id);
    }
  }

  _makeBoxWire(x,y,z,w,h,d,color){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshBasicMaterial({color,wireframe:true}));m.position.set(x,y,z);return m;}
  _makeBoxSolid(x,y,z,w,h,d,color,opacity=1){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color,transparent:opacity<1,opacity}));m.position.set(x,y,z);return m;}
  _makeArrow(scene,x1,y1,z1,x2,y2,z2){const dir=new THREE.Vector3(x2-x1,y2-y1,z2-z1);const len=dir.length();dir.normalize();const a=new THREE.ArrowHelper(dir,new THREE.Vector3(x1,y1,z1),len,FILL_COL,0.18,0.1);this._add(scene,a);return a;}
  _add(scene,obj){scene.add(obj);this.meshes.push(obj);return obj;}
  _makeLabel(scene,text,x,y,z,size,color){const canvas=document.createElement("canvas");canvas.width=256;canvas.height=64;const ctx=canvas.getContext("2d");ctx.clearRect(0,0,256,64);ctx.fillStyle=color;ctx.font="bold 24px 'Space Mono', monospace";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(text,128,32);const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(canvas),transparent:true}));sprite.position.set(x,y,z);sprite.scale.set(size*9,size*2.2,1);this._add(scene,sprite);return sprite;}
  _fadeOut(mesh,duration){if(!mesh?.material)return;mesh.material.transparent=true;const start=performance.now(),startOp=mesh.material.opacity;const tick=(now)=>{const t=Math.min((now-start)/duration,1);if(mesh.material)mesh.material.opacity=startOp*(1-t);if(t<1){const id=requestAnimationFrame(tick);this._animReqs.push(id);}else if(mesh.parent){mesh.parent.remove(mesh);this.meshes=this.meshes.filter(m=>m!==mesh);}};this._animReqs.push(requestAnimationFrame(tick));}
}

export default HashTableRenderer;
