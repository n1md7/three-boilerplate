import * as THREE from 'three';

export default class Renderer extends THREE.WebGLRenderer {
  constructor() {
    super({ canvas: document.querySelector('#canvas')! });
    this.shadowMap.enabled = true;
    this.setSize(window.innerWidth, window.innerHeight);
    this.shadowMap.type = THREE.PCFSoftShadowMap;
    // Limit pixel ratio, 2 is more than enough
    this.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }
}
