import { Vector2, Vector3 } from 'three';
import { Camera } from '@/src/setup';
import { Capsule } from 'three/examples/jsm/math/Capsule';
import { Octree } from 'three/examples/jsm/math/Octree.js';
import { CharacterCommands } from '@/src/first-person/character/commands/Commands';
import { CharacterStates } from '@/src/first-person/character/states/States';

export class Character {
  private readonly sps = 16; // Steps Per Frame
  private readonly gravity = 30;

  private readonly body: Capsule;
  public readonly velocity: Vector3;

  private isGrounded = false;

  constructor(
    private readonly camera: Camera,
    private readonly world: Octree,
    private readonly commands: CharacterCommands,
    private readonly _states: CharacterStates,
    private readonly spawnPoint = new Vector3(0, 2, 4)
  ) {
    const start = new Vector3(0, 1, 0);
    const end = new Vector3(0, 1.75, 0);
    this.body = new Capsule(start, end, 0.35);
    this.velocity = new Vector3(0); // Stay still at first
    this.body.translate(spawnPoint);

    this.updateCharacter = this.updateCharacter.bind(this);
  }

  get states() {
    return this._states;
  }

  get capsule() {
    return this.body;
  }

  reset() {
    this.body.translate(this.spawnPoint.sub(this.body.end));
  }

  startMovingWhenIdle() {
    if (this.states.isIdle()) this.states.walk();
  }

  update(delta: number) {
    // INFO: Respawn player if it falls off the map
    if (this.body.end.y < -32) this.reset(); // 32 meters below the map or whatever the 1 unit is

    if (this.commands.getActiveCommandsCount() === 0) this._states.idle();

    const deltaTime = Math.min(0.05, delta) / this.sps;

    this.commands.execute(delta);

    // INFO: To enhance collision detection accuracy,
    // we divide the collision checking process into sub-steps.
    // This approach helps mitigate the potential issue of objects
    // passing through each other too rapidly to be detected reliably.
    const frame = { steps: this.sps };
    do this.updateCharacter(deltaTime);
    while (--frame.steps > 0);
  }

  // action(action: Action, deltaTime: number) {
  //   const { goLeft, goRight, goForward, goBackward } = action;
  //   const speedDelta = this.getSpeedDelta(deltaTime, action.sprint);
  //
  //   const forwardVector = this.getForwardVector(new Vector3());
  //   const sideVector = this.getSideVector(new Vector3());
  //
  //   // Makes sure that diagonal movement isn't faster as it would be otherwise
  //   const velocity = goLeft || goRight ? speedDelta * 0.707 : speedDelta;
  //   if (goForward) {
  //     // Forward movement is fastest as long as left or right aren't pressed
  //     this.velocity.add(forwardVector.multiplyScalar(velocity));
  //     if (goLeft) this.velocity.add(sideVector.multiplyScalar(-velocity));
  //     if (goRight) this.velocity.add(sideVector.multiplyScalar(velocity));
  //   } else if (goBackward) {
  //     this.velocity.add(forwardVector.multiplyScalar(-velocity));
  //     if (goLeft) this.velocity.add(sideVector.multiplyScalar(-velocity));
  //     if (goRight) this.velocity.add(sideVector.multiplyScalar(velocity));
  //   } else {
  //     // Sideways movement a bit slower
  //     if (goLeft) this.velocity.add(sideVector.multiplyScalar(-speedDelta * 0.9));
  //     if (goRight) this.velocity.add(sideVector.multiplyScalar(speedDelta * 0.9));
  //   }
  //
  //   if (this.isGrounded && action.jump) {
  //     this.velocity.y = this.jumpVelocity;
  //   }
  // }

  rotation(rotation: Vector2) {
    this.camera.rotation.x = rotation.x;
    this.camera.rotation.y = rotation.y;

    // INFO: Limit the vertical rotation
    this.camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.camera.rotation.x));
  }

  private updateCharacter(deltaTime: number) {
    const damping = { val: Math.exp(-8 * deltaTime) - 1 };

    if (!this.isGrounded) {
      this.velocity.y -= this.gravity * deltaTime;

      // INFO: small air resistance
      damping.val *= 0.1;
    }

    this.velocity.addScaledVector(this.velocity, damping.val);
    const deltaPosition = this.velocity.clone().multiplyScalar(deltaTime);
    this.body.translate(deltaPosition);

    this.evaluateIntersections();

    // Update the camera position
    this.camera.position.copy(this.body.end);
  }

  private evaluateIntersections() {
    this.isGrounded = false;
    const intersect = this.world.capsuleIntersect(this.body);

    if (intersect) {
      this.isGrounded = intersect.normal.y > 0;

      if (!this.isGrounded) {
        this.velocity.addScaledVector(intersect.normal, -intersect.normal.dot(this.velocity));
      }

      this.body.translate(intersect.normal.multiplyScalar(intersect.depth));
    }
  }
}
