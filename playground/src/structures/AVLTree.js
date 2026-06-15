// playground/src/structures/AVLTree.js
// Incremental Three.js renderer for AVL Tree — Phase 3c

import * as THREE from "../../../vendor/three/three.module.js";

const NODE_R     = 0.5;
let   NODE_COL = 0x4f8ef7;
let   BAL_OK = 0x2d9e6b;
let   BAL_BAD = 0xff3333;
let   ROT_COL = 0xf59e0b;
let   TRAV_COL = 0xf5c518;

// Demo AVL tree after inserting 30,20,40,10,25,35,50
const NODES = [
  { val:"30", x: 0,    y: 0,    h:3, bf:0,  parent:null },
  { val:"20", x:-2.5,  y:-2.0,  h:2, bf:0,  parent:0    },
  { val:"40", x: 2.5,  y:-2.0,  h:2, bf:0,  parent:0    },
  { val:"10", x:-3.8,  y:-4.0,  h:1, bf:0,  parent:1    },
  { val:"25", x:-1.2,  y:-4.0,  h:1, bf:0,  parent:1    },
  { val:"35", x: 1.2,  y:-4.0,  h:1, bf:0,  parent:2    },
  { val:"50", x: 3.8,  y:-4.0,  h:1, bf:0,  parent:2    },
];

class AVLTreeRenderer {
  constructor() {
    this.meshes     = [];
    this.nodeMeshes = [];
    this._animReqs  = [];
  }

  handleEvent(event, snapshot, scene, camera) {
    switch (event) {
      case "avl_node_struct_defined": this._onStruct(scene);       break;
      case "height_defined":          this._onHeight(scene);       break;
      case "get_balance_defined":     this._onBalance(scene);      break;
      case "create_node_defined":     this._onCreateNode(scene);   break;
      case "right_rotate_defined":    this._onRightRotate(scene);  break;
      case "left_rotate_defined":     this._onLeftRotate(scene);   break;
      case "insert_defined":          this._onInsert(scene);       break;
      case "inorder_defined":         this._onInorder(scene);      break;
      default: console.warn(`AVLTreeRenderer: unknown event "${event}"`);
    }
  }

  setColors(p) {
    NODE_COL = p.node;
    BAL_OK   = p.nodePlaced;
    BAL_BAD  = p.nodeError;
    ROT_COL  = p.edgeAlt;
    TRAV_COL = p.nodeTraverse;
  }

  clear(scene) {
    this._animReqs.forEach(id=>{cancelAnimationFrame(id);clearTimeout(id);});
    this._animReqs=[];
    this.meshes.forEach(m=>scene.remove(m));
    this.meshes=[]; this.nodeMeshes=[];
  }

  _onStruct(scene) {
    const ph = this._sphere(0,0,0,0.7,0x2a2a3a,0.4);
    ph.userData.isPlaceholder=true;
    this._add(scene,ph);
    this._label(scene,"height field",0,1.0,0,0.14,"#2a2a4a");
  }

  _onHeight(scene) {
    const ph=this.meshes.find(m=>m.userData.isPlaceholder);
    if(ph){scene.remove(ph);this.meshes=this.meshes.filter(m=>m!==ph);}
    // Show single node with height label
    const mesh=this._sphere(0,0,0,NODE_R,NODE_COL);
    this.nodeMeshes[0]=mesh;
    this._add(scene,mesh);
    this._label(scene,"30",0,0,0,0.18,"#ffffff");
    this._label(scene,"h=3",0.9,0.4,0,0.14,"#4f8ef7");
  }

  _onBalance(scene) {
    // Show the single node with BF label
    this._label(scene,"bf=0",0.9,-0.4,0,0.14,"#2d9e6b");
    this._label(scene,"|bf|>1 = rotate",0,1.4,0,0.14,"#ff6b6b");
  }

  _onCreateNode(scene) {
    // Spawn a fresh leaf
    const mesh=this._sphere(-3.8,-4.0,0,NODE_R,NODE_COL);
    this._add(scene,mesh);
    this._label(scene,"10",-3.8,-4.0,0,0.16,"#ffffff");
    this._label(scene,"h=1",-3.0,-4.0,0,0.13,"#4a4f6a");
  }

  _onRightRotate(scene) {
    // Animate a simple right rotation illustration
    const pivot=this._sphere(-2.5,-2.0,0,NODE_R,ROT_COL,0.9);
    this._add(scene,pivot);
    this._label(scene,"rightRotate",-2.5,-3.0,0,0.14,"#f59e0b");
    // Arrow arc suggestion
    this._arrow(scene,-3.5,-1.2,0,-1.5,-1.2,0,ROT_COL);
    const id=setTimeout(()=>{
      this._animateTo(pivot,-1.2,-2.0,0,600,()=>{
        if(pivot.material)pivot.material.color.setHex(NODE_COL);
      });
    },400);
    this._animReqs.push(id);
  }

  _onLeftRotate(scene) {
    const pivot=this._sphere(2.5,-2.0,0,NODE_R,ROT_COL,0.9);
    this._add(scene,pivot);
    this._label(scene,"leftRotate",2.5,-3.0,0,0.14,"#f59e0b");
    this._arrow(scene,1.5,-1.2,0,3.5,-1.2,0,ROT_COL);
    const id=setTimeout(()=>{
      this._animateTo(pivot,1.2,-2.0,0,600,()=>{
        if(pivot.material)pivot.material.color.setHex(NODE_COL);
      });
    },400);
    this._animReqs.push(id);
  }

  _onInsert(scene) {
    // Draw the full balanced AVL tree
    NODES.forEach((node,idx)=>{
      if(this.nodeMeshes[idx])return;
      const mesh=this._sphere(node.x,node.y,0,NODE_R,NODE_COL);
      this.nodeMeshes[idx]=mesh;
      this._add(scene,mesh);
      this._label(scene,node.val,node.x,node.y,0,0.17,"#ffffff");
      this._label(scene,`h${node.h}`,node.x+0.75,node.y+0.3,0,0.12,"#4a4f6a");
      if(node.parent!==null){
        const p=NODES[node.parent];
        this._arrow(scene,p.x,p.y-0.5,0,node.x,node.y+0.5,0,0x2a4a7a);
      }
    });
  }

  _onInorder(scene) {
    // Inorder: 10,20,25,30,35,40,50 → indices 3,1,4,0,5,2,6
    const order=[3,1,4,0,5,2,6];
    order.forEach((idx,step)=>{
      const id=setTimeout(()=>{
        const m=this.nodeMeshes[idx];
        if(m){m.material.color.setHex(TRAV_COL);const id2=setTimeout(()=>{if(m.material)m.material.color.setHex(NODE_COL);},500);this._animReqs.push(id2);}
      },step*400);
      this._animReqs.push(id);
    });
    this._label(scene,"sorted order",0,1.2,0,0.15,"#f5c518");
  }

  _sphere(x,y,z,r,color,opacity=1){const m=new THREE.Mesh(new THREE.SphereGeometry(r,32,32),new THREE.MeshStandardMaterial({color,transparent:opacity<1,opacity}));m.position.set(x,y,z);return m;}
  _add(scene,obj){scene.add(obj);this.meshes.push(obj);return obj;}
  _label(scene,text,x,y,z,size,color){const canvas=document.createElement("canvas");canvas.width=256;canvas.height=64;const ctx=canvas.getContext("2d");ctx.clearRect(0,0,256,64);ctx.fillStyle=color;ctx.font="bold 26px 'Space Mono', monospace";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(text,128,32);const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(canvas),transparent:true}));sprite.position.set(x,y,z);sprite.scale.set(size*8,size*2,1);this._add(scene,sprite);return sprite;}
  _arrow(scene,x1,y1,z1,x2,y2,z2,color=0x4f8ef7){const dir=new THREE.Vector3(x2-x1,y2-y1,z2-z1);const len=dir.length();dir.normalize();const a=new THREE.ArrowHelper(dir,new THREE.Vector3(x1,y1,z1),len,color,0.2,0.12);this._add(scene,a);return a;}
  _animateTo(mesh,tx,ty,tz,duration,onDone){const sx=mesh.position.x,sy=mesh.position.y,sz=mesh.position.z,start=performance.now();const tick=(now)=>{const t=Math.min((now-start)/duration,1),e=1-Math.pow(1-t,3);mesh.position.set(sx+(tx-sx)*e,sy+(ty-sy)*e,sz+(tz-sz)*e);if(t<1){const id=requestAnimationFrame(tick);this._animReqs.push(id);}else if(onDone)onDone();};this._animReqs.push(requestAnimationFrame(tick));}
}

export default AVLTreeRenderer;
