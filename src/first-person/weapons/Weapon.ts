import { AnimationAction, AnimationMixer, LoopOnce, Vector3 } from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Bullet } from '@/src/first-person/components/Bullet';
import Camera from '@/src/setup/Camera';
import GUI from 'lil-gui';

export type AnimationName = 'fire' | 'reload' | 'idle' | 'walk';
export type FireMode = 'auto' | 'semi';
export type AnimationNameMap = Record<AnimationName, string>;

export abstract class Weapon {
  public abstract readonly bullet: Bullet;
  protected readonly shootAnimation: AnimationAction;
  protected readonly reloadAnimation: AnimationAction;
  protected readonly idleAnimation: AnimationAction;
  protected readonly walkAnimation: AnimationAction;
  protected readonly animationMixer: AnimationMixer;
  protected abstract weaponOffset: Vector3; // Offset of weapon from camera
  protected abstract weaponRotation: Vector3; // Rotation of weapon

  // Tunables — encapsulated. Mutate only through the public setX() methods,
  // which keep animation durations in sync. lil-gui binds to a getter/setter
  // proxy built in `addGui`, so the panel works without exposing these fields.
  private _fireRate = 1000; // ms between shots
  private _reloadTime = 3000; // ms
  private _magazineSize = 7;
  private _bullets = 7;
  private _type: FireMode = 'semi';
  private lastShot = Date.now();
  private reloading = false;

  protected constructor(
    protected readonly weapon: GLTF,
    animationNames: AnimationNameMap,
  ) {
    this.animationMixer = new AnimationMixer(weapon.scene);

    this.shootAnimation = this.getAnimation(animationNames.fire);
    this.reloadAnimation = this.getAnimation(animationNames.reload);
    this.idleAnimation = this.getAnimation(animationNames.idle);
    this.walkAnimation = this.getAnimation(animationNames.walk);
  }

  // Read-only public accessors — callers can observe, only the setters mutate.
  get fireRate(): number {
    return this._fireRate;
  }
  get reloadTime(): number {
    return this._reloadTime;
  }
  get magazineSize(): number {
    return this._magazineSize;
  }
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
    // Perhaps the grid helper is showing the wrong block size — empirically /2 works.
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

    this.resetAnimations();
    this.stopAnimations();
    this.shootAnimation.play();

    return true;
  }

  reload(): boolean {
    if (this.reloading) return false;
    if (this._bullets === this._magazineSize) return false;

    this.reloading = true;
    this.resetAnimations();
    this.stopAnimations();
    this.reloadAnimation.play();

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

  setReloadTime(reloadTime: number) {
    this._reloadTime = reloadTime;
    this.reloadAnimation.setDuration(reloadTime / 1000);
    this.reloadAnimation.setLoop(LoopOnce, 1);
  }

  /** Delay between shots in milliseconds. Lower = faster. */
  setFireRate(fireRate: number) {
    this._fireRate = fireRate;
    this.shootAnimation.setDuration(fireRate / 1000);
    this.shootAnimation.setLoop(LoopOnce, 1);
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

  /**
   * Builds a proxy object exposing getter/setter pairs that lil-gui can bind to.
   * The private fields stay private — all mutations flow through the public
   * setX() methods so animation durations and side-effects stay in sync.
   */
  protected addGui(gui: GUI): void {
    const properties = gui.addFolder('Properties');
    // `self` captured so the proxy getters/setters can reflect on private fields.
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    // Closure-bound proxy so lil-gui can read/write through accessors — the
    // private fields on the class stay encapsulated.
    const tunables = {
      get fireRate(): number {
        return self._fireRate;
      },
      set fireRate(v: number) {
        self.setFireRate(v);
      },
      get reloadTime(): number {
        return self._reloadTime;
      },
      set reloadTime(v: number) {
        self.setReloadTime(v);
      },
      get magazineSize(): number {
        return self._magazineSize;
      },
      set magazineSize(v: number) {
        self.setMagazineSize(v);
      },
    };

    properties.add(tunables, 'fireRate').step(1).min(100).max(2000).name('fireRate (ms)');
    properties.add(tunables, 'reloadTime').step(1).min(100).max(7500).name('reloadTime (ms)');
    properties.add(tunables, 'magazineSize').step(1).min(7).max(200).name('magazineSize');

    // Vector3 fields are protected and we are inside the class — direct binding is fine.
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

  private resetAnimations() {
    this.shootAnimation.reset();
    this.reloadAnimation.reset();
    this.idleAnimation.reset();
    this.walkAnimation.reset();
  }

  private stopAnimations() {
    this.shootAnimation.stop();
    this.reloadAnimation.stop();
    this.idleAnimation.stop();
    this.walkAnimation.stop();
  }

  private getAnimation(name: string): AnimationAction {
    const animation = this.weapon.animations.find((a) => a.name === name);
    if (!animation) throw new Error(`Animation "${name}" not found`);
    return this.animationMixer.clipAction(animation);
  }
}
