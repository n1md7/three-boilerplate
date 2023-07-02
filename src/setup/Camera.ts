import { PerspectiveCamera } from 'three';

export default class Camera extends PerspectiveCamera {
  constructor() {
    super(45, window.innerWidth / window.innerHeight, 0.1, 1000);

    this.position.set(0, 2, 20);
    this.rotation.order = 'YXZ';
  }
}
