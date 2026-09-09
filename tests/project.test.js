import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import {furniture} from '../src/rooms/furniture.js';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,''));
test('Every mission has the configured target count, valid assets, and disjoint decoys',()=>{
 const config=read('config/game.json'),registry=read('config/assets.json').assets,decoys=read('data/distractors.json').items;
 for(const roomId of config.roomIds){
  const room=read(`data/rooms/${roomId}.json`),mission=read(`data/missions/${roomId}.json`);
  for(const [difficulty,level]of Object.entries(mission.levels)){
   assert.equal(new Set(level.targetIds).size,config.difficulty[difficulty].targetCount);
   assert.equal(level.distractorFurnitureIds.length,config.difficulty[difficulty].distractorCount);
   for(const id of level.targetIds)assert.ok(room.targets.some(t=>t.id===id));
   for(const id of level.distractorFurnitureIds){assert.ok(decoys.some(d=>d.id===id));assert.ok(!room.targets.some(t=>t.furnitureId===id));}
  }
  for(const t of room.targets){assert.ok(registry[t.modelAssetId]);assert.ok(registry[t.thumbnailAssetId]);const o=furniture(t.furnitureId),box=new THREE.Box3().setFromObject(o);assert.ok(!box.isEmpty());assert.ok(box.min.y>=-.06,`${t.furnitureId} must sit on the floor`);assert.ok(box.max.y<3);}
 }
 for(const entry of Object.values(registry))if(entry.path)assert.ok(fs.existsSync(entry.path),entry.path);
});
