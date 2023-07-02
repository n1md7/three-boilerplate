import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { AnimationAction, AnimationMixer, LoopOnce } from 'three';

export type AnimationName = 'fire' | 'reload' | 'idle' | 'walk';
export type AnimationNameMap = Record<AnimationName, string>;

export abstract class Weapon {
  protected readonly shootAnimation: AnimationAction;
  protected readonly reloadAnimation: AnimationAction;
  protected readonly idleAnimation: AnimationAction;
  protected readonly walkAnimation: AnimationAction;
  protected readonly animationMixer: AnimationMixer;

  protected fireRate = 1; // 1sps (Shot Per Second)
  protected reloadTime = 3000; // 3000ms
  protected magazineSize = 7; // 7 bullets
  protected bullets = 7; // Current bullets in magazine
  protected damageRange = 100; // 100m effective range

  private lastShot = Date.now(); // Last shot timestamp
  private reloading = false; // Is reloading

  protected constructor(protected readonly weapon: GLTF, animationNames: AnimationNameMap) {
    this.animationMixer = new AnimationMixer(weapon.scene);

    this.shootAnimation = this.getAnimation(animationNames.fire);
    this.reloadAnimation = this.getAnimation(animationNames.reload);
    this.idleAnimation = this.getAnimation(animationNames.idle);
    this.walkAnimation = this.getAnimation(animationNames.walk);
  }

  shoot(): void {
    if (this.reloading) return;
    if (this.bullets === 0) return this.reload();
    if (this.getShootDelta() < this.fireRate) return;

    this.decrementBullets();
    this.shootAnimation.reset();
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
    return this;
  }

  setMagazineSize(magazineSize: number) {
    this.magazineSize = magazineSize;
    return this;
  }

  setReloadTime(reloadTime: number) {
    this.reloadTime = reloadTime;
    this.reloadAnimation.setDuration(reloadTime / 1000);
    this.reloadAnimation.setEffectiveTimeScale(reloadTime / 1000);
    this.reloadAnimation.setEffectiveWeight(1);
    this.reloadAnimation.setLoop(LoopOnce, 1);
    this.reloadAnimation.clampWhenFinished = true;

    return this;
  }

  setDamageRange(range: number) {
    this.damageRange = range;
    return this;
  }

  setFireRate(fireRate: number) {
    this.fireRate = fireRate;
    this.shootAnimation.setDuration(1 / fireRate);
    this.shootAnimation.setEffectiveTimeScale(fireRate);
    this.shootAnimation.setEffectiveWeight(1);
    this.shootAnimation.setLoop(LoopOnce, 1);
    this.shootAnimation.clampWhenFinished = true;

    return this;
  }

  protected getShootDelta() {
    return Date.now() - this.lastShot;
  }

  private decrementBullets() {
    this.bullets--;
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
