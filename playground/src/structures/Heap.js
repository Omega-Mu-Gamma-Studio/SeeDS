// playground/src/structures/Heap.js
// Incremental Three.js renderer for Min-Heap — Phase 3c

import * as THREE from "../../../vendor/three/three.module.js";

const NODE_R    = 0.48;
let   NODE_COL = 0x4f8ef7;
let   SWAP_COL = 0xf59e0b;
let   MIN_COL = 0x2d9e6b;
let   SIFT_COL = 0xa78bfa;

// Complete binary tree layout for 7 nodes (indices 0-6)
// Index i → left child: 2i+1, right child: 2i+2
const POSITIONS = [
  { x:  0,    y:  3.0  },  // 0 root
  { x: -2.4,  y:  1.2  },  // 1
  { x:  2.4,  y:  1.2  },  // 2
  { x: -3.5,  y: -0.8  },  // 3
  { x: -1.3,  y: -0.8  },  // 4
  { x:  1.3,  y: -0.8  },  // 5
  { x:  3.5,  y: -0.8  },  // 6
];

// Demo heap values inserted in order: 50,30,20,40,10,60,15 → min-heap: 10,30,15,40,50,60,20
const HEAP_VALS = [10, 30, 15, 40, 50, 60, 20];

class HeapRenderer {
  constructor() {
    this.meshes     = [];
    this.nodeMeshes = [];
    this._animReqs  = [];
    this.heapSize   = 0;
  }

  handleEvent(event, snapshot, scene, camera) {
    switch (event) {
      case "struct_defined":       this._onStruct(scene);      break;
      case "init_defined":         this._onInit(scene);        break;
      case "swap_defined":         this._onSwap(scene);        break;
      case "sift_up_defined":      this._onSiftUp(scene);      break;
      case "sift_down_defined":    this._onSiftDown(scene);    break;
      case "insert_defined":       this._onInsert(scene);      break;
      case "extract_min_defined":  this._onExtractMin(scene);  break;
      case "heap_sort_defined":    this._onHeapSort(scene);    break;
      default: console.warn(`HeapRenderer: unknown event "${event}"`);
    }
  }

  setColors(p) {
    NODE_COL = p.node;
    SWAP_COL = p.nodeTraverse;
    MIN_COL  = p.nodePlaced;
    SIFT_COL = p.edgeAlt;
  }

  clear(scene) {
    this._animReqs.forEach(id=>{cancelAnimationFrame(id);clearTimeout(id);});
    this._animReqs=[];
    this.meshes.forEach(m=>scene.remove(m));
    this.meshes=[]; this.nodeMeshes=[]; this.heapSize=0;
  }

  _onStruct(scene) {
    // Show tree skeleton in ghost form
    POSITIONS.forEach((p,i)=>{
      const m=this._sphere(p.x,p.y,0,NODE_R,0x2a2a3a,0.3);
      this.nodeMeshes[i]=m;
      this._add(scene,m);
      // Edge to parent
      if(i>0){const pi=Math.floor((i-1)/2);const pp=POSITIONS[pi];this._line(scene,pp.x,pp.y,0,p.x,p.y,0,0x1a1a2a);}
    });
    this._label(scene,"MinHeap",0,4.0,0,0.17,"#4f8ef7");
    this._label(scene,"arr[]",0,-2.0,0,0.14,"#2a2a4a");
  }

  _onInit(scene) {
    this._label(scene,"size = 0",0,-2.6,0,0.15,"#f5c518");
  }

  _onSwap(scene) {
    // Animate a swap between nodes 0 and 1
    const m0=this.nodeMeshes[0], m1=this.nodeMeshes[1];
    if(!m0||!m1)return;
    const p0={...POSITIONS[0]}, p1={...POSITIONS[1]};
    m0.material.color.setHex(SWAP_COL);
    m1.material.color.setHex(SWAP_COL);
    this._animateTo(m0,p1.x,p1.y,0,500,()=>{if(m0.material)m0.material.color.setHex(NODE_COL);});
    this._animateTo(m1,p0.x,p0.y,0,500,()=>{if(m1.material)m1.material.color.setHex(NODE_COL);});
    this._label(scene,"swap ↕",1.5,2.1,0,0.15,"#f59e0b");
  }

  _onSiftUp(scene) {
    // Highlight path from a leaf bubbling up: 6→2→0
    const path=[6,2,0];
    path.forEach((idx,step)=>{
      const id=setTimeout(()=>{
        const m=this.nodeMeshes[idx];
        if(m){m.material.color.setHex(SIFT_COL);const id2=setTimeout(()=>{if(m.material)m.material.color.setHex(NODE_COL);},500);this._animReqs.push(id2);}
      },step*500);
      this._animReqs.push(id);
    });
    this._label(scene,"sift ↑",2.8,0.2,0,0.15,"#a78bfa");
  }

  _onSiftDown(scene) {
    // Root sifts down: 0→1→3
    const path=[0,1,3];
    path.forEach((idx,step)=>{
      const id=setTimeout(()=>{
        const m=this.nodeMeshes[idx];
        if(m){m.material.color.setHex(SIFT_COL);const id2=setTimeout(()=>{if(m.material)m.material.color.setHex(NODE_COL);},500);this._animReqs.push(id2);}
      },step*500);
      this._animReqs.push(id);
    });
    this._label(scene,"sift ↓",-2.8,0.2,0,0.15,"#a78bfa");
  }

  _onInsert(scene) {
    // Fill in the heap nodes one by one
    HEAP_VALS.forEach((val,idx)=>{
      const id=setTimeout(()=>{
        const p=POSITIONS[idx];
        const old=this.nodeMeshes[idx];
        if(old){old.material.color.setHex(NODE_COL);old.material.opacity=1;}
        const mesh=this._sphere(p.x,p.y+3,0,NODE_R,NODE_COL);
        this.nodeMeshes[idx]=mesh;
        this._add(scene,mesh);
        this._animateTo(mesh,p.x,p.y,0,400,null);
        this._label(scene,String(val),p.x,p.y,0,0.17,"#ffffff");
        if(idx>0){const pi=Math.floor((idx-1)/2);const pp=POSITIONS[pi];this._line(scene,pp.x,pp.y,0,p.x,p.y,0,0x2a3a5a);}
        this.heapSize=idx+1;
      },idx*350);
      this._animReqs.push(id);
    });
    this._label(scene,"insert →",0,-2.0,0,0.15,"#4f8ef7");
  }

  _onExtractMin(scene) {
    // Root (min) fades, last node jumps to root
    const root=this.nodeMeshes[0];
    const last=this.nodeMeshes[this.heapSize-1];
    if(root){
      root.material.color.setHex(MIN_COL);
      const id=setTimeout(()=>this._fadeOut(root,600),300);
      this._animReqs.push(id);
    }
    if(last&&this.heapSize>1){
      const id=setTimeout(()=>{
        this._animateTo(last,POSITIONS[0].x,POSITIONS[0].y,0,500,()=>{if(last.material)last.material.color.setHex(SIFT_COL);});
      },900);
      this._animReqs.push(id);
    }
    this._label(scene,"min removed",0,4.0,0,0.15,"#2d9e6b");
  }

  _onHeapSort(scene) {
    // Flash nodes in sorted (ascending) extraction order
    const sortedIdx=[0,1,2,3,4,5,6]; // simplified — just pulse all
    sortedIdx.forEach((idx,step)=>{
      const id=setTimeout(()=>{
        const m=this.nodeMeshes[idx];
        if(m){m.material.color.setHex(MIN_COL);const id2=setTimeout(()=>{if(m.material)this._fadeOut(m,400);},400);this._animReqs.push(id2);}
      },step*400);
      this._animReqs.push(id);
    });
    this._label(scene,"sorted ↑",0,-2.5,0,0.15,"#4fc97e");
  }

  _sphere(x,y,z,r,color,opacity=1){const m=new THREE.Mesh(new THREE.SphereGeometry(r,32,32),new THREE.MeshStandardMaterial({color,transparent:opacity<1,opacity}));m.position.set(x,y,z);return m;}
  _line(scene,x1,y1,z1,x2,y2,z2,color){const geo=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x1,y1,z1),new THREE.Vector3(x2,y2,z2)]);const line=new THREE.Line(geo,new THREE.LineBasicMaterial({color}));this._add(scene,line);return line;}
  _add(scene,obj){scene.add(obj);this.meshes.push(obj);return obj;}
  _label(scene,text,x,y,z,size,color){const canvas=document.createElement("canvas");canvas.width=256;canvas.height=64;const ctx=canvas.getContext("2d");ctx.clearRect(0,0,256,64);ctx.fillStyle=color;ctx.font="bold 26px 'Space Mono', monospace";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(text,128,32);const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(canvas),transparent:true}));sprite.position.set(x,y,z);sprite.scale.set(size*8,size*2,1);this._add(scene,sprite);return sprite;}
  _fadeOut(mesh,duration){if(!mesh?.material)return;mesh.material.transparent=true;const start=performance.now(),startOp=mesh.material.opacity;const tick=(now)=>{const t=Math.min((now-start)/duration,1);if(mesh.material)mesh.material.opacity=startOp*(1-t);if(t<1){const id=requestAnimationFrame(tick);this._animReqs.push(id);}else if(mesh.parent){mesh.parent.remove(mesh);this.meshes=this.meshes.filter(m=>m!==mesh);}};this._animReqs.push(requestAnimationFrame(tick));}
  _animateTo(mesh,tx,ty,tz,duration,onDone){const sx=mesh.position.x,sy=mesh.position.y,sz=mesh.position.z,start=performance.now();const tick=(now)=>{const t=Math.min((now-start)/duration,1),e=1-Math.pow(1-t,3);mesh.position.set(sx+(tx-sx)*e,sy+(ty-sy)*e,sz+(tz-sz)*e);if(t<1){const id=requestAnimationFrame(tick);this._animReqs.push(id);}else if(onDone)onDone();};this._animReqs.push(requestAnimationFrame(tick));}
}

export default HeapRenderer;
