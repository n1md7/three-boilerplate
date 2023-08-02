import { Mesh } from 'three';

export abstract class RigidBody extends Mesh {
  abstract update(): void;
}
