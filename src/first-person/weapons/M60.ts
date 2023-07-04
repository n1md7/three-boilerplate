import { Weapon } from '@/src/first-person/weapons/Weapon';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { Vector3 } from 'three';
import GUI from 'lil-gui';

export class M60 extends Weapon {
  protected weaponOffset = new Vector3(0.7684, -0.071, -1.19);
  protected weaponRotation = new Vector3(0, Math.PI, 0);

  constructor(weapon: GLTF, gui: GUI) {
    super(weapon, {
      fire: 'ammo_skeleton|fire1',
      reload: 'ammo_skeleton|reload',
      idle: 'ammo_skeleton|idle',
      walk: 'ammo_skeleton|idle',
    });

    this.setScale(0.15);
    this.setFireRate(300);
    this.setEffectiveRange(150);
    this.setReloadTime(3500);
    this.setMagazineSize(100);
    this.setBullets(34); // 34 bullets in the chamber 🙃

    this.bulletColor = 0x00ff00;
    this.bulletSize = 0.2;

    this.addGui(gui);
  }
}
