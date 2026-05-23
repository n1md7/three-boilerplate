import { Vector3 } from 'three';
import { Camera } from '@/src/setup';
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
 * First-person character — fully CANNON-based.
 *
 * The player is a fixed-rotation dynamic CANNON.Body in the same world the
 * boxes and ball live in. CANNON handles gravity, ground collisions and the
 * dynamic collisions with knocked-over boxes/ball for free — there's no
 * separate Octree to keep in sync any more.
 *
 * Movement model:
 *   • Move commands accumulate a unit input vector each frame.
 *   • update() lerps body.velocity.{x,z} toward `input × stateSpeed`. The
 *     vertical component is left to CANNON (gravity + jump impulse).
 *   • Air control lerps more slowly, so mid-air direction changes are damped.
 *   • Grounded state is derived from the world contact list — any contact on
 *     this body with a normal pointing roughly up counts as floor.
 */
export class Character {
  // Body geometry (a box, used as a stand-in for a capsule — simpler and works
  // well against axis-aligned obstacles).
  private readonly radius = 0.35;
  private readonly height = 1.45;

  // Movement tuning.
  private readonly jumpVelocity = 6; // m/s vertical impulse on jump (~1.8 m peak)
  /**
   * Air-control responsiveness — only applies while airborne. On the ground we
   * set velocity directly (FPS-arcade feel) so no lerp coefficient is needed.
   */
  private readonly airResponsiveness = 8;

  // Headbob tuning — exposed live via lil-gui (see setupHeadbobGui). The camera
  // Y is offset by |sin| of an accumulating phase (sharp upward "footstep"
  // feel). Amplitude and frequency both scale with horizontal speed so sprint
  // bobs harder and faster than walk; the whole thing smoothly ramps on and
  // off via `bobIntensity` to avoid snapping.
  // Not `readonly` so the GUI can mutate them at runtime.
  private bobAmplitude = 0.07; // metres at base walk speed
  private bobFrequencyBase = 1.9; // bobs/sec at base walk speed
  /** Reference horizontal speed at which `bobFrequencyBase` and `bobAmplitude` apply. */
  private bobReferenceSpeed = 7;
  /** How fast the bob ramps in/out as you start/stop moving (per-second). */
  private bobOnsetRate = 8;

  private bobTime = 0; // accumulating bob phase (in cycles)
  private bobIntensity = 0; // smoothed 0…1; how much bob is currently visible
  private headbobOffsetY = 0; // current vertical offset applied to the camera

  private readonly body: CANNON.Body;
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
    private readonly physicsWorld: CANNON.World,
    scene: ThreeScene,
    gui: GUI,
    private readonly spawnPoint = new Vector3(0, 2, 4),
  ) {
    this.body = this.createBody();
    this.body.position.set(this.spawnPoint.x, this.spawnPoint.y + this.height / 2, this.spawnPoint.z);
    this.physicsWorld.addBody(this.body);
    this.setupPlayerContactMaterial();

    this.inputVector = new Vector3();

    this.commands = new CharacterCommands();
    this._states = new CharacterStates();
    this.inputHandler = new InputHandler(this, camera, this.commands);
    this.inputController = new InputController(this.inputHandler);
    this.mouseController = new MouseController(camera);
    this.flashlight = new FlashLight(gui.addFolder('Flashlight'));
    this.weaponController = new WeaponController(gui.addFolder('Weapons'), scene, camera);

    scene.add(this.flashlight, this.flashlight.target);

    this.setupHeadbobGui(gui);
  }

  /**
   * Adds live-tweakable headbob sliders under the Player folder.
   *
   * lil-gui's TypeScript signature enforces `keyof this` on the property key,
   * which blocks direct binding to private fields. We use the same proxy
   * pattern Weapon.ts uses — a closure-bound object whose getter/setters
   * reflect into the private fields. The fields themselves stay encapsulated.
   */
  private setupHeadbobGui(gui: GUI) {
    const folder = gui.addFolder('Headbob');
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    const tunables = {
      get amplitude(): number {
        return self.bobAmplitude;
      },
      set amplitude(v: number) {
        self.bobAmplitude = v;
      },
      get frequency(): number {
        return self.bobFrequencyBase;
      },
      set frequency(v: number) {
        self.bobFrequencyBase = v;
      },
      get refSpeed(): number {
        return self.bobReferenceSpeed;
      },
      set refSpeed(v: number) {
        self.bobReferenceSpeed = v;
      },
      get onsetRate(): number {
        return self.bobOnsetRate;
      },
      set onsetRate(v: number) {
        self.bobOnsetRate = v;
      },
    };
    folder.add(tunables, 'amplitude').min(0).max(0.2).step(0.005).name('amplitude (m)');
    folder.add(tunables, 'frequency').min(0.5).max(4).step(0.1).name('frequency (Hz)');
    folder.add(tunables, 'refSpeed').min(3).max(15).step(0.5).name('ref speed (m/s)');
    folder.add(tunables, 'onsetRate').min(1).max(20).step(1).name('onset rate');
    folder.close();
  }

  // ───── Public API for Command objects ─────

  /** Accumulate raw input direction (Character clamps + applies in update). */
  move(direction: Vector3): void {
    this.inputVector.add(direction);
  }

  /** Apply a one-shot vertical impulse if grounded. */
  jump(): void {
    if (this.isGrounded) {
      this.body.velocity.y = this.jumpVelocity;
    }
  }

  // ───── Public API for the Game ─────

  get states() {
    return this._states;
  }

  get weapon() {
    return this.weaponController;
  }

  reset() {
    this.body.position.set(this.spawnPoint.x, this.spawnPoint.y + this.height / 2, this.spawnPoint.z);
    this.body.velocity.set(0, 0, 0);
    this.body.angularVelocity.set(0, 0, 0);
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
    if (this.body.position.y < -32) this.reset();

    // State follows the active commands.
    this.deriveState();

    // Collect input from commands.
    this.inputVector.set(0, 0, 0);
    this.commands.execute(delta);

    // Clamp combined input to ≤1 so diagonals don't outpace cardinals.
    const inputLenSq = this.inputVector.lengthSq();
    if (inputLenSq > 1) this.inputVector.divideScalar(Math.sqrt(inputLenSq));

    // Update grounded state from world contacts before deciding how to steer.
    this.updateGroundedState();

    // Horizontal velocity model: instant on ground, soft lerp in air.
    //   • On ground we *write* the target velocity directly each frame —
    //     this is the standard arcade-FPS feel: no acceleration ramp, no
    //     "dragging-a-fridge" inertia, just snap to top speed and snap to
    //     stop. The frictionless player ContactMaterial keeps CANNON from
    //     undoing it during the next physics step.
    //   • In air we lerp toward the target so jump momentum is preserved
    //     and mid-air direction changes are gentle (committed jumps feel
    //     better than infinitely-controllable ones).
    const speed = this._states.currentState.getSpeed();
    const targetX = this.inputVector.x * speed;
    const targetZ = this.inputVector.z * speed;

    if (this.isGrounded) {
      this.body.velocity.x = targetX;
      this.body.velocity.z = targetZ;
    } else {
      const t = Math.min(1, delta * this.airResponsiveness);
      this.body.velocity.x += (targetX - this.body.velocity.x) * t;
      this.body.velocity.z += (targetZ - this.body.velocity.z) * t;
    }
    // y is left for CANNON: gravity + jump impulse.

    // Headbob — advance/decay the phase, then place the camera at eye height
    // plus the current bob offset. Weapon.adjustBy reads camera.position, so
    // the weapon inherits the bob automatically without any extra plumbing.
    this.updateHeadbob(delta);
    this.camera.position.set(
      this.body.position.x,
      this.body.position.y + this.height / 2 - this.radius + this.headbobOffsetY,
      this.body.position.z,
    );

    this.flashlight.adjustBy(this.camera);
    this.weaponController.adjustBy(this.camera);
    this.weaponController.update(delta);

    this.updateCrosshair();
  }

  // ───── Internals ─────

  /**
   * Box body with fixed rotation so the player never tips over. A Box stand-in
   * for a capsule is fine for cube-shaped obstacles — CANNON's contact solver
   * handles it cleanly.
   *
   * The body is tagged with a dedicated material so we can configure
   * player-vs-world friction independently of world-vs-world friction in
   * setupPlayerContactMaterial().
   */
  private createBody(): CANNON.Body {
    const body = new CANNON.Body({
      mass: 70, // kg
      material: new CANNON.Material('player'),
      shape: new CANNON.Box(new CANNON.Vec3(this.radius, this.height / 2, this.radius)),
      fixedRotation: true,
      linearDamping: 0,
      angularDamping: 1,
    });
    body.updateMassProperties();
    return body;
  }

  /**
   * Adds a frictionless ContactMaterial between the player and every other
   * body in the world (which all share the world's default material). Without
   * this, the default ~0.3 friction continuously brakes the player against
   * the ground and any wall it touches — making top-speed feel sluggish.
   * World-vs-world friction (box-on-box, box-on-ground) is unaffected.
   */
  private setupPlayerContactMaterial() {
    const playerMaterial = this.body.material;
    if (!playerMaterial) return;
    const contact = new CANNON.ContactMaterial(playerMaterial, this.physicsWorld.defaultMaterial, {
      friction: 0,
      restitution: 0,
    });
    this.physicsWorld.addContactMaterial(contact);
  }

  private deriveState() {
    const isMoving = this.commands.hasKind('move');
    const isSprinting = this.commands.hasKind('sprint');

    if (!isMoving) this._states.idle();
    else if (isSprinting) this._states.sprint();
    else this._states.walk();
  }

  /**
   * True if any contact in the world involves this body with a roughly-upward
   * surface normal. CANNON's contact.ni points from `bi` toward `bj`, so the
   * sign of the y-component depends on which side our body sits on.
   */
  private updateGroundedState() {
    this.isGrounded = false;
    for (const contact of this.physicsWorld.contacts) {
      if (contact.bi !== this.body && contact.bj !== this.body) continue;
      const isBi = contact.bi === this.body;
      // We want the normal that points FROM the surface INTO us — that's
      // -ni if we are bi, +ni if we are bj.
      const ny = isBi ? -contact.ni.y : contact.ni.y;
      if (ny > 0.5) {
        this.isGrounded = true;
        return;
      }
    }
  }

  /**
   * Headbob — a small, organic vertical bob of the camera while the player is
   * grounded and moving. Implemented as:
   *
   *   • A phase accumulator (`bobTime`) advanced by `speed × frequencyBase`
   *     so faster movement bobs more quickly per second.
   *   • |sin(2π × phase)| gives a sharp upward "footstep" shape rather than
   *     a smooth oscillation that dips into negative Y.
   *   • A separate `bobIntensity` lerp ramps the whole effect in/out smoothly
   *     so the bob doesn't snap on the frame the player starts/stops moving.
   *   • Amplitude also scales with speed so sprint bobs harder than walk.
   */
  private updateHeadbob(delta: number) {
    const isMoving = this.commands.hasKind('move');
    const target = this.isGrounded && isMoving ? 1 : 0;
    this.bobIntensity += (target - this.bobIntensity) * Math.min(1, delta * this.bobOnsetRate);

    if (this.isGrounded && isMoving) {
      const horizSpeed = Math.hypot(this.body.velocity.x, this.body.velocity.z);
      const speedRatio = horizSpeed / this.bobReferenceSpeed;
      // Cycles-per-second scales linearly with horizontal speed.
      this.bobTime += delta * this.bobFrequencyBase * speedRatio;
    }

    if (this.bobIntensity < 0.001) {
      this.headbobOffsetY = 0;
      return;
    }

    // Amplitude also scales with current speed so sprint reads as more
    // energetic than walk. Use velocity here (not state.getSpeed) so the
    // bob fades as the player decelerates after releasing keys.
    const horizSpeed = Math.hypot(this.body.velocity.x, this.body.velocity.z);
    const ampScale = horizSpeed / this.bobReferenceSpeed;
    const phase = this.bobTime * Math.PI * 2;
    this.headbobOffsetY = Math.abs(Math.sin(phase)) * this.bobAmplitude * ampScale * this.bobIntensity;
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
