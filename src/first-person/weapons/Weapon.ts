import { AnimationMixer, Vector3 } from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Bullet } from '@/src/first-person/components/Bullet';
import { TimedAnimation } from '@/src/first-person/weapons/TimedAnimation';
import Camera from '@/src/setup/Camera';
import GUI from 'lil-gui';

type AnimationName = 'fire' | 'reload' | 'idle' | 'walk';
type FireMode = 'auto' | 'semi';
type AnimationNameMap = Record<AnimationName, string>;
type GuiNumberProperties = {
  min: number;
  max: number;
  step: number;
  value: number;
};
type GunConfiguration = {
  fireRate: GuiNumberProperties;
  reloadTime: GuiNumberProperties;
  magazineSize: GuiNumberProperties;
  bullets: GuiNumberProperties;
};
type GunProperties = {
  fireRate: number;
  reloadTime: number;
  magazineSize: number;
  bullets: number;
  type: FireMode;
};

export abstract class Weapon {
  /**
   * What kind of bullets are being shot.
   *
   * It is needed for size and force it is generating against targets
   */
  readonly bullet: Bullet;

  private weaponOffset: Vector3;
  private weaponRotation: Vector3;

  private readonly weapon: GLTF;

  // Animations are wrapped in TimedAnimation so their playback duration always
  // matches the requested fire-rate / reload-time, regardless of the underlying
  // GLTF clip's natural length.
  private readonly shootAnimation: TimedAnimation;
  private readonly reloadAnimation: TimedAnimation;
  private readonly idleAnimation: TimedAnimation;
  private readonly walkAnimation: TimedAnimation;

  private readonly animationMixer: AnimationMixer;

  // Tunables — encapsulated. Mutate via the public setX() methods. lil-gui
  // binds to a getter/setter proxy built in addGui, so the panel works
  private type: FireMode = 'semi';
  private lastShot = Date.now();
  private reloading = false;

  private fireRate = 1000; // ms between shots
  private reloadTime = 3000; // ms
  private magazineSize = 7;
  private bullets = 7;

  protected constructor(
    weapon: GLTF,
    gui: GUI,
    animationNames: AnimationNameMap,
    gunConfiguration: GunConfiguration,
    bullet: Bullet,
    weaponOffset: Vector3,
    weaponRotation: Vector3,
  ) {
    this.weapon = weapon;
    this.bullet = bullet;
    this.weaponOffset = weaponOffset;
    this.weaponRotation = weaponRotation;
    this.animationMixer = new AnimationMixer(weapon.scene);

    this.shootAnimation = new TimedAnimation(this.getAnimation(animationNames.fire));
    this.reloadAnimation = new TimedAnimation(this.getAnimation(animationNames.reload));
    this.idleAnimation = new TimedAnimation(this.getAnimation(animationNames.idle));
    this.walkAnimation = new TimedAnimation(this.getAnimation(animationNames.walk));

    // Seed the live fields from the supplied configuration. Without this the
    // class-level defaults (fireRate=1000, etc.) would silently win until the
    // user moved a slider — i.e. the GUI would display the configured value
    // but the gun would behave with the hardcoded default.
    this.fireRate = gunConfiguration.fireRate.value;
    this.reloadTime = gunConfiguration.reloadTime.value;
    this.magazineSize = gunConfiguration.magazineSize.value;
    this.bullets = gunConfiguration.bullets.value;

    // Bind every setter that lil-gui will invoke as a bare function — without
    // this, `this` would be undefined inside the setter (strict mode) and the
    // assignment would silently throw on slider change.
    this.setFireRate = this.setFireRate.bind(this);
    this.setReloadTime = this.setReloadTime.bind(this);
    this.setMagazineSize = this.setMagazineSize.bind(this);

    this.configure(gui, gunConfiguration);
  }

  get isSemiAutomatic(): boolean {
    return this.type === 'semi';
  }

  get isAutomatic(): boolean {
    return this.type === 'auto';
  }

  get effectiveDistance(): number {
    return this.bullet.distance / 2;
  }

  hide(): void {
    this.weapon.scene.visible = false;
  }

  show(): void {
    this.weapon.scene.visible = true;
  }

  shoot(): boolean {
    if (this.reloading) return false;
    if (this.bullets <= 0) return this.reload();
    if (this.getShootDelta() < this.fireRate) return false;

    this.bullets--;
    this.lastShot = Date.now();

    // Recompute timing right at play-time so the animation lasts EXACTLY
    // the current fire rate. Any GUI tweak to fireRate is honoured on the
    // very next shot without needing manual re-sync.
    this.stopAnimations();
    this.shootAnimation.playFor(this.fireRate);

    return true;
  }

  reload(): boolean {
    if (this.reloading) return false;
    if (this.bullets === this.magazineSize) return false;

    this.reloading = true;
    this.stopAnimations();
    // Reload animation retimes to whatever the configured reload duration is.
    this.reloadAnimation.playFor(this.reloadTime);

    setTimeout(() => {
      this.bullets = this.magazineSize;
      this.reloading = false;
    }, this.reloadTime);

    return true;
  }

  update(delta: number): void {
    this.animationMixer.update(delta);
  }

  setBullets(bullets: number) {
    this.bullets = bullets;
  }

  setScale(scale: number) {
    this.weapon.scene.scale.set(scale, scale, scale);
  }

  setType(type: FireMode) {
    this.type = type;
  }

  setMagazineSize(magazineSize: number) {
    this.magazineSize = magazineSize;
  }

  /**
   * Length of the reload animation in milliseconds. Stored only — actual
   * timeScale is recomputed every time the animation plays, so calling this
   * mid-reload doesn't affect the in-flight animation but will affect the next.
   */
  setReloadTime(reloadTime: number) {
    this.reloadTime = reloadTime;
  }

  /** Delay between shots, ms. Lower = faster. Animation retimes to match. */
  setFireRate(fireRate: number) {
    this.fireRate = fireRate;
  }

  adjustBy(camera: Camera): void {
    const offset = this.weaponOffset.clone();
    offset.applyQuaternion(camera.quaternion);

    this.weapon.scene.position.copy(camera.position).add(offset);
    this.weapon.scene.rotation.copy(camera.rotation);

    this.weapon.scene.rotateX(this.weaponRotation.x);
    this.weapon.scene.rotateY(this.weaponRotation.y);
    this.weapon.scene.rotateZ(this.weaponRotation.z);
  }

  protected getShootDelta() {
    return Date.now() - this.lastShot;
  }

  private configure(gui: GUI, props: GunConfiguration): void {
    this.configureGuiProperties(gui, props);

    this.configureGuiOffset(gui);
    this.configureRotation(gui);
    this.configureScale(gui);

    gui.close();
  }

  private configureGuiProperties(gui: GUI, props: GunConfiguration) {
    const properties = gui.addFolder('Properties');
    const state: GunProperties = {
      bullets: 0,
      type: 'semi',
      fireRate: props.fireRate.value,
      reloadTime: props.reloadTime.value,
      magazineSize: props.magazineSize.value,
    };

    properties
      .add(state, 'fireRate', props.fireRate.min, props.fireRate.max, props.fireRate.step)
      .name('Fire rate (ms)')
      .onChange(this.setFireRate);

    properties
      .add(state, 'reloadTime', props.reloadTime.min, props.reloadTime.max, props.reloadTime.step)
      .name('Reload Time (ms)')
      .onChange(this.setReloadTime);

    properties
      .add(state, 'magazineSize', props.magazineSize.min, props.magazineSize.max, props.magazineSize.step)
      .name('Magazine size')
      .onChange(this.setMagazineSize);

    return properties;
  }

  private configureGuiOffset(gui: GUI) {
    const offset = gui.addFolder('Offset');

    const state = {
      x: this.weaponOffset.x,
      y: this.weaponOffset.y,
      z: this.weaponOffset.z,
    };

    offset
      .add(state, 'x')
      .step(0.01)
      .min(-8)
      .max(8)
      .onChange((x: number) => (this.weaponOffset.x = x));
    offset
      .add(state, 'y')
      .step(0.01)
      .min(-8)
      .max(8)
      .onChange((y: number) => (this.weaponOffset.y = y));
    offset
      .add(state, 'z')
      .step(0.01)
      .min(-8)
      .max(8)
      .onChange((z: number) => (this.weaponOffset.z = z));

    return offset;
  }

  private configureRotation(gui: GUI) {
    const rotation = gui.addFolder('Rotation');

    const state = {
      x: this.weaponRotation.x,
      y: this.weaponRotation.y,
      z: this.weaponRotation.z,
    };

    rotation
      .add(state, 'x')
      .step(0.01)
      .min(-Math.PI)
      .max(7)
      .onChange((x: number) => (this.weaponRotation.x = x));
    rotation
      .add(state, 'y')
      .step(0.01)
      .min(-Math.PI)
      .max(7)
      .onChange((y: number) => (this.weaponRotation.y = y));
    rotation
      .add(state, 'z')
      .step(0.01)
      .min(-Math.PI)
      .max(7)
      .onChange((z: number) => (this.weaponRotation.z = z));

    return rotation;
  }

  private configureScale(gui: GUI) {
    const scale = gui.addFolder('Scale');

    scale.add(this.weapon.scene.scale, 'x').step(0.01).min(0.1).max(4);
    scale.add(this.weapon.scene.scale, 'y').step(0.01).min(0.1).max(4);
    scale.add(this.weapon.scene.scale, 'z').step(0.01).min(0.1).max(4);

    return scale;
  }

  private stopAnimations() {
    this.shootAnimation.stop();
    this.reloadAnimation.stop();
    this.idleAnimation.stop();
    this.walkAnimation.stop();
  }

  private getAnimation(name: string) {
    const animation = this.weapon.animations.find((a) => a.name === name);

    if (!animation) throw new Error(`Animation "${name}" not found`);

    return this.animationMixer.clipAction(animation);
  }
}
