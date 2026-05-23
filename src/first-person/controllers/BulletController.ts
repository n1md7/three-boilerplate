import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { LinkedList } from '@/src/data-structures/LinkedList';
import { Bullet } from '@/src/first-person/components/Bullet';
import { Weapon } from '@/src/first-person/weapons/Weapon';
import { RigidBody } from '@/src/abstract/RigidBody';
import { crosshair } from '@/src/game/ui';

/** Lifetime of a bullet hole in milliseconds. `Infinity` to keep them forever. */
const BULLET_HOLE_LIFETIME_MS = 12_000;

export class BulletController {
  private readonly bullets: LinkedList<Bullet>;

  /**
   * Bullet holes are parented to whatever Three.js object got hit, so the scene
   * graph handles "follow the target as it moves" for free. We only need to
   * remember the marker mesh + when it was created so we can expire it later.
   */
  private bulletHoles: { sphere: THREE.Mesh; timestamp: number }[] = [];

  constructor(
    private readonly scene: THREE.Scene,
    private readonly camera: THREE.Camera,
  ) {
    this.bullets = new LinkedList();
  }

  shoot(weapon: Weapon) {
    const direction = new THREE.Vector3();
    this.camera.getWorldDirection(direction);

    // Add a tiny bit of inaccuracy based on the crosshair's current spread.
    // 5% is always present so shots aren't pixel-perfect even at full accuracy.
    const accuracy = (crosshair.getAccuracy() - 100 || 5) / 1000;
    direction.x += (Math.random() - 0.5) * accuracy;
    direction.y += (Math.random() - 0.5) * accuracy;
    direction.z += (Math.random() - 0.5) * accuracy;

    const bullet = Bullet.from(weapon.bullet);
    // shotFrom = camera.position − direction × 0.1, computed *without* mutating
    // either the camera position or the direction vector. Using `.sub()` here
    // would silently move the player's camera each shot, producing a one-frame
    // forward/back camera jitter on every trigger pull (the reason for the
    // previous "shake" symptom).
    bullet.shotFrom.copy(this.camera.position).addScaledVector(direction, -0.1);
    bullet.position.copy(this.camera.position);
    // addScaledVector reads `direction` without modifying it, so this still
    // sees the un-shrunk direction and the bullet flies at its configured speed.
    bullet.velocity.addScaledVector(direction, weapon.bullet.speed);

    this.scene.add(bullet);
    this.bullets.add(bullet);

    return bullet;
  }

  update(weapon: Weapon) {
    // Expire old holes. No need to update positions — they're parented to the
    // hit object so the scene-graph transform handles tracking automatically.
    this.bulletHoles = this.bulletHoles.filter(({ timestamp, sphere }) => {
      const keep = timestamp + BULLET_HOLE_LIFETIME_MS > Date.now();
      if (!keep) sphere.removeFromParent();
      return keep;
    });

    BulletLoop: for (const bullet of this.bullets) {
      bullet.update();

      if (bullet.isEffective(weapon)) {
        for (const intersection of this.detectIntersections(bullet)) {
          // Skip helper objects — only world geometry should register hits.
          if (intersection.object instanceof THREE.AxesHelper) continue;
          if (intersection.object instanceof THREE.GridHelper) continue;

          this.attachBulletHole(intersection, bullet);
          this.applyForce(intersection, bullet);
          this.removeBullet(bullet);

          continue BulletLoop; // One bullet hits at most one object.
        }
      }

      // Out of range or off-screen — drop it.
      this.removeBullet(bullet);
    }
  }

  private removeBullet(bullet: Bullet) {
    this.scene.remove(bullet);
    this.bullets.remove(bullet);
  }

  private detectIntersections(bullet: Bullet) {
    const raycaster = new THREE.Raycaster();
    // Raycaster needs a unit-length direction. `.normalize()` is in-place, so
    // clone first — otherwise the bullet's velocity gets clobbered to length 1
    // after the first raycast and the weapon's `speed` setting stops mattering.
    raycaster.set(bullet.position, bullet.velocity.clone().normalize());
    return raycaster.intersectObject(this.scene, true);
  }

  /**
   * Parents a small sphere to whatever was hit. Because Three.js applies parent
   * transforms during rendering, the marker automatically tracks moving targets
   * (e.g. a Box being knocked by physics) without any per-frame bookkeeping.
   */
  private attachBulletHole(intersection: THREE.Intersection, bullet: Bullet) {
    const target = intersection.object;
    const radius = bullet.size / 2;

    const sphere = new THREE.Mesh(new THREE.SphereGeometry(radius, 8, 8), new THREE.MeshBasicMaterial({ color: bullet.color }));

    // The marker is parented to `target`, so Three.js will multiply its
    // transform by `target.matrixWorld` on render. If the target has a
    // non-unit scale (the ground mesh, for instance, has scale = 10),
    // the marker would render that much larger and the inset distance
    // would be similarly stretched. We do all the geometry in world
    // space first, then translate position into target-local space and
    // apply an inverse-scale so the visible marker reads at true size
    // regardless of how the target's local space is stretched.

    // World-space surface normal: transform the local face normal by the
    // target's world matrix. Falls back to "up" if no face is reported.
    const worldNormal = intersection.face?.normal
      ? intersection.face.normal.clone().transformDirection(target.matrixWorld).normalize()
      : new THREE.Vector3(0, 1, 0);

    // World-space marker position: hit point inset slightly along -normal
    // so the sphere sits flush with the surface rather than perched on it.
    const worldPos = intersection.point.clone().addScaledVector(worldNormal, -radius * 0.25);

    // Translate world position into target's local frame for storage.
    sphere.position.copy(target.worldToLocal(worldPos));

    // Counter the target's world scale so the geometry renders at its
    // true bullet caliber regardless of parent stretch.
    const worldScale = new THREE.Vector3();
    target.getWorldScale(worldScale);
    sphere.scale.set(1 / worldScale.x, 1 / worldScale.y, 1 / worldScale.z);

    target.add(sphere);
    this.bulletHoles.push({ sphere, timestamp: Date.now() });
  }

  private applyForce(intersection: THREE.Intersection, bullet: Bullet) {
    if (!(intersection.object instanceof RigidBody)) return;

    // Plain centre-of-mass impulse — no off-centre application, so CANNON
    // doesn't induce extra rotation. Boxes still tumble naturally when they
    // collide with each other or the ground; we just don't add cartoonish
    // spin from the bullet itself. Static plinth bodies override applyImpulse
    // as a no-op and shrug it off.
    const direction = new THREE.Vector3();
    this.camera.getWorldDirection(direction);
    const impulse = new CANNON.Vec3(direction.x * bullet.damage, direction.y * bullet.damage, direction.z * bullet.damage);
    intersection.object.applyImpulse(impulse);
  }
}
