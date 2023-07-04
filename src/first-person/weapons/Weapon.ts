import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { AnimationAction, AnimationMixer, LoopOnce, Vector3 } from 'three';
import Camera from '@/src/setup/Camera';
import GUI from 'lil-gui';

export type AnimationName = 'fire' | 'reload' | 'idle' | 'walk';
export type FireMode = 'auto' | 'semi';
export type AnimationNameMap = Record<AnimationName, string>;

export abstract class Weapon {
  protected readonly shootAnimation: AnimationAction;
  protected readonly reloadAnimation: AnimationAction;
  protected readonly idleAnimation: AnimationAction;
  protected readonly walkAnimation: AnimationAction;
  protected readonly animationMixer: AnimationMixer;

  protected abstract weaponOffset: Vector3; // Offset of weapon from camera
  protected abstract weaponRotation: Vector3; // Rotation of weapon

  protected fireRate = 1000; // 1000ms delay between shots
  protected reloadTime = 3000; // 3000ms reload time
  protected magazineSize = 7; // 7 bullets per magazine by default
  protected bullets = 7; // Current bullets in magazine
  protected effectiveRange = 100; // 100m effective range (m or blocks?)
  private lastShot = Date.now(); // Last shot timestamp
  private reloading = false; // Is reloading

  public bulletSize = 0.1; // Bullet size
  public bulletSpeed = 0.5; // Bullet speed
  public bulletDamage = 10; // Bullet damage
  public bulletSpread = 0.1; // Bullet spread
  public bulletColor = 0xff0000; // Bullet color

  private fireMode: FireMode = 'semi';

  protected constructor(protected readonly weapon: GLTF, animationNames: AnimationNameMap) {
    this.animationMixer = new AnimationMixer(weapon.scene);

    this.shootAnimation = this.getAnimation(animationNames.fire);
    this.reloadAnimation = this.getAnimation(animationNames.reload);
    this.idleAnimation = this.getAnimation(animationNames.idle);
    this.walkAnimation = this.getAnimation(animationNames.walk);
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

    this.decrementBullets();
    this.updateDelta();

    this.resetAnimations();
    this.stopAnimations();

    this.shootAnimation.play();

    return true;
  }

  reload(): boolean {
    if (this.reloading) return false;
    if (this.bullets === this.magazineSize) return false;

    this.reloading = true;
    this.resetAnimations();
    this.stopAnimations();

    this.reloadAnimation.play();

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

  setMagazineSize(magazineSize: number) {
    this.magazineSize = magazineSize;
  }

  setReloadTime(reloadTime: number) {
    this.reloadTime = reloadTime;
    this.reloadAnimation.setDuration(reloadTime / 1000);
    this.reloadAnimation.setLoop(LoopOnce, 1);
  }

  setFireRate(fireRate: number) {
    this.fireRate = fireRate;
    this.shootAnimation.setDuration(fireRate / 1000);
    this.shootAnimation.setLoop(LoopOnce, 1);
  }

  setEffectiveRange(range: number) {
    this.effectiveRange = range;
  }

  setFireMode(mode: FireMode) {
    this.fireMode = mode;
  }

  getFireMode(): FireMode {
    return this.fireMode;
  }

  adjustBy(camera: Camera): void {
    const offset = this.weaponOffset.clone();
    // Calculate the offset of the weapon from the camera
    offset.applyQuaternion(camera.quaternion);

    // Update the weapon position based on the camera position and offset
    this.weapon.scene.position.copy(camera.position).add(offset);

    // Update the weapon rotation to match the camera rotation
    this.weapon.scene.rotation.copy(camera.rotation);

    // Transform the weapon as needed
    this.weapon.scene.rotateX(this.weaponRotation.x);
    this.weapon.scene.rotateY(this.weaponRotation.y);
    this.weapon.scene.rotateZ(this.weaponRotation.z);
  }

  protected addGui(gui: GUI): void {
    gui.add(this, 'fireRate', this.fireRate).step(1).name('fireRate (ms)').min(100).max(2000);
    gui.add(this, 'reloadTime', this.reloadTime).step(1).name('reloadTime (ms)').min(100).max(7500);
    gui.add(this, 'magazineSize', this.magazineSize).step(1).name('magazineSize').min(7).max(200);

    gui.add(this.weaponOffset, 'x', this.weaponOffset.x).step(0.01).min(-8).max(8).name('offsetX');
    gui.add(this.weaponOffset, 'y', this.weaponOffset.y).step(0.01).min(-8).max(8).name('offsetY');
    gui.add(this.weaponOffset, 'z', this.weaponOffset.z).step(0.01).min(-8).max(8).name('offsetZ');

    gui
      .add(this.weaponRotation, 'x', this.weaponRotation.x)
      .step(0.01)
      .min(-Math.PI)
      .max(2 * Math.PI)
      .name('rotationX');
    gui
      .add(this.weaponRotation, 'y', this.weaponRotation.y)
      .step(0.01)
      .min(-Math.PI)
      .max(2 * Math.PI)
      .name('rotationY');
    gui
      .add(this.weaponRotation, 'z', this.weaponRotation.z)
      .step(0.01)
      .min(-Math.PI)
      .max(2 * Math.PI)
      .name('rotationZ');

    gui.add(this.weapon.scene.scale, 'x', this.weapon.scene.scale.x).step(0.01).min(0.1).max(4).name('scaleX');
    gui.add(this.weapon.scene.scale, 'y', this.weapon.scene.scale.y).step(0.01).min(0.1).max(4).name('scaleY');
    gui.add(this.weapon.scene.scale, 'z', this.weapon.scene.scale.z).step(0.01).min(0.1).max(4).name('scaleZ');

    gui.close();
  }

  protected getShootDelta() {
    return Date.now() - this.lastShot;
  }

  private decrementBullets() {
    this.bullets--;
  }

  private updateDelta() {
    this.lastShot = Date.now();
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
    const animation = this.weapon.animations.find((animation) => animation.name === name);
    if (!animation) throw new Error(`Animation "${name}" not found`);

    return this.animationMixer.clipAction(animation);
  }
}
