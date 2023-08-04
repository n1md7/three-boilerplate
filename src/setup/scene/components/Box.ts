import { RigidBody } from '@/src/abstract/RigidBody';
import { BoxGeometry, MeshStandardMaterial, Texture } from 'three';
import * as CANNON from 'cannon-es';
import * as THREE from 'three';

export class Box extends RigidBody {
  public readonly body: CANNON.Body;
  constructor(map: Texture, size = 1) {
    super();

    this.geometry = new BoxGeometry(size, size, size);
    this.material = new MeshStandardMaterial({ map, wireframe: false });
    this.body = new CANNON.Body({
      mass: size * 10, // kg (mass of the box)
      shape: new CANNON.Box(new CANNON.Vec3(size / 2, size / 2, size / 2)),
    });
    this.add(new THREE.AxesHelper(size));
    this.add(new THREE.GridHelper(size, size * 10));
  }

  update() {
    this.position.setX(this.body.position.x);
    this.position.setY(this.body.position.y);
    this.position.setZ(this.body.position.z);

    this.quaternion.x = this.body.quaternion.x;
    this.quaternion.y = this.body.quaternion.y;
    this.quaternion.z = this.body.quaternion.z;
    this.quaternion.w = this.body.quaternion.w;
  }
}
