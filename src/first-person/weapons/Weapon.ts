import { AnimationMixer, Vector3 } from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Bullet } from '@/src/first-person/components/Bullet';
import { TimedAnimation } from '@/src/first-person/weapons/TimedAnimation';
import Camera from '@/src/setup/Camera';
import GUI from 'lil-gui';

export type AnimationName = 'fire' | 'reload' | 'idle' | 'walk';
export type FireMode = 'auto' | 'semi';
export type AnimationNameMap = Record<AnimationName, string>;

export abstract class Weapon {
  public abstract readonly bullet: Bullet;

  // Animations are wrapped in TimedAnimation so their playback duration always
  // matches the requested fire-rate / reload-time, regardless of the underlying
  // GLTF clip's natural length.
  protected readonly shootAnimation: TimedAnimation;
  protected readonly reloadAnimation: TimedAnimation;
  protected readonly idleAnimation: TimedAnimation;
  protected readonly walkAnimation: TimedAnimation;

  protected readonly animationMixer: AnimationMixer;
  protected abstract weaponOffset: Vector3;
  protected abstract weaponRotation: Vector3;

  // Tunables — encapsulated. Mutate via the public setX() methods. lil-gui
  // binds to a getter/setter proxy built in addGui, so the panel works
  private _type: FireMode = 'semi';
  private lastShot = Date.now();
  private reloading = false;

  protected constructor(
    protected readonly weapon: GLTF,
    animationNames: AnimationNameMap,
  ) {
    this.animationMixer = new AnimationMixer(weapon.scene);

    this.shootAnimation = new TimedAnimation(this.getAnimation(animationNames.fire));
    this.reloadAnimation = new TimedAnimation(this.getAnimation(animationNames.reload));
    this.idleAnimation = new TimedAnimation(this.getAnimation(animationNames.idle));
    this.walkAnimation = new TimedAnimation(this.getAnimation(animationNames.walk));
  }

  // without these fields ever escaping the class.
  private _fireRate = 1000; // ms between shots

  // Read-only public accessors.
  get fireRate(): number {
    return this._fireRate;
  }

  private _reloadTime = 3000; // ms

  get reloadTime(): number {
    return this._reloadTime;
  }

  private _magazineSize = 7;

  get magazineSize(): number {
    return this._magazineSize;
  }

  private _bullets = 7;

  get bullets(): number {
    return this._bullets;
  }

  get isSemiAutomatic(): boolean {
    return this._type === 'semi';
  }

  get isAutomatic(): boolean {
    return this._type === 'auto';
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
    if (this._bullets <= 0) return this.reload();
    if (this.getShootDelta() < this._fireRate) return false;

    this._bullets--;
    this.lastShot = Date.now();

    // Recompute timing right at play-time so the animation lasts EXACTLY
    // the current fire rate. Any GUI tweak to fireRate is honoured on the
    // very next shot without needing manual re-sync.
    this.stopAnimations();
    this.shootAnimation.playFor(this._fireRate);

    return true;
  }

  reload(): boolean {
    if (this.reloading) return false;
    if (this._bullets === this._magazineSize) return false;

    this.reloading = true;
    this.stopAnimations();
    // Reload animation retimes to whatever the configured reload duration is.
    this.reloadAnimation.playFor(this._reloadTime);

    setTimeout(() => {
      this._bullets = this._magazineSize;
      this.reloading = false;
    }, this._reloadTime);

    return true;
  }

  update(delta: number): void {
    this.animationMixer.update(delta);
  }

  setBullets(bullets: number) {
    this._bullets = bullets;
  }

  setScale(scale: number) {
    this.weapon.scene.scale.set(scale, scale, scale);
  }

  setType(type: FireMode) {
    this._type = type;
  }

  setMagazineSize(magazineSize: number) {
    this._magazineSize = magazineSize;
  }

  /**
   * Length of the reload animation in milliseconds. Stored only — actual
   * timeScale is recomputed every time the animation plays, so calling this
   * mid-reload doesn't affect the in-flight animation but will affect the next.
   */
  setReloadTime(reloadTime: number) {
    this._reloadTime = reloadTime;
  }

  /** Delay between shots, ms. Lower = faster. Animation retimes to match. */
  setFireRate(fireRate: number) {
    this._fireRate = fireRate;
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

  protected addGui(gui: GUI): void {
    const properties = gui.addFolder('Properties');
    const ctx = this;
    const tunables = new (class {
      get fireRate(): number {
        return ctx._fireRate;
      }
      set fireRate(v: number) {
        ctx.setFireRate(v);
      }
      get reloadTime(): number {
        return ctx._reloadTime;
      }
      set reloadTime(v: number) {
        ctx.setReloadTime(v);
      }
      get magazineSize(): number {
        return ctx._magazineSize;
      }
      set magazineSize(v: number) {
        ctx.setMagazineSize(v);
      }
    })();

    properties.add(tunables, 'fireRate').step(1).min(50).max(2000).name('fireRate (ms)');
    properties.add(tunables, 'reloadTime').step(1).min(100).max(7500).name('reloadTime (ms)');
    properties.add(tunables, 'magazineSize').step(1).min(7).max(200).name('magazineSize');

    const offset = gui.addFolder('Offset');
    offset.add(this.weaponOffset, 'x').step(0.01).min(-8).max(8);
    offset.add(this.weaponOffset, 'y').step(0.01).min(-8).max(8);
    offset.add(this.weaponOffset, 'z').step(0.01).min(-8).max(8);

    const rotation = gui.addFolder('Rotation');
    rotation.add(this.weaponRotation, 'x').step(0.01).min(-Math.PI).max(7);
    rotation.add(this.weaponRotation, 'y').step(0.01).min(-Math.PI).max(7);
    rotation.add(this.weaponRotation, 'z').step(0.01).min(-Math.PI).max(7);

    const scale = gui.addFolder('Scale');
    scale.add(this.weapon.scene.scale, 'x').step(0.01).min(0.1).max(4);
    scale.add(this.weapon.scene.scale, 'y').step(0.01).min(0.1).max(4);
    scale.add(this.weapon.scene.scale, 'z').step(0.01).min(0.1).max(4);

    gui.close();
  }

  protected getShootDelta() {
    return Date.now() - this.lastShot;
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
