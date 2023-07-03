import GUI from 'lil-gui';
import Camera from '@/src/setup/Camera';
import { Weapon } from '@/src/first-person/weapons/Weapon';
import { DesertEagle } from '@/src/first-person/weapons/DesertEagle';
import { Assets } from '@/src/first-person/Player';
import { PointLight, Scene } from 'three';
import { M4A1 } from '@/src/first-person/weapons/M4A1';
import { AK47 } from '@/src/first-person/weapons/AK47';
import { M60 } from '@/src/first-person/weapons/M60';
import { M82 } from '@/src/first-person/weapons/M82';
import { MP412 } from '@/src/first-person/weapons/MP412';

export class WeaponController {
  public readonly scene: Scene;
  public readonly camera: Camera;
  public readonly backlight: PointLight;
  private readonly weapons: Weapon[];
  private weaponIndex: number;

  constructor(private readonly gui: GUI, assets: Assets) {
    this.weapons = [
      new DesertEagle(assets.DesertEagle, gui.addFolder('Desert Eagle')),
      new M4A1(assets.M4A1, gui.addFolder('M4A1')),
      new AK47(assets.AK47, gui.addFolder('AK47')),
      new M60(assets.M60, gui.addFolder('M60')),
      new MP412(assets.MP412, gui.addFolder('MP412')),
      new M82(assets.M82, gui.addFolder('M82')),
    ];
    this.weaponIndex = 0;

    this.scene = new Scene();
    this.camera = new Camera(55);
    this.backlight = this.createLight();

    // No need to add the camera to the scene
    this.scene.add(this.backlight);
    for (const asset of Object.values(assets)) {
      this.scene.add(asset.scene);
    }
    this.hideWeapons();
    this.weapon.show();
  }

  private get weapon() {
    return this.weapons[this.weaponIndex];
  }

  private hideWeapons() {
    for (const weapon of this.weapons) {
      weapon.hide();
    }
  }

  setWeapon(index: number) {
    if (!this.weapons[index]) return;
    this.weapon.hide();
    this.weaponIndex = index;
    this.weapon.show();
  }

  shoot() {
    return this.weapon.shoot();
  }

  reload() {
    return this.weapon.reload();
  }

  adjustBy(camera: Camera): void {
    this.weapon.adjustBy(camera);
  }

  update(delta: number) {
    this.weapon.update(delta);
  }

  private createLight() {
    const gui = this.gui.addFolder('Light');
    const light = new PointLight('#ffffff', 3);
    light.position.set(0, 10, 0);

    gui.add(light, 'distance', 0, 20, 0.01);
    gui.add(light, 'decay', 0, 20, 0.01);
    gui.add(light, 'intensity', 0, 20, 0.01);
    gui.addColor(light, 'color');
    gui.add(light.position, 'x', -10, 10, 0.01);
    gui.add(light.position, 'y', -10, 10, 0.01);
    gui.add(light.position, 'z', -10, 10, 0.01);
    gui.close();

    return light;
  }
}
