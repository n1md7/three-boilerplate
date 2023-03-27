import * as THREE from 'three';

export default class Camera extends THREE.PerspectiveCamera {
  constructor() {
    super(45, 2, 0.1, 300);

    this.position.set(0, 10, 20);
  }
}
