import * as THREE from 'three';
import { Octree } from 'three/examples/jsm/math/Octree.js';
import { LinkedList } from '@/src/dsa/LinkedList';
import { Bullet } from '@/src/first-person/components/Bullet';

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

  private readonly bullets: LinkedList<Bullet>;

  constructor(scene: THREE.Scene, camera: THREE.Camera, octree: Octree) {
    this.scene = scene;
    this.camera = camera;
    this.octree = octree;
    this.bullets = new LinkedList();
  }

  shoot() {
    const direction = new THREE.Vector3();
    // Get the direction the camera is facing
    this.camera.getWorldDirection(direction);

    const bullet = new Bullet();
    bullet.shotAt.copy(this.camera.position);
    bullet.position.copy(this.camera.position);
    bullet.velocity.add(direction.multiplyScalar(bullet.speed));

    this.scene.add(bullet);
    this.bullets.add(bullet);
  }

  update() {
    const distanceThreshold = 3; // Adjust the desired distance threshold

    for (const bullet of this.bullets) {
      // Animates the bullet by moving it the original direction
      bullet.update();

      // Calculate the distance traveled by the bullet
      const distanceTraveled = bullet.position.distanceTo(bullet.shotAt);
      // console.log('Distance traveled:', distanceTraveled);

      // FIXME: distance traveled is always very low (0.000000) number

      if (distanceTraveled >= distanceThreshold) {
        // Bullet has flown the desired distance, remove it
        this.scene.remove(bullet);
        this.bullets.remove(bullet);
      } else {
        const collision = this.detectCollision(bullet);

        if (collision) {
          this.highlightObject(collision.position);
          this.scene.remove(bullet);
          this.bullets.remove(bullet);
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
    const highlightColor = new THREE.Color(0xff0002);
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
