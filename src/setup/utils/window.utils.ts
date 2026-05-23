import Camera from '@/src/setup/Camera';
import { WebGLRenderer } from 'three';

export class WindowUtils {
  constructor(
    private readonly renderer: WebGLRenderer,
    private readonly camera: Camera,
    private readonly weaponCamera: Camera,
  ) {
    this.resize = this.resize.bind(this);
  }

  private resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.weaponCamera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.weaponCamera.updateProjectionMatrix();

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
