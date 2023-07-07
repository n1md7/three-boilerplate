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
    // But add a bit of distance to the direction to make it look like the bullet is coming out of the barrel
    this.camera.getWorldDirection(direction);

    const bullet = Bullet.from(weapon.bullet);
    // Set the bullet's position to the camera's position minus tiny bit of distance
    bullet.shotFrom.copy(this.camera.position.sub(direction.multiplyScalar(0.1)));
    bullet.position.copy(this.camera.position);
    bullet.velocity.add(direction.multiplyScalar(weapon.bullet.speed));

    this.scene.add(bullet);
    this.bullets.add(bullet);

    return bullet;
  }

  update(weapon: Weapon) {
    // Adjust the desired distance threshold
    BulletLoop: for (const bullet of this.bullets) {
      // Animates the bullet by moving it the original direction
      bullet.update();

      if (bullet.isEffective(weapon)) {
        for (const intersection of this.detectIntersections(bullet)) {
          // If object is a mesh, highlight it
          if (intersection.object instanceof THREE.Mesh) {
            this.highlightIntersectionPoint(intersection.point, bullet);
            this.highlightIntersectionObject(intersection.object);
            this.removeBullet(bullet);

            continue BulletLoop; // One bullet can only hit one object
          }
        }
      }

      // When a bullet not effective or when it doesn't hit anything ( anything that is Mesh), remove it
      this.removeBullet(bullet);
    }
  }

  private removeBullet(bullet: Bullet) {
    this.scene.remove(bullet);
    this.bullets.remove(bullet);
  }

  private detectIntersections(bullet: Bullet) {
    const raycaster = new THREE.Raycaster();
    raycaster.set(bullet.position, bullet.velocity.normalize());

    return raycaster.intersectObject(this.scene, true);
  }

  private highlightIntersectionPoint(position: THREE.Vector3, bullet: Bullet) {
    // Create a new material with a brighter color
    const highlightMaterial = new THREE.MeshBasicMaterial({ color: bullet.color });

    // Create a sphere to indicate the position of the collision
    const sphereGeometry = new THREE.SphereGeometry(bullet.size, 8, 8);
    const sphere = new THREE.Mesh(sphereGeometry, highlightMaterial);

    // Position the sphere at the collision point
    sphere.position.copy(position);

    // Add the sphere to the scene
    this.scene.add(sphere);
  }

  private highlightIntersectionObject(object: THREE.Object3D) {
    // Create a new material with a brighter color
    const highlightMaterial = new THREE.MeshBasicMaterial({ wireframe: true });

    if (object instanceof THREE.Mesh) {
      if (object.name === 'mother-fucking-box') {
        // Change the material of the object to the new material
        object.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.material = highlightMaterial;
          }
        });
      }
    }
  }
}
