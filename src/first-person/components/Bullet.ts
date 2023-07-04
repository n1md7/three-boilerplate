import * as THREE from 'three';

export class Bullet extends THREE.Mesh {
  readonly velocity = new THREE.Vector3();
  readonly shotAt = new THREE.Vector3();

  constructor(readonly size = 0.1, readonly speed = 0.1, readonly color = 0xff0000) {
    super();

    this.geometry = new THREE.SphereGeometry(size, 8, 8);
    this.material = new THREE.MeshBasicMaterial({ color });
  }

  update() {
    this.position.add(this.velocity);
  }
}
