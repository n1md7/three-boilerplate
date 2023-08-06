import GUI from 'lil-gui';
import Camera from '@/src/setup/Camera';
import { Weapon } from '@/src/first-person/weapons/Weapon';
import { DesertEagle } from '@/src/first-person/weapons/DesertEagle';
import { PointLight, Scene } from 'three';
import { M60 } from '@/src/first-person/weapons/M60';
import { BulletController } from '@/src/first-person/controllers/BulletController';
import * as CANNON from 'cannon-es';
import { Assets } from '@/src/assets';

export class WeaponController {
  // Weapon own 2nd scene
  public readonly scene: Scene;
  // Weapon own 2nd camera
  public readonly camera: Camera;
  public readonly backlight: PointLight;
  private readonly bulletController: BulletController;
  private readonly weapons: Weapon[];
  private weaponIndex: number;

  public triggerIsPressed = false;

  constructor(private readonly gui: GUI, playerScene: Scene, playerCamera: Camera, physicsWorld: CANNON.World) {
    this.weapons = [];
    this.weaponIndex = 0;
    this.bulletController = new BulletController(playerScene, playerCamera, physicsWorld);

    this.scene = new Scene();
    this.camera = new Camera(55, 65);
    this.backlight = this.createLight();
  }

  setup() {
    this.weapons.push(new DesertEagle(Assets.Weapons.DesertEagle, this.gui.addFolder('Desert Eagle')));
    this.weapons.push(new M60(Assets.Weapons.M60, this.gui.addFolder('M60')));

    // No need to add the camera to the scene
    this.scene.add(this.backlight);
    this.scene.add(Assets.Weapons.DesertEagle.scene);
    this.scene.add(Assets.Weapons.M60.scene);
    this.hideWeapons();
    this.weapon.show();
  }

  private get weapon() {
    return this.weapons[this.weaponIndex];
  }

  private get bullet() {
    return this.bulletController;
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

  startShoot() {
    this.triggerIsPressed = true;
  }

  stopShoot() {
    this.triggerIsPressed = false;
  }

  private shoot() {
    if (this.weapon.shoot()) this.bullet.shoot(this.weapon);
    if (this.weapon.isSemiAutomatic) this.triggerIsPressed = false;
  }

  reload() {
    return this.weapon.reload();
  }

  adjustBy(camera: Camera): void {
    this.weapon.adjustBy(camera);
  }

  update(delta: number) {
    if (this.triggerIsPressed) this.shoot();
    this.weapon.update(delta);
    this.bullet.update(this.weapon);
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
