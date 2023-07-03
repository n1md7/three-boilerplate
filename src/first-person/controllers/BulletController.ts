import * as THREE from 'three';
import { Octree } from 'three/examples/jsm/math/Octree.js';

class BulletMesh extends THREE.Mesh {
  velocity = new THREE.Vector3();
}

export class BulletController {
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private octree: Octree;

  private readonly bullets: BulletMesh[];

  private readonly bulletSpeed: number;
  private readonly bulletSize: number;
  private readonly bulletColor: number;

  constructor(scene: THREE.Scene, camera: THREE.Camera, octree: Octree) {
    this.scene = scene;
    this.camera = camera;
    this.octree = octree;
    this.bullets = [];

    this.bulletSpeed = 0.1;
    this.bulletSize = 0.1;
    this.bulletColor = 0xff0000;
  }

  shoot() {
    const direction = new THREE.Vector3();
    this.camera.getWorldDirection(direction);

    const geometry = new THREE.SphereGeometry(this.bulletSize, 8, 8);
    const material = new THREE.MeshBasicMaterial({ color: this.bulletColor });
    const bullet = new BulletMesh(geometry, material);

    bullet.position.copy(this.camera.position);
    bullet.velocity = direction.multiplyScalar(this.bulletSpeed);

    this.scene.add(bullet);
    this.bullets.push(bullet);
  }

  update() {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      bullet.position.add(bullet.velocity);

      const collision = this.detectCollision(bullet);

      if (collision) {
        this.highlightObject(collision.object);
        this.scene.remove(bullet);
        this.bullets.splice(i, 1);
      }
    }
  }

  private detectCollision(bullet: BulletMesh): THREE.Intersection | null {
    const raycaster = new THREE.Raycaster();
    raycaster.set(bullet.position, bullet.velocity.normalize());

    // Perform an Octree search to get potential collisions
    const intersects = this.octree.rayIntersect(raycaster.ray);

    // Check if intersects is an array before iterating
    if (Array.isArray(intersects)) {
      for (const intersection of intersects) {
        const object = intersection.object;

        // Perform a more precise collision check using the bullet's geometry
        const collision = raycaster.intersectObject(object);

        if (collision.length > 0) {
          return collision[0];
        }
      }
    }

    return null;
  }

  private highlightObject(object: THREE.Object3D) {
    // Create a new material with a brighter color
    const highlightColor = new THREE.Color(0xff0000); // Adjust the color as needed
    const highlightMaterial = new THREE.MeshBasicMaterial({ color: highlightColor });

    // Check if the object has a Mesh component
    if (object instanceof THREE.Mesh) {
      // Store the original material of the object
      const originalMaterial = object.material;

      // Apply the highlight material to the object
      object.material = highlightMaterial;

      // Delay the restoration of the original material after a certain duration
      const highlightDuration = 1000; // Adjust the duration as needed

      setTimeout(() => {
        object.material = originalMaterial;
      }, highlightDuration);
    }
  }
}
