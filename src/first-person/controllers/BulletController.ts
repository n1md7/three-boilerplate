import * as THREE from 'three';
import { Octree } from 'three/examples/jsm/math/Octree.js';
import { Vector3 } from 'three';

class Bullet extends THREE.Mesh {
  velocity = new THREE.Vector3();
}

type Intersection =
  | false
  | {
      distance: number;
      position: THREE.Vector3;
      triangle: THREE.Triangle;
    };

export class BulletController {
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private octree: Octree;

  private readonly bullets: [Bullet, Vector3][];

  private readonly bulletSpeed: number;
  private readonly bulletSize: number;
  private readonly bulletColor: string;

  constructor(scene: THREE.Scene, camera: THREE.Camera, octree: Octree) {
    this.scene = scene;
    this.camera = camera;
    this.octree = octree;
    this.bullets = [];

    this.bulletSpeed = 0.1;
    this.bulletSize = 0.1;
    this.bulletColor = 'rgba(201,106,10,0.56)';
  }

  shoot() {
    const direction = new THREE.Vector3();
    this.camera.getWorldDirection(direction);
    console.log('Direction:', direction);
    const geometry = new THREE.SphereGeometry(this.bulletSize, 8, 8);
    const material = new THREE.MeshBasicMaterial({ color: this.bulletColor });
    const bullet = new Bullet(geometry, material);

    const shootPoint = new THREE.Vector3();
    shootPoint.copy(this.camera.position);
    // Bullets start at the camera position
    bullet.position.copy(shootPoint);
    bullet.velocity = direction.multiplyScalar(this.bulletSpeed);

    this.scene.add(bullet);
    this.bullets.push([bullet, shootPoint]);
  }

  update() {
    // TODO: use more appropriate data-structure for bullets, Like a linked list or a queue
    const distanceThreshold = 3; // Adjust the desired distance threshold

    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const [bullet, shootPoint] = this.bullets[i];
      // Animates the bullet by moving it the original direction
      bullet.position.add(bullet.velocity);

      const distanceTraveled = bullet.position.distanceTo(shootPoint);

      // FIXME: This is not working as expected
      console.log('Distance:', distanceTraveled);

      // Calculate the distance traveled by the bullet
      console.log('Distance traveled:', distanceTraveled);
      if (distanceTraveled >= distanceThreshold) {
        console.log('Bullet has traveled far enough');
        // Bullet has flown the desired distance, remove it
        this.scene.remove(bullet);
        this.bullets.splice(i, 1);
      } else {
        const collision = this.detectCollision(bullet);

        if (collision) {
          this.highlightObject(collision.position);
          this.scene.remove(bullet);
          this.bullets.splice(i, 1);
        }
      }
    }
  }

  private detectCollision(bullet: Bullet): Intersection | null {
    const raycaster = new THREE.Raycaster();
    raycaster.set(bullet.position, bullet.velocity.normalize());

    // Perform an Octree search to get potential collisions
    const intersection: Intersection = this.octree.rayIntersect(raycaster.ray);

    if (intersection) {
      return intersection;
    }

    return null;
  }

  private highlightObject(position: THREE.Vector3) {
    // Create a new material with a brighter color
    const highlightColor = new THREE.Color(0xff0000); // Adjust the color as needed
    const highlightMaterial = new THREE.MeshBasicMaterial({ color: highlightColor });

    // Create a sphere to indicate the position of the collision
    const sphereGeometry = new THREE.SphereGeometry(0.1, 8, 8);
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
