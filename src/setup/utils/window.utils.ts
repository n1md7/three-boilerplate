import * as THREE from 'three';
import Camera from '@/src/setup/Camera';

export class WindowUtils {
  constructor(private readonly renderer: THREE.Renderer, private readonly camera: Camera) {
    this.resize = this.resize.bind(this);
  }

  private resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  subscribe() {
    this.resize();
    window.addEventListener('resize', this.resize);
  }

  unsubscribe() {
    window.removeEventListener('resize', this.resize);
  }
}
