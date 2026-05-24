import { ACESFilmicToneMapping, PCFShadowMap, WebGLRenderer } from 'three';

export default class Renderer extends WebGLRenderer {
  constructor() {
    super({ canvas: document.querySelector('#canvas')!, antialias: true, depth: true });

    // PCFShadowMap works for every light type (PointLight included). VSM logs
    // a warning per PointLight per frame and silently skips them; PCFSoft has
    // been deprecated by Three.js and falls back to PCF anyway.
    this.shadowMap.enabled = true;
    this.shadowMap.type = PCFShadowMap;

    this.toneMapping = ACESFilmicToneMapping;
    this.setSize(window.innerWidth, window.innerHeight);
    // Cap pixel ratio at 2 — anything higher costs a lot of fillrate for no
    // visible benefit on typical displays.
    this.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.autoClear = false; // The weapon scene is rendered as a second pass.
  }
}
