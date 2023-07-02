import * as THREE from 'three';
import GUI from 'lil-gui';
import Camera from '@/src/setup/Camera';

export class WeaponController {
  // private weapons: unknown[]; // TODO: Add dedicated class
  // private weaponIndex: number;

  public readonly scene: THREE.Scene;
  public readonly camera: Camera;

  public light!: THREE.DirectionalLight;

  constructor(private readonly gui: GUI) {
    // this.weapons = [];
    // this.weaponIndex = 0;

    this.scene = new THREE.Scene();
    this.camera = new Camera();
    this.addLight();
  }

  private addLight() {
    const folder = this.gui.addFolder('Light');
    this.light = new THREE.DirectionalLight(0xffffff, 2);
    this.light.position.set(0, 2, 1);

    folder.add(this.light, 'intensity', 0, 20, 0.01);
    folder.addColor(this.light, 'color');
    folder.add(this.light, 'distance', 0, 100, 0.01);
    folder.add(this.light, 'decay', 0, 10, 0.01);
    folder.add(this.light.position, 'x', -10, 10, 0.01);
    folder.add(this.light.position, 'y', -10, 10, 0.01);
    folder.add(this.light.position, 'z', -10, 10, 0.01);

    this.scene.add(this.light);
  }

  setupScene() {}
  // addWeapon(weapon) {
  //     this.weapons.push(weapon);
  // }
  // getWeapon() {
  //     return this.weapons[this.weaponIndex];
  // }
  // getWeaponIndex() {
  //     return this.weaponIndex;
  // }
  // setWeaponIndex(index) {
  //     this.weaponIndex = index;
  // }
  // getWeapons() {
  //     return this.weapons;
  // }
  // nextWeapon() {
  //     this.weaponIndex++;
  //     if (this.weaponIndex >= this.weapons.length) {
  //         this.weaponIndex = 0;
  //     }
  // }
  // previousWeapon() {
  //     this.weaponIndex--;
  //     if (this.weaponIndex < 0) {
  //         this.weaponIndex = this.weapons.length - 1;
  //     }
  // }
  // setWeapon(weapon) {
  //     this.weapon = weapon;
  // }
  // getWeaponName() {
  //     return this.weapon.name;
  // }
  // getWeaponDamage() {
  //     return this.weapon.damage;
  // }
  // getWeaponRange() {
  //     return this.weapon.range;
  // }
  // getWeaponFireRate() {
  //     return this.weapon.fireRate;
  // }
  // getWeaponMagazineSize() {
  //     return this.weapon.magazineSize;
  // }
  // getWeaponReloadTime() {
  //     return this.weapon.reloadTime;
  // }
  // getWeaponAmmo() {
  //     return this.weapon.ammo;
  // }
  // getWeaponMaxAmmo() {
  //     return this.weapon.maxAmmo;
  // }
  // getWeaponAmmoInMagazine() {
  //     return this.weapon.ammoInMagazine;
  // }
  // getWeaponMaxAmmoInMagazine() {
  //     return this.weapon.maxAmmoInMagazine;
  // }
  // getWeaponSpread() {
  //     return this.weapon.spread;
  // }
  // getWeaponProjectileSpeed() {
  //     return this.weapon.projectileSpeed;
  // }
  // getWeaponProjectileSize() {
  //     return this.weapon.projectileSize;
  // }
  // getWeaponProjectileColor() {
  //     return this.weapon.projectileColor;
  // }
  // getWeaponProjectileLifeTime() {
  //     return this.weapon.projectileLifeTime;
  // }
  // getWeaponProjectileTrailLength() {
  //     return this.weapon.projectileTrailLength;
  // }
  // getWeaponProjectileTrailColor() {
  //     return this.weapon.projectileTrailColor;
  // }
}
