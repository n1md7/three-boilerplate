import { PerspectiveCamera, Vector3, AnimationMixer, AnimationAction } from 'three';
import { Capsule } from 'three/examples/jsm/math/Capsule';
import { Octree } from 'three/examples/jsm/math/Octree.js';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { InputController } from '@/src/first-person/controllers/InputController';
import { MouseController } from '@/src/first-person/controllers/MouseController';
import { FlashLight } from '@/src/first-person/components/FlashLight';
import { CrosshairController } from '@/src/first-person/controllers/CrosshairController';

enum WeaponAnimation {
  IDLE = 'deagle_skeleton|idle1',
  SHOOT = 'deagle_skeleton|shoot1',
  RELOAD = 'deagle_skeleton|reload',
  WALK = 'deagle_skeleton|walk1',
}

export class Player {
  private readonly GRAVITY = 30;
  private readonly STEPS_PER_FRAME = 16;
  private readonly playerJumpVelocity = 10;

  private readonly playerBody: Capsule;
  private readonly playerVelocity: Vector3;
  private readonly playerDirection: Vector3;
  private readonly inputController: InputController;
  private readonly mouseController: MouseController;
  private readonly animationMixer: AnimationMixer;
  private readonly shootAnimation: AnimationAction;
  private readonly crosshairController: CrosshairController;

  private playerIsGrounded = false; // On the floor (touching)
  private accuracy = 100;

  constructor(
    private readonly camera: PerspectiveCamera,
    private readonly world: Octree,
    private readonly weapon: GLTF,
    private readonly flashlight: FlashLight
  ) {
    this.playerVelocity = new Vector3();
    this.playerDirection = new Vector3();
    this.playerBody = new Capsule(new Vector3(0, 0.35, 0), new Vector3(0, 1, 0), 0.35);
    this.animationMixer = new AnimationMixer(weapon.scene);
    this.shootAnimation = this.animationMixer.clipAction(
      this.weapon.animations.find(({ name }) => name === WeaponAnimation.SHOOT)!
    );
    this.mouseController = new MouseController(camera, this.shootAnimation, this.flashlight);
    this.inputController = new InputController();
    this.crosshairController = CrosshairController.getInstance();

    this.subscribe();
    // Set Player Y to be 30 units above the ground
    this.playerBody.translate(new Vector3(0, 30, 0));
  }

  subscribe() {
    this.inputController.subscribe();
    this.mouseController.subscribe();

    this.inputController.addEventListener('toggle-flashlight', () => {
      this.flashlight.toggle();
    });
  }

  getSideVector() {
    this.camera.getWorldDirection(this.playerDirection);
    this.playerDirection.y = 0;
    this.playerDirection.normalize();
    this.playerDirection.cross(this.camera.up);

    return this.playerDirection;
  }

  getForwardVector() {
    this.camera.getWorldDirection(this.playerDirection);
    this.playerDirection.y = 0;
    this.playerDirection.normalize();

    return this.playerDirection;
  }

  private evaluateUserInput(deltaTime: number) {
    const speedDelta = this.getSpeedDelta(deltaTime);

    if (this.inputController.says.move.forward) {
      this.playerVelocity.add(this.getForwardVector().multiplyScalar(speedDelta));
    }
    if (this.inputController.says.move.backward) {
      this.playerVelocity.add(this.getForwardVector().multiplyScalar(-speedDelta));
    }
    if (this.inputController.says.move.left) {
      this.playerVelocity.add(this.getSideVector().multiplyScalar(-speedDelta));
    }
    if (this.inputController.says.move.right) {
      this.playerVelocity.add(this.getSideVector().multiplyScalar(speedDelta));
    }

    if (this.playerIsGrounded && this.inputController.says.jump) {
      this.playerVelocity.y = this.playerJumpVelocity;
    }
  }

  private getSpeedDelta(deltaTime: number) {
    // INFO: Not setting to ZERO, it gives a bit of air control when jumping
    const low = this.inputController.says.sprint ? 16 : 8;
    const high = this.inputController.says.sprint ? 96 : 48;

    return deltaTime * (this.playerIsGrounded ? high : low);
  }

  private updatePlayer(deltaTime: number) {
    const damping = { val: Math.exp(-8 * deltaTime) - 1 };

    if (!this.playerIsGrounded) {
      this.playerVelocity.y -= this.GRAVITY * deltaTime;

      // INFO: small air resistance
      damping.val *= 0.1;
    }
    this.playerVelocity.addScaledVector(this.playerVelocity, damping.val);
    const deltaPosition = this.playerVelocity.clone().multiplyScalar(deltaTime);
    this.playerBody.translate(deltaPosition);
    this.evaluateCollisions();

    // Update the camera position
    this.camera.position.copy(this.playerBody.end);

    // Update the flashlight position
    this.flashlight.adjust(this.camera);

    // Calculate the offset of the weapon from the camera
    const weaponOffset = new Vector3(0.32, -0.38, -1.1);
    weaponOffset.applyQuaternion(this.camera.quaternion);

    // Update the weapon position based on the camera position and offset
    this.weapon.scene.position.copy(this.camera.position).add(weaponOffset);

    // Update the weapon rotation to match the camera rotation
    this.weapon.scene.rotation.copy(this.camera.rotation);
    this.weapon.scene.rotateY(Math.PI);
  }

  private evaluateCollisions() {
    this.playerIsGrounded = false;
    const result = this.world.capsuleIntersect(this.playerBody);

    if (result) {
      this.playerIsGrounded = result.normal.y > 0;

      if (!this.playerIsGrounded) {
        this.playerVelocity.addScaledVector(result.normal, -result.normal.dot(this.playerVelocity));
      }

      this.playerBody.translate(result.normal.multiplyScalar(result.depth));
    }
  }

  reset() {
    const center = new Vector3(0, 10, 0);
    this.playerBody.translate(center.sub(this.playerBody.end));
  }

  update(delta: number) {
    const deltaTime = Math.min(0.05, delta) / this.STEPS_PER_FRAME;

    // INFO: To enhance collision detection accuracy,
    // we divide the collision checking process into sub-steps.
    // This approach helps mitigate the potential issue of objects
    // passing through each other too rapidly to be detected reliably.
    for (let i = 0; i < this.STEPS_PER_FRAME; i++) {
      this.evaluateUserInput(deltaTime);
      this.updatePlayer(deltaTime);
    }
    this.updateCrosshair();
    this.animationMixer.update(delta);
  }

  private updateCrosshair() {
    this.accuracy = 100;

    const { sprint, jump, move } = this.inputController.says;

    if (move.anyDirection) this.accuracy -= 25 + (sprint ? 25 : 0);
    if (jump) this.accuracy -= 50;
    this.crosshairController.setAccuracy(this.accuracy);
  }
}
