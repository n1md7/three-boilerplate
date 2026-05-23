import { Performance } from '@/src/setup/utils/Performance';
import { WindowUtils } from '@/src/setup/utils/window.utils';
import { Timestamp } from '@/src/setup/utils/Timestamp';
import { Renderer, Camera, Scene } from '@/src/setup';
import { RigidBody } from '@/src/abstract/RigidBody';
import { ActiveState } from '@/src/game/states/Active';
import { PausedState } from '@/src/game/states/Paused';
import { Debug } from '@/src/setup/utils/common';
import * as CANNON from 'cannon-es';
import { Assets } from '@/src/assets';
import { Timer } from 'three';
import GUI from 'lil-gui';
import { IdleState } from '@/src/game/states/Idle';
import { Character } from '@/src/first-person/Character';
import { GameState, GameStates } from '@/src/game/types/state.interface';

/**
 * Top-level orchestrator. Constructs the engine pieces, owns the game-state
 * machine (Idle/Active/Paused), and drives the render loop.
 *
 * Single physics system: CANNON is the only collision/integration world. The
 * player is a fixed-rotation dynamic body inside it, so player-vs-world and
 * player-vs-dynamic-box collision is automatic and always up to date.
 */
export class Game {
  private readonly fps: 30 | 60 | 90 | 120;
  private readonly delay: number;
  private readonly clock: Timer;
  private readonly gui: GUI;
  private readonly resizer: WindowUtils;
  private readonly timestamp: Timestamp;
  private readonly performance: Performance;
  private readonly physicsWorld: CANNON.World;
  private readonly renderer: Renderer;
  private readonly camera: Camera;
  private readonly scene: Scene;
  private readonly player: Character;
  private readonly states: GameStates;
  private state: GameState;

  constructor() {
    this.fps = 60;
    this.delay = 1000 / this.fps;

    this.states = {
      Idle: new IdleState(this),
      Active: new ActiveState(this),
      Paused: new PausedState(this),
    };
    this.state = this.states.Idle;
    this.gui = new GUI();
    this.clock = new Timer();
    this.timestamp = new Timestamp();
    this.performance = new Performance();
    this.physicsWorld = new CANNON.World({ gravity: new CANNON.Vec3(0, -9.82, 0) });
    this.renderer = new Renderer();
    this.camera = new Camera();
    this.scene = new Scene(this.gui.addFolder('Main scene'), this.physicsWorld);

    this.player = new Character(this.camera, this.physicsWorld, this.scene, this.gui.addFolder('Player'));

    this.resizer = new WindowUtils(this.renderer, this.camera, this.player.weapon.camera);
    this.update = this.update.bind(this);
    this.setup = this.setup.bind(this);
  }

  setup() {
    this.player.setup();
    this.performance.show();
    this.resizer.subscribe();
    this.gui.show(Debug.enabled());
    this.scene.addLight().addGround().addSky(Assets.Models.Sky).addDemoStage(Assets.Textures.Box);
    this.setState('Active');
    this.player.subscribe();

    return this;
  }

  private setState(state: keyof GameStates) {
    this.state.deactivate();
    this.state = this.states[state];
    this.state.activate();
  }

  start() {
    return this.update();
  }

  private update() {
    this.performance.start();
    this.state.update();
    this.performance.end();
    requestAnimationFrame(this.update);
  }

  nextTick() {
    this.physicsWorld.fixedStep(1 / this.fps);
    this.clock.update();
    const delta = this.clock.getDelta();

    if (this.timestamp.delta < this.delay) {
      this.timestamp.update();
      return;
    }

    if (this.camera.position.y <= -25) this.player.reset();

    // Sync every dynamic mesh transform to its CANNON body before driving
    // player logic — so the player sees the latest world state.
    for (const child of this.scene.children) {
      if (child instanceof RigidBody) child.update();
    }

    this.player.update(delta);

    // Main world pass.
    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);

    // Second pass — render the weapon scene on top of everything.
    this.renderer.clearDepth();
    this.camera.getWorldPosition(this.player.weapon.camera.position);
    this.camera.getWorldQuaternion(this.player.weapon.camera.quaternion);
    this.renderer.render(this.player.weapon.scene, this.player.weapon.camera);

    this.timestamp.update();
  }

  pause() {
    this.setState('Paused');
  }

  resume() {
    this.setState('Active');
  }

  /**
   * Restores the demo stage's dynamic bodies to their spawn poses and resets
   * the player. Does NOT exit the paused state — the menu stays open so the
   * player can review the controls or resume on their own terms.
   */
  resetScene() {
    this.scene.resetWorld();
    this.player.reset();
  }
}
