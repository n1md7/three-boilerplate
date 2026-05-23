import { Vector3 } from 'three';
import { Camera } from '@/src/setup';
import { Capsule } from 'three/examples/jsm/math/Capsule.js';
import { Octree } from 'three/examples/jsm/math/Octree.js';
import { Scene as ThreeScene } from 'three';
import GUI from 'lil-gui';
import * as CANNON from 'cannon-es';
import { CharacterCommands } from '@/src/first-person/character/commands/Commands';
import { CharacterStates } from '@/src/first-person/character/states/States';
import { InputHandler } from '@/src/first-person/character/InputHandler';
import { InputController } from '@/src/first-person/controllers/InputController';
import { MouseController } from '@/src/first-person/controllers/MouseController';
import { WeaponController } from '@/src/first-person/controllers/WeaponController';
import { FlashLight } from '@/src/first-person/components/FlashLight';
import { crosshair } from '@/src/game/ui';

/**
 * First-person character — self-contained controller.
 *
 * Owns its body + velocity, command/state machines, input plumbing, and the
 * composed weapon/flashlight/mouse subsystems. The Game just constructs one,
 * calls subscribe()/setup()/update(), and renders the weapon scene through
 * the exposed `weapon` accessor.
 *
 * Commands talk to the character only via move() and jump() so velocity stays
 * encapsulated.
 */
export class Character {
  private readonly sps = 16;
  private readonly gravity = 30;
  private readonly jumpVelocity = 10;
  /** Speed scale while airborne — preserves the old "small air control" feel. */
  private readonly airControlFactor = 0.16;

  private readonly body: Capsule;
  private readonly velocity: Vector3;
  /** Per-frame accumulator for move input — Move commands push into this,
   *  then update() clamps its length to ≤1 so diagonals aren't faster than
   *  cardinal moves. */
  private readonly inputVector: Vector3;

  private readonly commands: CharacterCommands;
  private readonly _states: CharacterStates;
  private readonly inputHandler: InputHandler;
  private readonly inputController: InputController;
  private readonly mouseController: MouseController;
  private readonly weaponController: WeaponController;
  private readonly flashlight: FlashLight;

  private isGrounded = false;
  private accuracy = 100;

  constructor(
    private readonly camera: Camera,
    private readonly world: Octree,
    scene: ThreeScene,
    physicsWorld: CANNON.World,
    gui: GUI,
    private readonly spawnPoint = new Vector3(0, 2, 4),
  ) {
    const start = new Vector3(0, 1, 0);
    const end = new Vector3(0, 1.75, 0);
    this.body = new Capsule(start, end, 0.35);
    this.velocity = new Vector3();
    this.inputVector = new Vector3();
    this.body.translate(spawnPoint);

    this.commands = new CharacterCommands();
    this._states = new CharacterStates();
    this.inputHandler = new InputHandler(this, camera, this.commands);
    this.inputController = new InputController(this.inputHandler);
    this.mouseController = new MouseController(camera);
    this.flashlight = new FlashLight(gui.addFolder('Flashlight'));
    this.weaponController = new WeaponController(gui.addFolder('Weapons'), scene, camera, physicsWorld);

    scene.add(this.flashlight, this.flashlight.target);

    this.updateCharacter = this.updateCharacter.bind(this);
  }

  // ───── Public API for Command objects ─────

  /**
   * Accumulate a raw movement input vector. Move commands push their
   * (direction × side-multiplier) here every frame; Character clamps the
   * combined input to length ≤1 in update() so diagonal movement isn't
   * faster than cardinal movement. The input is then scaled by the current
   * state's speed × delta and added to velocity.
   */
  move(direction: Vector3): void {
    this.inputVector.add(direction);
  }

  /** Apply a vertical impulse if grounded. */
  jump(): void {
    if (this.isGrounded) this.velocity.y = this.jumpVelocity;
  }

  // ───── Public API for the Game ─────

  get states() {
    return this._states;
  }

  get capsule() {
    return this.body;
  }

  /** Weapon controller exposes its own scene/camera for the second render pass. */
  get weapon() {
    return this.weaponController;
  }

  reset() {
    this.body.translate(this.spawnPoint.clone().sub(this.body.end));
    this.velocity.set(0, 0, 0);
  }

  setup() {
    this.weaponController.setup();
  }

  subscribe() {
    this.inputController.subscribe();
    this.mouseController.subscribe();

    this.inputController.addEventListener('flashlight:toggle', () => this.flashlight.toggle());
    this.inputController.addEventListener('weapon:reload', () => this.weaponController.reload());
    this.inputController.addEventListener('weapon:switch', (event) => {
      if (event instanceof CustomEvent) {
        this.weaponController.setWeapon(event.detail.weaponIndex);
      }
    });
    this.mouseController.addEventListener('weapon:start-shoot', () => this.weaponController.startShoot());
    this.mouseController.addEventListener('weapon:stop-shoot', () => this.weaponController.stopShoot());
  }

  unsubscribe() {
    this.inputController.unsubscribe();
    this.mouseController.unsubscribe();
  }

  update(delta: number) {
    // Respawn if we fell off the map.
    if (this.body.end.y < -32) this.reset();

    // State follows the active commands every frame.
    this.deriveState();

    // Reset per-frame input, then let move commands fill it.
    this.inputVector.set(0, 0, 0);
    this.commands.execute(delta);

    // Clamp combined input length to ≤1 so that pressing W+D doesn't produce
    // a 1.28-magnitude vector and thus faster diagonal movement. Cardinal
    // weights (back 0.9, strafe 0.8) survive because they keep length <1.
    const inputLenSq = this.inputVector.lengthSq();
    if (inputLenSq > 1) this.inputVector.divideScalar(Math.sqrt(inputLenSq));

    // Convert the clamped input into a velocity contribution.
    const speed = this._states.currentState.getSpeed();
    const factor = this.isGrounded ? 1.0 : this.airControlFactor;
    this.velocity.addScaledVector(this.inputVector, speed * factor * delta);

    // Sub-step capsule physics for stable collisions at high speed.
    const subDelta = Math.min(0.05, delta) / this.sps;
    for (let step = 0; step < this.sps; step++) this.updateCharacter(subDelta);

    // While airborne, hard-cap horizontal velocity to the natural ground
    // terminal so repeated jumps can't slowly accelerate the character past
    // the on-foot top speed. (Ground damping handles this for us when grounded.)
    this.clampAirHorizontalSpeed();

    // Once-per-frame follow-the-camera updates.
    this.flashlight.adjustBy(this.camera);
    this.weaponController.adjustBy(this.camera);
    this.weaponController.update(delta);

    this.updateCrosshair();
  }

  // ───── Internals ─────

  /**
   * Cap horizontal speed while airborne to the natural ground terminal.
   *
   * Why this is needed: in air the movement contribution is scaled by
   * airControlFactor (0.16) but damping is also reduced (×0.1). The damping
   * reduction is larger than the input reduction, so the natural equilibrium
   * velocity in air ends up *higher* than on the ground. Repeated jumping
   * while holding a direction lets velocity creep up toward the air terminal.
   * Clamping fixes that without changing ground feel — when grounded, normal
   * damping is already tight enough to hold velocity at the natural cap.
   */
  private clampAirHorizontalSpeed() {
    if (this.isGrounded) return;
    const speed = this._states.currentState.getSpeed();
    if (speed === 0) return; // idle — let damping decelerate naturally

    // Natural ground terminal ≈ speed * delta / (1 - dampingRetention).
    // With delta=1/60 and ground damping retention ≈ 0.88, that's ≈ speed * 0.139.
    // Use a slightly looser cap (* 0.15) so we don't bite during normal play.
    const maxHorizontal = speed * 0.15;
    const horizSq = this.velocity.x * this.velocity.x + this.velocity.z * this.velocity.z;
    const maxSq = maxHorizontal * maxHorizontal;
    if (horizSq <= maxSq) return;

    const scale = maxHorizontal / Math.sqrt(horizSq);
    this.velocity.x *= scale;
    this.velocity.z *= scale;
  }

  private deriveState() {
    const isMoving = this.commands.hasKind('move');
    const isSprinting = this.commands.hasKind('sprint');

    if (!isMoving) this._states.idle();
    else if (isSprinting) this._states.sprint();
    else this._states.walk();
  }

  private updateCharacter(deltaTime: number) {
    const damping = { val: Math.exp(-8 * deltaTime) - 1 };

    if (!this.isGrounded) {
      this.velocity.y -= this.gravity * deltaTime;
      damping.val *= 0.1; // air resistance
    }

    this.velocity.addScaledVector(this.velocity, damping.val);
    const deltaPosition = this.velocity.clone().multiplyScalar(deltaTime);
    this.body.translate(deltaPosition);

    this.evaluateIntersections();

    this.camera.position.copy(this.body.end);
  }

  private evaluateIntersections() {
    this.isGrounded = false;
    const intersect = this.world.capsuleIntersect(this.body);

    if (!intersect) return;

    this.isGrounded = intersect.normal.y > 0;

    if (!this.isGrounded) {
      this.velocity.addScaledVector(intersect.normal, -intersect.normal.dot(this.velocity));
    }

    this.body.translate(intersect.normal.multiplyScalar(intersect.depth));
  }

  private updateCrosshair() {
    this.accuracy = 100;

    const isSprinting = this.commands.hasKind('sprint');
    const isMoving = this.commands.hasKind('move');
    const isJumpHeld = this.commands.hasKind('jump');

    if (this.weaponController.triggerIsPressed) this.accuracy -= 50;
    if (isMoving) this.accuracy -= 25 + (isSprinting ? 25 : 0);
    if (isJumpHeld) this.accuracy -= 50;

    crosshair.setAccuracy(this.accuracy);
  }
}
