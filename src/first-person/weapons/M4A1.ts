import { Weapon } from '@/src/first-person/weapons/Weapon';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { Vector3 } from 'three';
import GUI from 'lil-gui';

export class M4A1 extends Weapon {
  protected weaponOffset = new Vector3(0.32, 0.1, 0.3);
  protected weaponRotation = new Vector3(0, Math.PI, 0);

  constructor(weapon: GLTF, gui: GUI) {
    super(weapon, {
      fire: 'h2_skeleton|fire2',
      reload: 'h2_skeleton|reload',
      idle: 'h2_skeleton|idle',
      walk: 'h2_skeleton|idle2',
    });

    this.setScale(0.15);
    this.setFireRate(800);
    this.setDamageRange(50);
    this.setReloadTime(2500);
    this.setMagazineSize(25);
    this.setBullets(25);

    this.addGui(gui);
  }
}
