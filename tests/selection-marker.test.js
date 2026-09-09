import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {SelectionMarker} from '../src/interaction/selection-marker.js';

test('Selection follows the chosen object and clears without modifying shared furniture materials',()=>{
 const scene=new THREE.Scene(),material=new THREE.MeshStandardMaterial({color:'#66aaa1'}),geometry=new THREE.BoxGeometry(2,1,1);
 const first=new THREE.Mesh(geometry,material),second=new THREE.Mesh(geometry,material);
 first.position.set(0,.5,0);second.position.set(3,.5,2);scene.add(first,second);
 const marker=new SelectionMarker(scene);
 marker.select(first);assert.equal(marker.outline.visible,true);assert.equal(marker.ring.position.x,0);
 first.position.x=1;first.rotation.y=Math.PI/2;marker.update();
 assert.equal(marker.ring.position.x,1);assert.ok(marker.bounds.getSize(new THREE.Vector3()).z>2);
 marker.select(second);assert.equal(marker.ring.position.x,3);assert.equal(marker.ring.position.z,2);
 assert.equal(first.material,material);assert.equal(second.material,material);assert.equal(material.color.getHexString(),'66aaa1');
 second.visible=false;marker.update();assert.equal(marker.outline.visible,false);
 marker.select(null);assert.equal(marker.ring.visible,false);
 marker.dispose();assert.equal(marker.outline.parent,null);assert.equal(marker.ring.parent,null);
 geometry.dispose();material.dispose();
});
