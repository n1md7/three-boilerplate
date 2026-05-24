import { Weapon } from '@/src/first-person/weapons/Weapon';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Vector3 } from 'three';
import GUI from 'lil-gui';
import { Bullet } from '@/src/first-person/components/Bullet';

export class M60 extends Weapon {
  constructor(weapon: GLTF, gui: GUI) {
    super(
      weapon,
      gui.addFolder('M60'),
      {
        fire: 'ammo_skeleton|fire1',
        reload: 'ammo_skeleton|reload',
        idle: 'ammo_skeleton|idle',
        walk: 'ammo_skeleton|idle',
      },
      {
        fireRate: { min: 128, max: 1024, step: 1, value: 160 },
        reloadTime: { min: 1000, max: 5000, step: 10, value: 3500 },
        magazineSize: { min: 30, max: 240, step: 10, value: 100 },
        bullets: { min: 0, max: 14, step: 1, value: 7 },
      },
      new Bullet({
        speed: 0.9,
        size: 7.62 / 1000, // 7.62mm
        distance: 160,
        damage: 16, // using as a force multiplier
        color: '#73fd02',
      }),
      new Vector3(0.7684, -0.29, -0.5),
      new Vector3(0, Math.PI, 0),
    );

    this.setScale(0.15);
    this.setType('auto');
  }
}
