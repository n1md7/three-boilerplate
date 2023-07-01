import * as THREE from 'three';
import { Octree } from 'three/examples/jsm/math/Octree.js';
import { GUI } from 'lil-gui';
import { Debug } from '@/src/setup/utils/common';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

export default class Scene extends THREE.Scene {
  private readonly width: number;
  private readonly depth: number;

  constructor(private readonly gui: GUI, private readonly world: Octree, width = 100, depth = 100) {
    super();

    this.width = width;
    this.depth = depth;

    this.background = new THREE.Color('#1f1e1e');
  }

  addFog() {
    this.fog = new THREE.Fog('#0e0d0d', 0, 24);

    return this;
  }

  addAxisHelper() {
    this.add(new THREE.AxesHelper(20));

    return this;
  }

  addGridHelper() {
    this.add(new THREE.GridHelper(32, 64, 0x888888, 0x444444));

    return this;
  }

  addLight() {
    const light = new THREE.PointLight('#FFFFFF', 1, 100);
    light.castShadow = true;
    light.position.set(2.5, 7.5, 15);
    this.add(light, new THREE.PointLightHelper(light));

    if (Debug.enabled()) {
      const folder = this.gui.addFolder('Light');
      folder.add(light, 'intensity', 0, 20, 0.01);
      folder.addColor(light, 'color');
      folder.add(light, 'distance', 0, 100, 0.01);
      folder.add(light, 'decay', 0, 10, 0.01);
    }

    return this;
  }

  addGround(texture: THREE.Texture) {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(this.width / 8, this.depth / 8);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.MeshStandardMaterial({
        map: texture,
        side: THREE.DoubleSide,
      })
    );
    ground.rotateX(-Math.PI / 2);
    ground.position.y = -0.01;
    ground.receiveShadow = true;

    this.world.fromGraphNode(ground);
    this.add(ground);

    return this;
  }

  addSky(sky: GLTF) {
    sky.scene.scale.set(100, 100, 100);
    this.add(sky.scene);

    return this;
  }

  addBoxes(texture: THREE.Texture, count = 16) {
    const map = texture.clone();
    // Add random boxes around the ground
    const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
    const boxMaterial = new THREE.MeshStandardMaterial({ map });

    for (const _ of Array(count).keys()) {
      const box = new THREE.Mesh(boxGeometry, boxMaterial);
      box.position.set(Math.random() * this.width - this.width / 2, 0.5, Math.random() * this.depth - this.depth / 2);
      box.castShadow = true;
      box.receiveShadow = true;
      this.world.fromGraphNode(box);
      this.add(box);
    }

    return this;
  }

  addStairs(texture: THREE.Texture, count = 10) {
    const map = texture.clone();

    const width = 3;

    map.wrapS = THREE.RepeatWrapping;
    map.wrapT = THREE.RepeatWrapping;

    map.repeat.set(width, 1);

    const boxGeometry = new THREE.BoxGeometry(width, 1, 1);
    const boxMaterial = new THREE.MeshStandardMaterial({ map });

    for (let i = 0; i < count; i++) {
      const box = new THREE.Mesh(boxGeometry, boxMaterial);
      box.position.set(-this.width / 2 + 2, i * 0.5, -this.depth / 2 + 2 + i);
      box.castShadow = true;
      box.receiveShadow = true;
      this.world.fromGraphNode(box);
      this.add(box);
    }

    return this;
  }
}
