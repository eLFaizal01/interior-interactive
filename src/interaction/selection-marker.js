import * as THREE from 'three';

// A separate overlay leaves the furniture's shared materials untouched.
export class SelectionMarker {
  constructor(scene) {
    this.bounds = new THREE.Box3();
    this.outline = new THREE.Box3Helper(this.bounds, '#197b82');
    this.outline.material.depthTest = false;
    this.outline.material.transparent = true;
    this.outline.material.opacity = .9;
    this.outline.material.toneMapped = false;
    this.outline.renderOrder = 20;
    this.ring = new THREE.Mesh(
      new THREE.TorusGeometry(1, .025, 8, 64),
      new THREE.MeshBasicMaterial({color:'#197b82',depthTest:false,transparent:true,opacity:.9,toneMapped:false}),
    );
    this.ring.rotation.x = -Math.PI / 2;
    this.ring.renderOrder = 20;
    scene.add(this.outline, this.ring);
    this.select(null);
  }
  select(object) { this.object = object; this.update(); }
  update() {
    const visible = !!this.object?.parent && this.object.visible;
    this.outline.visible = this.ring.visible = visible;
    if (!visible) return;
    this.bounds.setFromObject(this.object).expandByScalar(.06);
    if(this.bounds.isEmpty()){this.outline.visible=this.ring.visible=false;return;}
    const center = this.bounds.getCenter(new THREE.Vector3());
    const size = this.bounds.getSize(new THREE.Vector3());
    this.ring.position.set(center.x, .055, center.z);
    this.ring.scale.set(Math.max(size.x/2,.3), Math.max(size.z/2,.3), 1);
    this.outline.updateMatrixWorld(true);
  }
  dispose() {
    for (const overlay of [this.outline,this.ring]) {
      overlay.removeFromParent();overlay.geometry.dispose();overlay.material.dispose();
    }
    this.object = null;
  }
}
