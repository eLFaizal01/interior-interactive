import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Window} from 'happy-dom';
import {Session} from '../src/core/session.js';

// Exercise the real UI entrypoint/events with a simulated DOM and clock.
// WebGL is replaced here; these checks do not claim to test browser rendering.
test('UI timer, catalog selection and free-object selection use visible consistent state',async()=>{
 const window=new Window({url:'http://localhost:5173',settings:{disableCSSFileLoading:true,disableJavaScriptFileLoading:true}});
 const document=window.document;
 document.body.innerHTML=fs.readFileSync('index.html','utf8').match(/<body>([\s\S]*?)<script/)[1];
 let now=0,nextFrame=0;const frames=new Map();
 class Scene {
  constructor(container){Scene.latest=this;this.renderer={domElement:document.createElement('canvas')};container.prepend(this.renderer.domElement);this.controls={enabled:true,reset(){}};this.freeObjects=[];}
  async prepare(){} thumbnail(){return 'data:image/png;base64,';} render(){} sync(){} highlight(){} dispose(){}
  dragEnd(){this.drag=null;} dragStart(){this.drag={rotation:{copy(){}}};}dragMove(){}
  point(){return{x:0,y:0,z:0};} project(){return{x:100,y:100};}
  setSelection(object){this.selectedObject=object;}
  placeFree(id){const o={name:id,rotation:{y:0},position:{copy(){}}};this.freeObjects.push(o);return o;}
  pickFree(){return this.pickTarget||null;}
  removeFree(object){this.freeObjects=this.freeObjects.filter(o=>o!==object);}
 }
 const fetch=async path=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(path.slice(1),'utf8').replace(/^\uFEFF/,''))});
 const source=fs.readFileSync('src/main.js','utf8').replace(/^import .*;\r?\n/gm,'').replace(/init\(\);\s*$/,'return init();');
 const run=new Function('window','document','Session','RoomScene','fetch','requestAnimationFrame','cancelAnimationFrame','performance','AbortController','setTimeout','clearTimeout',source);
 try{
  await run(window,document,Session,Scene,fetch,callback=>{frames.set(++nextFrame,callback);return nextFrame;},id=>frames.delete(id),{now:()=>now},window.AbortController,window.setTimeout.bind(window),window.clearTimeout.bind(window));
  const click=selector=>{const el=document.querySelector(selector);assert.ok(el,selector);el.click();};
  const advance=milliseconds=>{now+=milliseconds;const batch=[...frames.values()];frames.clear();batch.forEach(callback=>callback(now));};
  click('[data-mode="challenge"]');click('[data-action="start"]');
  // Wait for the UI's async scene preparation to finish.
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(document.querySelector('#timer-text').textContent,'3:00');
  click('[data-action="begin-preview"]');advance(5000);
  assert.equal(document.querySelector('#timer-status').textContent,'Waktu berjalan');
  advance(2000);assert.equal(document.querySelector('#timer-text').textContent,'2:58');
  click('[data-action="pause"]');advance(10000);
  assert.equal(document.querySelector('#timer-text').textContent,'2:58');
  assert.equal(document.querySelector('#timer-status').textContent,'Dijeda');
  click('[data-action="resume"]');advance(1000);
  assert.equal(document.querySelector('#timer-text').textContent,'2:57');
  click('[data-action="preview"]');advance(5000);
  assert.equal(document.querySelector('#timer-text').textContent,'2:57');
  advance(1000);assert.equal(document.querySelector('#timer-text').textContent,'2:56');
  click('[data-item="bed"]');
  assert.equal(document.querySelector('[data-item="bed"]').getAttribute('aria-pressed'),'true');
  assert.equal(document.querySelector('#selection-name').textContent,'Dipilih: Tempat Tidur');
  assert.equal(document.querySelector('[data-item="bed"] .selected-badge').hidden,false);
  click('[data-action="deselect"]');assert.equal(document.querySelector('#selection-banner').hidden,true);
  click('[data-action="exit"]');click('[data-action="choose"]');click('[data-action="home"]');
  click('[data-mode="freeplay"]');click('[data-action="start"]');
  await new Promise(resolve=>setImmediate(resolve));
  click('[data-item="bed"]');
  const canvas=document.querySelector('#viewport canvas');
  const point=()=>canvas.dispatchEvent(new window.PointerEvent('pointerdown',{bubbles:true,button:0,clientX:100,clientY:100}));
  point();advance(1);
  const placed=Scene.latest.freeObjects[0];assert.ok(placed);
  assert.equal(Scene.latest.selectedObject,placed);assert.equal(document.querySelector('#selection-banner').hidden,false);
  click('[data-action="rotate"]');assert.equal(placed.rotation.y,Math.PI/4);
  document.querySelector('#viewport').dispatchEvent(new window.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
  assert.equal(Scene.latest.selectedObject,null);assert.equal(document.querySelector('#selection-banner').hidden,true);
  Scene.latest.pickTarget=placed;point();advance(1);
  assert.equal(Scene.latest.selectedObject,placed);
  Scene.latest.pickTarget=null;point();advance(1);
  assert.equal(Scene.latest.selectedObject,null);assert.equal(document.querySelector('#selection-banner').hidden,true);
  Scene.latest.pickTarget=placed;point();advance(1);click('[data-action="remove"]');
  assert.equal(Scene.latest.freeObjects.length,0);assert.equal(document.querySelector('#selection-banner').hidden,true);
 }finally{await window.happyDOM.close();}
});
