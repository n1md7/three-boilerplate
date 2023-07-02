import { PerspectiveCamera } from 'three';

export default class Camera extends PerspectiveCamera {
  constructor(far = 1000) {
    const near = 0.1;
    super(45, window.innerWidth / window.innerHeight, near, far);

    this.position.set(0, 2, 20);
    this.rotation.order = 'YXZ';
  }
}
