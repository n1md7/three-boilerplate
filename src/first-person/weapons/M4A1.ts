import { Weapon } from '@/src/first-person/weapons/Weapon';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { Vector3 } from 'three';

export class M4A1 extends Weapon {
  constructor(weapon: GLTF) {
    super(weapon, {
      fire: 'h2_skeleton|fire1',
      reload: 'h2_skeleton|reload',
      idle: 'h2_skeleton|idle',
      walk: 'h2_skeleton|idle2',
    });

    this.setScale(0.15);
    this.setFireRate(800);
    this.setDamageRange(50);
    this.setReloadTime(1500);
    this.setMagazineSize(7);
  }

  protected weaponOffset = new Vector3(0.32, 0.1, 0.3);
}
