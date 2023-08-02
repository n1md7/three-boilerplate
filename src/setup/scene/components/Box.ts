import { RigidBody } from '@/src/abstract/RigidBody';
import { BoxGeometry, MeshStandardMaterial, Texture } from 'three';
import * as CANNON from 'cannon-es';

export class Box extends RigidBody {
  public readonly body: CANNON.Body;
  constructor(map: Texture) {
    super();

    this.geometry = new BoxGeometry(1, 1, 1);
    this.material = new MeshStandardMaterial({ map });
    this.body = new CANNON.Body({
      mass: 10, // kg (mass of the box)
      shape: new CANNON.Box(new CANNON.Vec3(1, 1, 1)),
    });
  }

  update() {
    this.position.set(this.body.position.x, this.body.position.y, this.body.position.z);
    this.quaternion.set(this.body.quaternion.x, this.body.quaternion.y, this.body.quaternion.z, this.body.quaternion.w);
  }
}
