import { Weapon } from '@/src/first-person/weapons/Weapon';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

export class DesertEagle extends Weapon {
  constructor(weapon: GLTF) {
    super(weapon, {
      fire: 'deagle_skeleton|shoot1',
      reload: 'deagle_skeleton|reload',
      idle: 'deagle_skeleton|idle1',
      walk: 'deagle_skeleton|idle1', // Missing dedicated animation
    });

    this.setFireRate(800);
    this.setDamageRange(50);
    this.setReloadTime(1500);
    this.setMagazineSize(7);
  }
}
