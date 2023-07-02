import GUI from 'lil-gui';
import Camera from '@/src/setup/Camera';
import { Weapon } from '@/src/first-person/weapons/Weapon';
import { DesertEagle } from '@/src/first-person/weapons/DesertEagle';
import { Assets } from '@/src/first-person/Player';
import { PointLight, Scene } from 'three';

export class WeaponController {
  public readonly scene: Scene;
  public readonly camera: Camera;
  public readonly backlight: PointLight;
  private readonly weapons: Weapon[];
  private readonly weaponIndex: number;

  constructor(private readonly gui: GUI, assets: Assets) {
    this.weapons = [new DesertEagle(assets.pistol)];
    this.weaponIndex = 0;

    this.scene = new Scene();
    this.camera = new Camera(5);
    this.backlight = this.createLight();

    // No need to add the camera to the scene
    this.scene.add(this.backlight);
    for (const asset of Object.values(assets)) {
      this.scene.add(asset.scene);
    }
  }

  private get weapon() {
    return this.weapons[this.weaponIndex];
  }

  shoot() {
    this.weapon.shoot();
  }

  reload() {
    this.weapon.reload();
  }

  update(delta: number) {
    this.weapon.update(delta);
  }

  private createLight() {
    const folder = this.gui.addFolder('Light');
    const light = new PointLight('#ffffff', 3);
    light.position.set(0, 10, 0);

    folder.add(light, 'distance', 0, 20, 0.01);
    folder.add(light, 'decay', 0, 20, 0.01);
    folder.add(light, 'intensity', 0, 20, 0.01);
    folder.addColor(light, 'color');
    folder.add(light.position, 'x', -10, 10, 0.01);
    folder.add(light.position, 'y', -10, 10, 0.01);
    folder.add(light.position, 'z', -10, 10, 0.01);

    return light;
  }
}
