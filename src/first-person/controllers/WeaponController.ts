import GUI from 'lil-gui';
import Camera from '@/src/setup/Camera';
import { Weapon } from '@/src/first-person/weapons/Weapon';
import { DesertEagle } from '@/src/first-person/weapons/DesertEagle';
import { AmbientLight, HemisphereLight, PointLight, Scene, Vector3 } from 'three';
import { M60 } from '@/src/first-person/weapons/M60';
import { BulletController } from '@/src/first-person/controllers/BulletController';
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

  private triggerPressed = false;
  private readonly muzzleFlash: PointLight;
  private muzzleFlashUntil = 0; // timestamp ms when the current flash ends

  /** Player camera kept so we can position the muzzle flash each frame in
   *  front of whatever direction the player is currently looking. */
  private readonly playerCamera: Camera;
  /** Reused buffer to avoid per-frame allocation in positionMuzzleFlash. */
  private readonly muzzleForward = new Vector3();

  get triggerIsPressed(): boolean {
    return this.triggerPressed;
  }

  constructor(
    private readonly gui: GUI,
    playerScene: Scene,
    playerCamera: Camera,
  ) {
    this.weapons = [];
    this.weaponIndex = 0;
    this.playerCamera = playerCamera;
    this.bulletController = new BulletController(playerScene, playerCamera);

    this.scene = new Scene();
    this.camera = new Camera(55, 65);
    this.backlight = this.createLight();

    // Muzzle flash — a high-intensity warm point light. Off by default (intensity 0);
    // briefly spiked when shooting and repositioned each frame in front of the
    // player camera so it tracks where the gun is currently aimed.
    this.muzzleFlash = new PointLight('#ffd089', 0, 6, 2);
    this.scene.add(this.muzzleFlash);
  }

  setup() {
    this.weapons.push(new DesertEagle(Assets.Weapons.DesertEagle, this.gui.addFolder('Desert Eagle')));
    this.weapons.push(new M60(Assets.Weapons.M60, this.gui.addFolder('M60')));

    // Weapon scene needs its own ambient + hemisphere fill so the model is
    // visible from every angle (physical light units make a single PointLight
    // too directional and the back-side reads as black).
    const ambient = new AmbientLight('#ffffff', 0.8);
    const hemi = new HemisphereLight('#e6f0ff', '#3a2a1a', 1.2);

    this.scene.add(this.backlight, ambient, hemi);
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
    this.triggerPressed = true;
  }

  stopShoot() {
    this.triggerPressed = false;
  }

  private shoot() {
    if (this.weapon.shoot()) {
      this.bullet.shoot(this.weapon);
      this.spawnMuzzleFlash();
    }
    if (this.weapon.isSemiAutomatic) this.triggerPressed = false;
  }

  private spawnMuzzleFlash() {
    // Spike the muzzle light to a high intensity and let update() decay it.
    this.muzzleFlash.intensity = 80;
    this.muzzleFlashUntil = Date.now() + 60; // visible for ~1 frame at 60fps
  }

  private updateMuzzleFlash() {
    if (this.muzzleFlash.intensity === 0) return;

    // Track the player's look direction so the flash sits in front of the
    // gun regardless of which way the camera is currently facing.
    this.playerCamera.getWorldDirection(this.muzzleForward);
    this.muzzleFlash.position.copy(this.playerCamera.position).addScaledVector(this.muzzleForward, 0.6);
    // Drop the light a touch so it reads at the barrel, not the eyeline.
    this.muzzleFlash.position.y -= 0.05;

    if (Date.now() >= this.muzzleFlashUntil) {
      this.muzzleFlash.intensity = 0;
      return;
    }
    // Fast falloff while the flash is alive — gives it the "pop" feel.
    this.muzzleFlash.intensity *= 0.45;
    if (this.muzzleFlash.intensity < 0.5) this.muzzleFlash.intensity = 0;
  }

  reload() {
    return this.weapon.reload();
  }

  adjustBy(camera: Camera): void {
    this.weapon.adjustBy(camera);
  }

  update(delta: number) {
    if (this.triggerPressed) this.shoot();
    this.updateMuzzleFlash();
    this.weapon.update(delta);
    this.bullet.update(this.weapon);
  }

  private createLight() {
    const gui = this.gui.addFolder('Backlight');
    // Physical light units — old value of 3 was effectively invisible.
    const light = new PointLight('#ffffff', 120, 30, 1.5);
    light.position.set(0, 10, 0);

    gui.add(light, 'distance', 0, 50, 0.5);
    gui.add(light, 'decay', 0, 4, 0.05);
    gui.add(light, 'intensity', 0, 400, 0.5);
    gui.addColor(light, 'color');
    gui.add(light.position, 'x', -10, 10, 0.01);
    gui.add(light.position, 'y', -10, 10, 0.01);
    gui.add(light.position, 'z', -10, 10, 0.01);
    gui.close();

    return light;
  }
}
