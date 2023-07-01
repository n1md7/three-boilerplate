import * as THREE from 'three';

export default class Renderer extends THREE.WebGLRenderer {
  constructor() {
    super({ canvas: document.querySelector('#canvas')!, antialias: true, depth: true });
    this.shadowMap.enabled = true;
    this.setSize(window.innerWidth, window.innerHeight);
    // this.shadowMap.type = THREE.PCFSoftShadowMap;
    this.shadowMap.type = THREE.VSMShadowMap;
    this.shadowMap.enabled = true;
    this.toneMapping = THREE.ACESFilmicToneMapping;
    // this.useLegacyLights = false;
    // Limit pixel ratio, 2 is more than enough
    this.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }
}
