import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// Temporary, editable 3D furniture. GLB entries replace these through the registry.
const C = {wood:'#d8ab79',light:'#f4dfbd',teal:'#66aaa1',yellow:'#edc86b',white:'#fff4df',pink:'#d29c9b',green:'#659875',ink:'#46696b'};
export function furniture(id) {
  const group = new THREE.Group();
  const part = (w,h,d,x,y,z,color=C.wood,r=.055) => {
    const mesh=new THREE.Mesh(new RoundedBoxGeometry(w,h,d,2,Math.min(r,w/3,h/3,d/3)),new THREE.MeshStandardMaterial({color,roughness:.78}));
    mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);return mesh;
  };
  const round=(rt,rb,h,x,y,z,color) => {
    const mesh=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,24),new THREE.MeshStandardMaterial({color,roughness:.8}));
    mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);return mesh;
  };
  const legs=(w,d,h) => { for(const x of [-w/2,w/2])for(const z of [-d/2,d/2])part(.09,h,.09,x,h/2,z,C.wood); };
  const books=(x,y,z,count=4) => {for(let i=0;i<count;i++)part(.11,.25+(i%2)*.08,.24,x+i*.14,y,z,[C.teal,C.yellow,C.pink,C.white][i%4],.012);};
  if(id==='bed') {
    part(1.5,.22,2.05,0,.26,0);part(1.45,.25,1.96,0,.49,0,C.white);
    part(1.47,.12,1.26,0,.66,.34,C.teal);part(1.55,1.0,.13,0,.60,-1,C.light);
    part(.59,.17,.4,-.36,.7,-.64,C.white);part(.59,.17,.4,.36,.7,-.64,C.yellow);legs(1.2,1.75,.2);
  } else if(/rug/.test(id)) {
    part(1.5,.045,1.3,0,.028,0,id==='bedroom-rug'?C.yellow:C.teal,.02);
    part(1.25,.012,1.05,0,.054,0,C.white,.006);part(1.04,.012,.86,0,.062,0,id==='bedroom-rug'?C.yellow:C.teal,.004);
  } else if(/plant/.test(id)) {
    round(.22,.16,.4,0,.2,0,C.white);round(.025,.025,.7,0,.71,0,C.wood);
    for(let i=0;i<7;i++){const angle=i*2.4;const leaf=new THREE.Mesh(new THREE.SphereGeometry(.23,12,8),new THREE.MeshStandardMaterial({color:i%2?C.green:'#86ac7a',roughness:.9}));leaf.scale.set(.65,1.2,.45);leaf.position.set(Math.sin(angle)*.2,.65+i*.07,Math.cos(angle)*.2);leaf.rotation.z=Math.sin(angle)*.6;leaf.castShadow=true;group.add(leaf);}
  } else if(/lamp/.test(id)) {
    round(.22,.25,.09,0,.05,0,C.ink);round(.035,.035,1.12,0,.65,0,C.wood);round(.23,.4,.43,0,1.36,0,C.yellow);
  } else if(id==='sofa') {
    legs(1.55,.63,.23);part(1.92,.35,.87,0,.39,0,C.teal);part(1.92,.66,.18,0,.82,-.37,C.teal);
    for(const x of [-.84,.84])part(.25,.57,.84,x,.66,0,C.teal);
    for(const x of [-.4,.4])part(.68,.16,.66,x,.62,.06,C.white);
    part(.38,.38,.16,-.54,.89,-.14,C.yellow);
  } else if(/chair/.test(id)) {
    legs(.52,.5,.43);part(.73,.17,.7,0,.5,0,C.teal);part(.72,.63,.13,0,.86,-.27,C.teal);
    if(id!=='study-chair'){part(.14,.32,.68,-.36,.67,0,C.wood);part(.14,.32,.68,.36,.67,0,C.wood);part(.47,.11,.52,0,.61,.04,C.white);}
  } else if(id==='wardrobe'||id==='storage-cabinet'||id==='bookshelf') {
    const h=id==='wardrobe'?1.8:1.45;
    part(1.1,h,.55,0,h/2+.08,0,C.light);
    if(id==='bookshelf') {
      part(.92,h-.16,.08,0,h/2+.08,.3,C.wood);
      for(let i=0;i<3;i++){part(1,.06,.56,0,.16+i*.45,.02,C.white);books(-.36,.34+i*.45,.22,5);}
    } else {
      for(const x of [-.265,.265]){part(.5,h-.12,.04,x,h/2+.08,.3,C.white);part(.035,.16,.05,x>0?.10:-.10,.95,.35,C.ink,.01);}
    }
  } else if(id==='toy-box') {
    part(.86,.5,.66,0,.29,0,C.yellow);part(.93,.08,.73,0,.58,0,C.light);part(.24,.12,.05,0,.35,.35,C.white);
  } else if(id==='book-cart') {
    for(const y of [.24,.64]){part(.74,.07,.44,0,y,0,C.light);books(-.25,y+.20,0,4);}
    for(const x of [-.33,.33])part(.06,.93,.4,x,.5,0,C.teal);
    for(const x of [-.28,.28])for(const z of [-.15,.15])round(.06,.06,.07,x,.07,z,C.ink);
  } else if(id==='distractor-bathtub') {
    part(1.5,.5,.8,0,.32,0,C.white);part(1.27,.06,.57,0,.59,0,'#9acdd1');part(.06,.35,.06,-.6,.75,0,C.ink);
  } else if(id==='distractor-stove') {
    part(.8,.88,.65,0,.44,0,C.white);part(.57,.45,.04,0,.43,.34,C.ink);
    for(const x of [-.2,.2])for(const z of [-.16,.16])round(.12,.12,.03,x,.90,z,C.ink);
  } else if(id==='tv-cabinet'||id==='dresser') {
    legs(1.05,.42,.15);part(1.32,.6,.55,0,.43,0,C.light);
    for(const x of [-.32,.32]){part(.60,.48,.04,x,.45,.3,C.white);part(.1,.035,.06,x,.46,.34,C.ink,.01);}
    if(id==='tv-cabinet'){part(.9,.58,.07,0,1.1,0,C.ink);part(.08,.15,.10,0,.77,0,C.ink);}
    else{round(.22,.2,.15,0,.82,0,C.pink);}
  } else {
    const desk=id==='desk',coffee=id==='coffee-table';const w=desk?1.35:coffee?1.15:.65;const d=desk?.67:coffee?.68:.55;const h=coffee?.44:.72;
    legs(w-.18,d-.16,h);part(w,.11,d,0,h,0,C.light);
    if(desk){part(.55,.025,.35,.13,h+.08,0,C.teal);part(.28,.03,.22,-.38,h+.1,-.04,C.yellow);}
    if(id==='nightstand'){part(.52,.23,.45,0,.47,0,C.white);part(.09,.035,.04,0,.48,.25,C.ink,.01);}
  }
  group.name=id;
  return group;
}
