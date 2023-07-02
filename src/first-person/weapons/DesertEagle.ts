import { Weapon } from '@/src/first-person/weapons/Weapon';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { Vector3 } from 'three';

export class DesertEagle extends Weapon {
  constructor(weapon: GLTF) {
    super(weapon, {
      fire: 'deagle_skeleton|shoot1',
      reload: 'deagle_skeleton|reload',
      idle: 'deagle_skeleton|idle1',
      walk: 'deagle_skeleton|idle1', // Missing dedicated animation
    });

    this.setScale(1.8);
    this.setFireRate(800);
    this.setDamageRange(50);
    this.setReloadTime(1500);
    this.setMagazineSize(7);
  }

  protected weaponOffset = new Vector3(0.32, -0.38, -1.1);
}