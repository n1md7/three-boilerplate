import { Weapon } from '@/src/first-person/weapons/Weapon';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { Vector3 } from 'three';
import GUI from 'lil-gui';

export class M82 extends Weapon {
  protected weaponOffset = new Vector3(-1.04, -2.49, -5);
  protected weaponRotation = new Vector3(-1.1, 1.67, 0.08);

  constructor(weapon: GLTF, gui: GUI) {
    super(weapon, {
      fire: 'm82_skeleton|shoot',
      reload: 'm82_skeleton|reload',
      idle: 'm82_skeleton|idle',
      walk: 'm82_skeleton|idle',
    });

    this.setScale(0.16);
    this.setFireRate(600);
    this.setDamageRange(50);
    this.setReloadTime(1500);
    this.setMagazineSize(7);
    this.setBullets(7);

    this.addGui(gui);
  }
}
