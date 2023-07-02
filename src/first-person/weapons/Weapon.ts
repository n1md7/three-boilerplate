import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { AnimationAction, AnimationMixer, LoopOnce, Vector3 } from 'three';
import Camera from '@/src/setup/Camera';

export type AnimationName = 'fire' | 'reload' | 'idle' | 'walk';
export type AnimationNameMap = Record<AnimationName, string>;

export abstract class Weapon {
  protected readonly shootAnimation: AnimationAction;
  protected readonly reloadAnimation: AnimationAction;
  protected readonly idleAnimation: AnimationAction;
  protected readonly walkAnimation: AnimationAction;
  protected readonly animationMixer: AnimationMixer;

  protected fireRate = 1000; // 1000ms delay between shots
  protected reloadTime = 3000; // 3000ms reload time
  protected magazineSize = 7; // 7 bullets per magazine
  protected bullets = 7; // Current bullets in magazine
  protected damageRange = 100; // 100m effective range (m or blocks?)

  private lastShot = Date.now(); // Last shot timestamp
  private reloading = false; // Is reloading

  protected abstract readonly weaponOffset: Vector3;

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

  shoot(): void {
    if (this.reloading) return;
    if (this.bullets === 0) return this.reload();
    if (this.getShootDelta() < this.fireRate) return;

    this.decrementBullets();
    this.updateDelta();

    this.resetAnimations();
    this.stopAnimations();

    this.shootAnimation.play();
  }

  reload(): void {
    if (this.reloading) return;
    if (this.bullets === this.magazineSize) return;

    this.reloading = true;
    this.resetAnimations();
    this.stopAnimations();

    this.reloadAnimation.play();

    setTimeout(() => {
      this.bullets = this.magazineSize;
      this.reloading = false;
    }, this.reloadTime);
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

  setDamageRange(range: number) {
    this.damageRange = range;
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

  public adjustBy(camera: Camera): void {
    const offset = this.weaponOffset.clone();
    // Calculate the offset of the weapon from the camera
    offset.applyQuaternion(camera.quaternion);

    // Update the weapon position based on the camera position and offset
    this.weapon.scene.position.copy(camera.position).add(offset);

    // Update the weapon rotation to match the camera rotation
    this.weapon.scene.rotation.copy(camera.rotation);
    this.weapon.scene.rotateY(Math.PI);
  }
}
