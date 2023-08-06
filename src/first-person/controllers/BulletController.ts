import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { LinkedList } from '@/src/data-structures/LinkedList';
import { Bullet } from '@/src/first-person/components/Bullet';
import { Weapon } from '@/src/first-person/weapons/Weapon';
import { RigidBody } from '@/src/abstract/RigidBody';
import { Box } from '@/src/setup/scene/components/Box';
import { crosshair } from '@/src/game/ui';

export class BulletController {
  private readonly scene: THREE.Scene;
  private readonly camera: THREE.Camera;

  private readonly bullets: LinkedList<Bullet>;
  private readonly physicsWorld: CANNON.World;
  private bulletHoles: { sphere: THREE.Mesh; body: CANNON.Body; timestamp: number }[] = [];

  constructor(scene: THREE.Scene, camera: THREE.Camera, physicsWorld: CANNON.World) {
    this.scene = scene;
    this.camera = camera;
    this.physicsWorld = physicsWorld;
    this.bullets = new LinkedList();
  }

  shoot(weapon: Weapon) {
    const direction = new THREE.Vector3();
    // Get the direction the camera is facing
    // But add a bit of distance to the direction
    // to make it look like the bullet is coming out of the barrel
    this.camera.getWorldDirection(direction);
    // Add a little bit of direction accuracy change based on the crosshair accuracy value
    // 5% is always inaccurate even though the crosshair is set to 100%
    const accuracy = (crosshair.getAccuracy() - 100 || 5) / 1000;
    direction.x += (Math.random() - 0.5) * accuracy;
    direction.y += (Math.random() - 0.5) * accuracy;
    direction.z += (Math.random() - 0.5) * accuracy;

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
    this.bulletHoles = this.bulletHoles.filter(({ timestamp, sphere }) => {
      const condition = timestamp + 12000 > Date.now(); // 12 seconds
      if (!condition) sphere.removeFromParent();
      return condition;
    });
    for (const { body, sphere } of this.bulletHoles) {
      // Position the sphere at the collision point
      sphere.position.setX(body.position.x);
      sphere.position.setY(body.position.y);
      sphere.position.setZ(body.position.z);
    }

    // Adjust the desired distance threshold
    BulletLoop: for (const bullet of this.bullets) {
      // Animates the bullet by moving it the original direction
      bullet.update();

      if (bullet.isEffective(weapon)) {
        for (const intersection of this.detectIntersections(bullet)) {
          // Whitelist of objects that can NOT be hit
          const isAxisHelper = intersection.object instanceof THREE.AxesHelper;
          const isGridHelper = intersection.object instanceof THREE.GridHelper;
          if (isAxisHelper || isGridHelper) continue;

          // Objects that can be hit
          this.highlightIntersectionPoint(intersection.point, bullet);
          this.applyForce(intersection, bullet);
          this.removeBullet(bullet);

          continue BulletLoop; // One bullet can only hit one object
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

    // Create a Cannon.js body for the intersection point (a static body since it's just a marker)
    const intersectionBody = new CANNON.Body({
      mass: CANNON.Body.STATIC, // No mass
      shape: new CANNON.Sphere(bullet.size), // Match the sphere size
      position: new CANNON.Vec3(position.x, position.y, position.z), // Set initial position
    });

    // Add the body to the Cannon.js world
    this.physicsWorld.addBody(intersectionBody);

    // Save the sphere and body to an array
    this.bulletHoles.push({ sphere, body: intersectionBody, timestamp: Date.now() });

    // Add the sphere to the scene
    this.scene.add(sphere);
  }

  private applyForce(intersection: THREE.Intersection, bullet: Bullet) {
    if (intersection.object instanceof RigidBody) {
      if (intersection.object instanceof Box) {
        const direction = new THREE.Vector3();
        this.camera.getWorldDirection(direction);
        intersection.object.body.applyImpulse(
          new CANNON.Vec3(direction.x * bullet.damage, direction.y * bullet.damage, direction.z * bullet.damage)
        );
      }
    }
  }
}
