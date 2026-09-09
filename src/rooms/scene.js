import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clone } from 'three/addons/utils/SkeletonUtils.js';
import { furniture } from './furniture.js';
import { SelectionMarker } from '../interaction/selection-marker.js';

export class RoomScene {
  constructor(container,registry,onWarning) {
    this.container=container;this.registry=registry;this.onWarning=onWarning;
    this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});
    this.renderer.setPixelRatio(Math.min(devicePixelRatio,2));this.renderer.shadowMap.enabled=true;
    this.renderer.shadowMap.type=THREE.PCFShadowMap;this.renderer.setClearColor('#eee8db',1);
    this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.3;
    container.prepend(this.renderer.domElement);
    this.renderer.domElement.setAttribute('aria-label','Ruangan 3D. Tarik furnitur ke bayangan; geser ruangan untuk memutar kamera.');
    this.scene=new THREE.Scene();this.scene.add(new THREE.HemisphereLight('#fff7e6','#a2b7a7',2.7));
    const light=new THREE.DirectionalLight('#fff0d3',4);light.position.set(2,8,5);light.castShadow=true;light.shadow.mapSize.set(2048,2048);light.shadow.camera.left=-6;light.shadow.camera.right=6;light.shadow.camera.top=6;light.shadow.camera.bottom=-6;light.shadow.normalBias=.04;this.scene.add(light);
    this.camera=new THREE.PerspectiveCamera(40,1,.1,100);
    this.controls=new OrbitControls(this.camera,this.renderer.domElement);this.controls.enableDamping=true;
    this.controls.minDistance=6;this.controls.maxDistance=17;this.controls.minPolarAngle=.35;this.controls.maxPolarAngle=1.25;
    this.controls.minAzimuthAngle=-.1;this.controls.maxAzimuthAngle=Math.PI/2+.1;this.controls.maxTargetRadius=2;
    this.controls.mouseButtons={LEFT:THREE.MOUSE.ROTATE,MIDDLE:THREE.MOUSE.DOLLY,RIGHT:THREE.MOUSE.PAN};
    this.ray=new THREE.Raycaster();this.floorPlane=new THREE.Plane(new THREE.Vector3(0,1,0),0);
    this.prototypes=new Map();this.actual=new Map();this.shadows=new Map();this.freeObjects=[];this.disposed=false;
    this.selectionMarker=new SelectionMarker(this.scene);
    this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(container);
  }
  resize(){const w=this.container.clientWidth,h=this.container.clientHeight;if(!w||!h||this.disposed)return;this.renderer.setSize(w,h);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();}
  async model(id,fallbackId) {
    const asset=this.registry[id];
    if(asset?.path){
      try {const gltf=await new GLTFLoader().loadAsync('/'+asset.path.replace(/^\//,''));const model=gltf.scene;model.scale.fromArray(asset.defaultScale||[1,1,1]);model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});return model;}
      catch(error){this.onWarning?.(id);console.warn('Model unavailable; using temporary furniture.',id,error.message);}
    }
    return fallbackId?furniture(fallbackId):null;
  }
  async prepare(room,items,activeIds,freeplay=false) {
    this.room=room;this.activeIds=new Set(activeIds);this.freeplay=freeplay;
    this.camera.position.fromArray(room.camera?.position||[8,7,9]);this.controls.target.fromArray(room.camera?.lookAt||[0,0,0]);this.controls.update();this.controls.saveState();
    const roomModel=await this.model(room.roomModelAssetId,null);
    if(this.disposed){this.releaseObject(roomModel);return;}
    if(roomModel)this.scene.add(roomModel);else this.buildRoom(room);
    await Promise.all(items.map(async item=>{
      const object=await this.model(item.modelAssetId,item.furnitureId||item.id);
      if(this.disposed){this.releaseObject(object);return;}
      this.prototypes.set(item.furnitureId||item.id,object);
    }));
    if(this.disposed)return;
    if(!freeplay)for(const target of room.targets){
      const object=this.instance(target.furnitureId);this.applyTransform(object,target);this.scene.add(object);this.actual.set(target.id,object);
      if(this.activeIds.has(target.id)){
        const shadow=clone(object);shadow.position.y=.018;shadow.scale.y*=.008;
        shadow.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=false;o.material=new THREE.MeshBasicMaterial({color:'#237d79',transparent:true,opacity:.30,depthWrite:false,side:THREE.DoubleSide});}});
        shadow.visible=false;this.scene.add(shadow);this.shadows.set(target.id,shadow);
      }
    }
    this.resize();
  }
  buildRoom(room){
    const [w,d]=room.suggestedFloorSizeMeters||[7,7];
    const box=(x,y,z,px,py,pz,color)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(x,y,z),new THREE.MeshStandardMaterial({color,roughness:.88}));m.position.set(px,py,pz);m.receiveShadow=true;this.scene.add(m);return m;};
    box(w+.2,.20,d+.2,0,-.13,0,'#c59a6a');
    for(let i=0;i<14;i++)box(w/14-.014,.035,d,(i+.5)*w/14-w/2,-.01,0,i%3?'#e5c49b':'#edcfaa');
    box(w,.0+2.5,.12,0,1.23,-d/2,'#f4efdf');box(.12,2.5,d,-w/2,1.23,0,'#e2e9dc');
    box(w,.14,.06,0,.09,-d/2+.08,'#fff9ee');box(.06,.14,d,-w/2+.08,.09,0,'#fff9ee');
    // A simple window is part of the procedural 3D room, not a baked UI image.
    box(1.8,1.4,.08,.4,1.55,-d/2+.09,'#fffcf2');box(1.57,1.18,.04,.4,1.55,-d/2+.15,'#b3d8d7');
    box(.06,1.2,.045,.4,1.55,-d/2+.18,'#fffcf2');box(1.6,.06,.045,.4,1.55,-d/2+.18,'#fffcf2');
  }
  instance(id){const object=clone(this.prototypes.get(id));object.name=id;return object;}
  applyTransform(object,target){object.position.fromArray(target.transform.position);object.rotation.set(...target.transform.rotationDegrees.map(THREE.MathUtils.degToRad));object.scale.multiply(new THREE.Vector3(...target.transform.scale));}
  sync(session){const preview=session.phase==='preview'||(session.phase==='paused'&&session.resumePhase==='preview');for(const [id,object] of this.actual){object.visible=!this.activeIds.has(id)||session.placed.has(id)||preview;}for(const [id,shadow]of this.shadows)shadow.visible=!session.placed.has(id)&&!preview;}
  highlight(id){for(const [key,shadow] of this.shadows)shadow.traverse(o=>{if(o.isMesh){o.material.color.set(key===id?'#43865c':'#237d79');o.material.opacity=key===id?.58:.30;}});}
  point(clientX,clientY){const rect=this.renderer.domElement.getBoundingClientRect();if(clientX<rect.left||clientX>rect.right||clientY<rect.top||clientY>rect.bottom)return null;this.ray.setFromCamera(new THREE.Vector2((clientX-rect.left)/rect.width*2-1,-(clientY-rect.top)/rect.height*2+1),this.camera);const p=this.ray.ray.intersectPlane(this.floorPlane,new THREE.Vector3());const [w,d]=this.room.suggestedFloorSizeMeters||[7,7];return p&&Math.abs(p.x)<w/2&&Math.abs(p.z)<d/2?p:null;}
  dragStart(id){this.dragEnd();this.drag=this.instance(id);this.drag.traverse(o=>{if(o.isMesh){const original=Array.isArray(o.material)?o.material:[o.material];const copies=original.map(m=>{const c=m.clone();c.transparent=true;c.opacity=.65;return c;});o.material=Array.isArray(o.material)?copies:copies[0];o.castShadow=false;}});this.scene.add(this.drag);this.controls.enabled=false;}
  dragMove(point){if(this.drag){this.drag.visible=!!point;if(point)this.drag.position.copy(point);}}
  dragEnd(){if(this.drag){this.scene.remove(this.drag);this.drag.traverse(o=>{if(o.isMesh)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose());});this.drag=null;}this.highlight(null);}
  placeFree(id,point){const object=this.instance(id);object.position.copy(point);this.scene.add(object);this.freeObjects.push(object);return object;}
  pickFree(x,y){const rect=this.renderer.domElement.getBoundingClientRect();this.ray.setFromCamera(new THREE.Vector2((x-rect.left)/rect.width*2-1,-(y-rect.top)/rect.height*2+1),this.camera);const hit=this.ray.intersectObjects(this.freeObjects,true)[0];if(!hit)return null;return this.freeObjects.find(o=>{let p=hit.object;while(p){if(p===o)return true;p=p.parent;}return false;});}
  removeFree(object){this.scene.remove(object);this.freeObjects=this.freeObjects.filter(o=>o!==object);}
  thumbnail(id){
    const scene=new THREE.Scene();scene.add(new THREE.HemisphereLight('#fff9ef','#a4b8b0',3));const light=new THREE.DirectionalLight('#ffffff',4);light.position.set(3,5,4);scene.add(light);
    const model=this.instance(id);scene.add(model);const bounds=new THREE.Box3().setFromObject(model);const center=bounds.getCenter(new THREE.Vector3());const size=bounds.getSize(new THREE.Vector3());const extent=Math.max(size.x,size.y,size.z,.5);
    const camera=new THREE.PerspectiveCamera(35,1,.01,100);camera.position.copy(center).add(new THREE.Vector3(extent*1.65,extent*1.3,extent*1.85));camera.lookAt(center);
    this.renderer.setSize(160,160,false);this.renderer.setClearColor('#ffffff',0);this.renderer.render(scene,camera);const url=this.renderer.domElement.toDataURL('image/png');this.renderer.setClearColor('#eee8db',1);this.resize();return url;
  }
  project(position){const p=new THREE.Vector3(...position).project(this.camera);return{x:(p.x+1)/2*this.container.clientWidth,y:(1-p.y)/2*this.container.clientHeight};}
  setSelection(object){this.selectionMarker.select(object);}
  render(){if(!this.disposed){this.controls.update();this.selectionMarker.update();this.renderer.render(this.scene,this.camera);}}
  releaseObject(root){if(!root)return;root.traverse(o=>{o.geometry?.dispose();if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{for(const v of Object.values(m))if(v?.isTexture)v.dispose();m.dispose();});});}
  dispose(){this.disposed=true;this.resizeObserver.disconnect();this.dragEnd();this.selectionMarker.dispose();this.controls.dispose();this.releaseObject(this.scene);for(const obj of this.prototypes.values())this.releaseObject(obj);this.renderer.dispose();this.renderer.forceContextLoss();this.renderer.domElement.remove();}
}
