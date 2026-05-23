import { RigidBody } from '@/src/abstract/RigidBody';
import { MeshStandardMaterial, SphereGeometry } from 'three';
import * as CANNON from 'cannon-es';

/**
 * A heavy sphere with full rigid-body physics — the bowling ball.
 *
 * Mass is tuned so that a Desert Eagle round (damage 64) imparts a satisfying
 * rolling impulse without launching the ball, and so the ball comfortably
 * out-masses the small bowling-pin cubes it's meant to crash into.
 */
export class Ball extends RigidBody {
  public readonly body: CANNON.Body;

  constructor(radius = 0.4, mass = 20, color: string | number = '#1a1a1a') {
    super();

    this.geometry = new SphereGeometry(radius, 32, 16);
    this.material = new MeshStandardMaterial({
      color,
      metalness: 0.65,
      roughness: 0.35,
    });

    this.body = new CANNON.Body({
      mass,
      shape: new CANNON.Sphere(radius),
      linearDamping: 0.15, // slows rolling friction naturally
      angularDamping: 0.15,
    });
  }

  override applyImpulse(impulse: CANNON.Vec3, worldPoint?: CANNON.Vec3): void {
    if (worldPoint) this.body.applyImpulse(impulse, worldPoint);
    else this.body.applyImpulse(impulse);
  }

  update() {
    this.position.set(this.body.position.x, this.body.position.y, this.body.position.z);
    this.quaternion.set(this.body.quaternion.x, this.body.quaternion.y, this.body.quaternion.z, this.body.quaternion.w);
  }
}
