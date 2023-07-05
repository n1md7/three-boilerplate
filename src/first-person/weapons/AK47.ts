import { Weapon } from '@/src/first-person/weapons/Weapon';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { Vector3 } from 'three';
import GUI from 'lil-gui';

export class AK47 extends Weapon {
  protected weaponOffset = new Vector3(0.62, -2, -0.9);
  protected weaponRotation = new Vector3(0, Math.PI, 0);

  constructor(weapon: GLTF, gui: GUI) {
    // Missing dedicated animations 😔
    super(weapon, {
      fire: 'ak47_skeleton|ak47_skeleton|reload|ak47_skeleton|reload',
      reload: 'ak47_skeleton|ak47_skeleton|reload|ak47_skeleton|reload',
      idle: 'ak47_skeleton|ak47_skeleton|reload|ak47_skeleton|reload',
      walk: 'ak47_skeleton|ak47_skeleton|reload|ak47_skeleton|reload',
    });

    this.setScale(0.15);
    this.setFireRate(600);
    this.setEffectiveRange(250);
    this.setReloadTime(2500);
    this.setMagazineSize(30);

    this.addGui(gui);
  }
}