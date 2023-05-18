import { Timestamp } from '@/src/setup/utils/Timestamp';
import { Performance } from '@/src/setup/utils/Performance';
import { WindowUtils } from '@/src/setup/utils/window.utils';
import { Renderer, Camera, Scene } from '@/src/setup';
import { Loader } from '@/src/setup/utils/Loader';
import * as THREE from 'three';
import GUI from 'lil-gui';

(async function setup() {
  const renderer = new Renderer();
  const camera = new Camera();
  const asset = new Loader();
  const scene = new Scene();
  const gui = new GUI();

  const ducky = await asset.load('3d/duck.gltf');

  gui
    .addFolder('Rubber Ducky')
    .add(ducky.scene.rotation, 'z')
    .step(Math.PI / 180)
    .min(0)
    .max(Math.PI)
    .name('rotationZ')
    .show();

  const material = new THREE.MeshStandardMaterial({ wireframe: true, color: '#AA0033' });
  const geometry = new THREE.SphereGeometry(2, 32, 32);
  const sphere = new THREE.Mesh(geometry, material);

  scene.add(sphere, ducky.scene);

  {
    const FPS = 60;
    const DELAY = 1000 / FPS;
    const clock = new THREE.Clock();
    const performance = new Performance();
    const timestamp = new Timestamp();
    const windowUtils = new WindowUtils(renderer, camera);
    (function onSetup() {
      performance.show();
      windowUtils.subscribe();
    })();
    (function gameLoop() {
      performance.start();
      const elapsedTime = clock.getElapsedTime();
      if (timestamp.delta >= DELAY) {
        renderer.render(scene, camera);

        ducky.scene.position.x = Math.sin(elapsedTime) * Math.PI;
        ducky.scene.position.z = Math.cos(elapsedTime) * Math.PI;
        ducky.scene.rotation.y = elapsedTime;

        timestamp.update();
      }

      windowUtils.controlDumpingUpdate();
      requestAnimationFrame(gameLoop);
      performance.end();
    })();
  }
})().catch(console.error);
