import { Weapon } from '@/src/first-person/weapons/Weapon';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { Vector3 } from 'three';
import GUI from 'lil-gui';
import { Bullet } from '@/src/first-person/components/Bullet';

export class M60 extends Weapon {
  protected weaponOffset = new Vector3(0.7684, -0.071, -1.19);
  protected weaponRotation = new Vector3(0, Math.PI, 0);

  public readonly bullet = new Bullet({
    speed: 0.9,
    size: 1 / 8,
    distance: 160,
    color: '#afb0ff',
  });
  constructor(weapon: GLTF, gui: GUI) {
    super(weapon, {
      fire: 'ammo_skeleton|fire1',
      reload: 'ammo_skeleton|reload',
      idle: 'ammo_skeleton|idle',
      walk: 'ammo_skeleton|idle',
    });

    this.setScale(0.15);
    this.setFireRate(300);
    this.setReloadTime(3500);
    this.setMagazineSize(100);
    this.setBullets(34);

    this.addGui(gui);
  }
}
