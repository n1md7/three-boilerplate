import * as THREE from 'three';
import Camera from '@/src/setup/Camera';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export class WindowUtils {
  private orbitControls!: OrbitControls;
  constructor(private readonly renderer: THREE.Renderer, private readonly camera: Camera) {
    this.resize = this.resize.bind(this);
  }

  private resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private setupOrbitControls() {
    this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
    this.orbitControls.target.set(0, 0, 0);
    this.orbitControls.enableDamping = true;
  }

  controlDumpingUpdate() {
    this.orbitControls.update();
  }

  subscribe() {
    this.resize();
    this.setupOrbitControls();
    window.addEventListener('resize', this.resize);
  }

  unsubscribe() {
    window.removeEventListener('resize', this.resize);
  }
}
