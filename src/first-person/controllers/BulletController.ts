import * as THREE from 'three';
import { LinkedList } from '@/src/dsa/LinkedList';
import { Bullet } from '@/src/first-person/components/Bullet';
import { Weapon } from '@/src/first-person/weapons/Weapon';

export class BulletController {
  private readonly scene: THREE.Scene;
  private readonly camera: THREE.Camera;

  private readonly bullets: LinkedList<Bullet>;

  constructor(scene: THREE.Scene, camera: THREE.Camera) {
    this.scene = scene;
    this.camera = camera;
    this.bullets = new LinkedList();
  }

  shoot(weapon: Weapon) {
    const direction = new THREE.Vector3();
    // Get the direction the camera is facing
    this.camera.getWorldDirection(direction);

    const bullet = new Bullet(weapon.bulletSize, weapon.bulletSpeed, weapon.bulletColor);
    bullet.shotAt.copy(this.camera.position);
    bullet.position.copy(this.camera.position);
    bullet.velocity.add(direction.multiplyScalar(bullet.speed));

    this.scene.add(bullet);
    this.bullets.add(bullet);

    return bullet;
  }

  update() {
    // Adjust the desired distance threshold
    const distanceThreshold = 5; // units, effectively the range of the weapon

    for (const bullet of this.bullets) {
      // Animates the bullet by moving it the original direction
      bullet.update();

      const intersections = this.detectIntersections(bullet);

      if (bullet.position.distanceTo(bullet.shotAt) > distanceThreshold) {
        this.scene.remove(bullet);
        this.bullets.remove(bullet);
        continue;
      }

      // When bullet collides with an object, highlight it
      for (const intersection of intersections) {
        if (intersection.distance > distanceThreshold) continue;

        // If object is a mesh, highlight it
        if (intersection.object instanceof THREE.Mesh) {
          this.highlightObject(intersection.point, bullet);
          this.scene.remove(bullet);
          this.bullets.remove(bullet);

          break; // One bullet can only hit one object
        }
      }
    }
  }

  private detectIntersections(bullet: Bullet) {
    const raycaster = new THREE.Raycaster();
    raycaster.set(bullet.position, bullet.velocity.normalize());

    return raycaster.intersectObject(this.scene, true);
  }

  private highlightObject(position: THREE.Vector3, bullet: Bullet) {
    // Create a new material with a brighter color
    const highlightMaterial = new THREE.MeshBasicMaterial({ color: bullet.color });

    // Create a sphere to indicate the position of the collision
    const sphereGeometry = new THREE.SphereGeometry(bullet.size, 8, 8);
    const sphere = new THREE.Mesh(sphereGeometry, highlightMaterial);

    // Position the sphere at the collision point
    sphere.position.copy(position);

    // Add the sphere to the scene
    this.scene.add(sphere);

    // Delay the removal of the sphere after a certain duration
    const sphereDuration = 5000; // Adjust the duration as needed

    setTimeout(() => {
      this.scene.remove(sphere);
    }, sphereDuration);
  }
}
