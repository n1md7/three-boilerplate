import GUI from 'lil-gui';
import Camera from '@/src/setup/Camera';
import { Weapon } from '@/src/first-person/weapons/Weapon';
import { DesertEagle } from '@/src/first-person/weapons/DesertEagle';
import { Assets } from '@/src/first-person/Player';
import { DirectionalLight, Scene } from 'three';

export class WeaponController {
  private readonly weapons: Weapon[];
  private readonly weaponIndex: number;

  public readonly scene: Scene;
  public readonly camera: Camera;

  public light!: DirectionalLight;

  constructor(private readonly gui: GUI, assets: Assets) {
    this.weapons = [new DesertEagle(assets.pistol)];
    this.weaponIndex = 0;

    this.scene = new Scene();
    this.camera = new Camera();
    this.addLight();
    this.addCamera();

    for (const asset of Object.values(assets)) {
      this.scene.add(asset.scene);
    }
  }

  get weapon() {
    return this.weapons[this.weaponIndex];
  }

  shoot() {
    this.weapon.shoot();
  }

  private addLight() {
    const folder = this.gui.addFolder('Light');
    this.light = new DirectionalLight(0xffffff, 2);
    this.light.position.set(0, 2, 1);

    folder.add(this.light, 'intensity', 0, 20, 0.01);
    folder.addColor(this.light, 'color');
    folder.add(this.light.position, 'x', -10, 10, 0.01);
    folder.add(this.light.position, 'y', -10, 10, 0.01);
    folder.add(this.light.position, 'z', -10, 10, 0.01);

    this.scene.add(this.light);
  }

  private addCamera() {
    this.camera.position.set(0, 0, 2);
    this.scene.add(this.camera);
  }

  update(delta: number) {
    this.weapon.update(delta);
  }
}
