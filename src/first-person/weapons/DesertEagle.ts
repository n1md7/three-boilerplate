import { Bullet } from '@/src/first-person/components/Bullet';
import { Weapon } from '@/src/first-person/weapons/Weapon';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Vector3 } from 'three';
import GUI from 'lil-gui';

export class DesertEagle extends Weapon {
  constructor(weapon: GLTF, gui: GUI) {
    super(
      weapon,
      gui.addFolder('Desert Eagle'),
      {
        fire: 'deagle_skeleton|shoot1',
        reload: 'deagle_skeleton|reload',
        idle: 'deagle_skeleton|idle1',
        walk: 'deagle_skeleton|idle1', // Missing dedicated animation
      },
      {
        fireRate: { min: 64, max: 1024, step: 1, value: 300 },
        reloadTime: { min: 500, max: 3000, step: 10, value: 1500 },
        magazineSize: { min: 7, max: 14, step: 1, value: 7 },
        bullets: { min: 0, max: 14, step: 1, value: 7 },
      },
      new Bullet({
        speed: 0.05,
        size: 12.7 / 1000, // 12.7mm, 1 block is equivalent to 1 meter, 1 block = 1 meter
        distance: 50,
        damage: 64, // using as a force multiplier
        color: '#faed06',
      }),
      new Vector3(0.48, -0.16, -1.01),
      new Vector3(0.061, 3.23, -0.02),
    );
    this.setScale(1.8);
    this.setType('semi');
  }
}
