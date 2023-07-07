import { Weapon } from '@/src/first-person/weapons/Weapon';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { Vector3 } from 'three';
import GUI from 'lil-gui';
import { Bullet } from '@/src/first-person/components/Bullet';

export class MP412 extends Weapon {
  protected weaponOffset = new Vector3(0.98, -0.81, -0.25);
  protected weaponRotation = new Vector3(0.47, 3.25, 0.22);

  public readonly bullet = new Bullet({
    speed: 0.9,
    size: 0.07,
    distance: 60,
    color: '#ff00f0',
  });
  constructor(weapon: GLTF, gui: GUI) {
    super(weapon, {
      fire: 'h2_skeleton|shoot_right1',
      reload: 'h2_skeleton|reload',
      idle: 'h2_skeleton|idle',
      walk: 'h2_skeleton|idle',
    });

    this.setScale(1.8);
    this.setFireRate(600);
    this.setReloadTime(1500);
    this.setMagazineSize(7);
    this.setBullets(7);

    this.addGui(gui);
  }
}
