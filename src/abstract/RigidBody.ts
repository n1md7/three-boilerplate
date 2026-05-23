import { Mesh } from 'three';
import * as CANNON from 'cannon-es';

/**
 * Anything with a CANNON physics body that participates in the game loop.
 *
 *   update()       — syncs the visible mesh transform to its CANNON body.
 *   applyImpulse() — polymorphic entry point used by the bullet system.
 *
 * Static rigid bodies (a static-mass Box used as a plinth, etc.) inherit the
 * no-op default for applyImpulse and shrug off bullet impacts.
 */
export abstract class RigidBody extends Mesh {
  abstract update(): void;

  applyImpulse(_impulse: CANNON.Vec3, _worldPoint?: CANNON.Vec3): void {}
}
