import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Session, matchingTarget} from '../src/core/session.js';
const ready = (options={}) => { const s = new Session({duration:120,targetIds:['a','b'],previewSeconds:5,startOn:'first-drag',...options}); s.tick(5000); return s; };
test('Reading instructions and initial preview do not consume mission time',()=>{
 const s=ready();s.tick(60000);assert.equal(s.phase,'ready');assert.equal(s.remaining,120);
 s.beginDrag(60000);s.tick(62000);assert.equal(s.remaining,118);
});
test('Pause and reference preview freeze the clock and return to the previous phase',()=>{
 const s=ready();s.beginDrag(5000);s.pause(15000);s.tick(65000);assert.equal(s.remaining,110);
 assert.equal(s.place('a',65000),false);s.resume(65000);s.preview(67000);s.tick(72000);
 assert.equal(s.phase,'playing');assert.equal(s.remaining,108);s.tick(73000);assert.equal(s.remaining,107);
});
test('Late drop cannot beat timeout; untimed continue preserves progress and gives one star',()=>{
 const s=ready();s.beginDrag(5000);assert.equal(s.place('a',6000),true);
 assert.equal(s.place('b',125000),false);assert.equal(s.phase,'timeout');assert.equal(s.placed.size,1);
 s.continueUntimed(150000);assert.equal(s.place('b',200000),true);assert.equal(s.stars(),1);
});
test('Duplicates do not add progress and exact one-third threshold earns three stars',()=>{
 const s=ready();s.beginDrag(5000);s.place('a',6000);assert.equal(s.place('a',7000),false);
 s.place('b',85000);assert.equal(s.remaining,40);assert.equal(s.stars(),3);
 const slow=ready();slow.beginDrag(5000);slow.place('a',6000);slow.place('b',86000);assert.equal(slow.stars(),2);
});
test('Wrong furniture, distant drops, and locked targets cannot match',()=>{
 const t=[{id:'a',furnitureId:'bed',transform:{position:[1,0,2]}}];
 assert.equal(matchingTarget(t,new Set(),'chair',{x:1,z:2},.65),undefined);
 assert.equal(matchingTarget(t,new Set(),'bed',{x:3,z:2},.65),undefined);
 assert.equal(matchingTarget(t,new Set(['a']),'bed',{x:1,z:2},.65),undefined);
 assert.equal(matchingTarget(t,new Set(),'bed',{x:1.1,z:2},.65).id,'a');
});
test('Paused preview resumes, freeplay has no timer, retry uses fresh state',()=>{
 const s=new Session({duration:120,targetIds:['a'],now:0,startOn:'first-drag'});s.pause(2000);s.resume(50000);s.tick(53000);assert.equal(s.phase,'ready');
 const f=ready({freeplay:true});f.beginDrag(5000);f.tick(1000000);assert.equal(f.phase,'playing');assert.equal(f.remaining,120);
 assert.equal(ready().placed.size,0);
});
test('Timer starts after the initial preview without dragging any furniture',()=>{
 const s=new Session({duration:180,targetIds:['a'],previewSeconds:5,now:0});
 s.pause(0);s.tick(30000);assert.equal(s.remaining,180);
 s.resume(30000);s.tick(34000);assert.equal(s.phase,'preview');assert.equal(s.remaining,180);
 s.tick(35000);assert.equal(s.phase,'playing');assert.equal(s.started,true);
 s.tick(38000);assert.equal(s.remaining,177);assert.equal(s.placed.size,0);
});
test('Automatic countdown freezes on pause/reference preview and continues without resetting',()=>{
 const s=new Session({duration:180,targetIds:['a'],previewSeconds:5,now:0});
 s.tick(10000);assert.equal(s.remaining,175);
 s.pause(11000);s.resume(30000);assert.equal(s.remaining,174);
 s.preview(31000,5);s.tick(35000);assert.equal(s.remaining,173);
 s.tick(37000);assert.equal(s.phase,'playing');assert.equal(s.remaining,172);
});
