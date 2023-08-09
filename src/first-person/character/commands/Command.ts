import { Character } from '@/src/first-person/Character';
import { Camera } from '@/src/setup';
import * as THREE from 'three';

export abstract class Command {
  protected constructor(protected readonly character: Character, protected readonly camera: Camera) {}

  abstract execute(delta: number): void;

  stop() {}

  /**
   * Get the Z axis vector of the camera.
   *
   * Is used to control forward/backward movement.
   * @protected
   */
  protected getZAxisVector() {
    const vector = this.camera.getWorldDirection(new THREE.Vector3());
    vector.y = 0;
    vector.normalize();

    return vector;
  }

  /**
   * Get the X axis vector of the camera.
   *
   * Is used to control side movement.
   * @protected
   */
  protected getXAxisVector() {
    const vector = new THREE.Vector3();
    this.camera.getWorldDirection(vector);
    // Cross product with the world up vector to get the X axis
    // It gives a vector that is perpendicular to the camera direction and the world up vector
    // this.camera.up and new THREE.Vector3(0, 1, 0) are the same
    vector.cross(new THREE.Vector3(0, 1, 0));
    vector.normalize();

    return vector;
  }
}
