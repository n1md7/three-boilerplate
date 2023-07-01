import { Timestamp } from '@/src/setup/utils/Timestamp';
import { Performance } from '@/src/setup/utils/Performance';
import { WindowUtils } from '@/src/setup/utils/window.utils';
import { Renderer, Camera, Scene } from '@/src/setup';
import { MyGLTFLoader, MyTextureLoader } from '@/src/setup/utils/Loader';
import * as THREE from 'three';
import GUI from 'lil-gui';
import { Octree } from 'three/examples/jsm/math/Octree.js';
import { Player } from '@/src/first-person/Player';
import { FlashLight } from '@/src/first-person/components/FlashLight';

(async function setup() {
  const aGLTF = new MyGLTFLoader();
  const aIMAGE = new MyTextureLoader();
  const [duckGLTF, groundTexture, boxTexture, skyGLTF, desertEagleGLTF] = await Promise.all([
    aGLTF.load('3d/duck.gltf'),
    aIMAGE.load('images/checker.png'),
    aIMAGE.load('images/box.png'),
    aGLTF.load('3d/sky_pano/scene.gltf'),
    aGLTF.load('3d/desert-eagle-with-hands/scene.gltf'),
  ]);

  const gui = new GUI();
  const world = new Octree();
  const renderer = new Renderer();
  const camera = new Camera();
  const scene = new Scene(gui, world);

  const flashlight = new FlashLight(gui);
  const ducky = duckGLTF.scene;
  const player = new Player(camera, world, desertEagleGLTF, flashlight);

  scene
    .addLight()
    .addGround(groundTexture)
    .addSky(skyGLTF)
    .addAxisHelper()
    .addGridHelper()
    .addStairs(boxTexture)
    .addBoxes(boxTexture, 64);

  gui
    .addFolder('Rubber Ducky')
    .add(ducky.rotation, 'z')
    .step(Math.PI / 180)
    .min(0)
    .max(Math.PI)
    .name('rotationZ')
    .show();

  const material = new THREE.MeshStandardMaterial({ wireframe: true, color: '#AA0033' });
  const geometry = new THREE.SphereGeometry(2, 32, 32);
  const sphere = new THREE.Mesh(geometry, material);

  scene.add(sphere, ducky, desertEagleGLTF.scene, flashlight, flashlight.target);

  world.fromGraphNode(sphere);
  ducky.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      world.fromGraphNode(child);
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  {
    const FPS = 60;
    const DELAY_MS = 1000 / FPS; // millis
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
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();
      if (timestamp.delta >= DELAY_MS) {
        player.update(delta);
        if (camera.position.y <= -25) player.reset();

        ducky.position.x = Math.sin(elapsedTime) * Math.PI;
        ducky.position.z = Math.cos(elapsedTime) * Math.PI;
        ducky.rotation.y = elapsedTime;

        timestamp.update();
        renderer.render(scene, camera);
      }

      requestAnimationFrame(gameLoop);
      performance.end();
    })();
  }
})().catch(console.error);
