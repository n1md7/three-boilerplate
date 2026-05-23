import { RigidBody } from '@/src/abstract/RigidBody';
import { BoxGeometry, MeshStandardMaterial, Texture } from 'three';
import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import { Debug } from '@/src/setup/utils/common';

export class Box extends RigidBody {
  public readonly body: CANNON.Body;

  /**
   * @param size       Cube edge length (uniform, in metres).
   * @param isStatic   If true, the box doesn't move under physics — used for
   *                   plinths/shelves under the shooting range. Default false.
   */
  constructor(map: Texture, size = 1, isStatic = false) {
    super();

    this.geometry = new BoxGeometry(size, size, size);
    this.material = new MeshStandardMaterial({ map, wireframe: false });
    this.body = new CANNON.Body({
      mass: isStatic ? 0 : size * 10, // mass 0 = static body in CANNON
      shape: new CANNON.Box(new CANNON.Vec3(size / 2, size / 2, size / 2)),
    });

    if (Debug.enabled()) {
      this.add(new THREE.AxesHelper(size));
      this.add(new THREE.GridHelper(size, size * 10));
    }
  }

  override applyImpulse(impulse: CANNON.Vec3, worldPoint?: CANNON.Vec3): void {
    if (worldPoint) this.body.applyImpulse(impulse, worldPoint);
    else this.body.applyImpulse(impulse);
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
