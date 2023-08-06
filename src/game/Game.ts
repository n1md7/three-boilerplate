import { Performance } from '@/src/setup/utils/Performance';
import { WindowUtils } from '@/src/setup/utils/window.utils';
import { Octree } from 'three/examples/jsm/math/Octree.js';
import { Timestamp } from '@/src/setup/utils/Timestamp';
import { Renderer, Camera, Scene } from '@/src/setup';
import { RigidBody } from '@/src/abstract/RigidBody';
import { State, States } from '@/src/game/types/state.interface';
import { ActiveState } from '@/src/game/states/Active';
import { PausedState } from '@/src/game/states/Paused';
import { Player } from '@/src/first-person/Player';
import { Debug } from '@/src/setup/utils/common';
import * as CANNON from 'cannon-es';
import { Assets } from '@/src/assets';
import { Clock } from 'three';
import GUI from 'lil-gui';
import { IdleState } from '@/src/game/states/Idle';

export class Game {
  private readonly fps: 30 | 60 | 90 | 120;
  private readonly delay: number;
  private readonly clock: Clock;
  private readonly gui: GUI;
  private readonly resizer: WindowUtils;
  private readonly timestamp: Timestamp;
  private readonly collisionWorld: Octree;
  private readonly performance: Performance;
  private readonly physicsWorld: CANNON.World;
  private readonly renderer: Renderer;
  private readonly camera: Camera;
  private readonly scene: Scene;
  private readonly player: Player;
  private readonly states: States;
  private state: State;

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
    this.clock = new Clock();
    this.timestamp = new Timestamp();
    this.collisionWorld = new Octree();
    this.performance = new Performance();
    this.physicsWorld = new CANNON.World({ gravity: new CANNON.Vec3(0, -9.82, 0) });
    this.renderer = new Renderer();
    this.camera = new Camera();
    this.scene = new Scene(this.gui.addFolder('Main scene'), this.collisionWorld, this.physicsWorld);
    this.player = new Player(this.camera, this.collisionWorld, this.scene, this.physicsWorld, this.gui.addFolder('Player'));
    this.resizer = new WindowUtils(this.renderer, this.camera, this.player.weapon.camera);
    this.update = this.update.bind(this);
    this.setup = this.setup.bind(this);
  }

  setup() {
    this.player.setup();
    this.performance.show();
    this.resizer.subscribe();
    this.gui.show(Debug.enabled());
    this.scene
      .addLight()
      .addGround()
      .addSky(Assets.Models.Sky)
      .addStairs(Assets.Textures.Box)
      .addShootingTarget(Assets.Models.ShootingTarget)
      .addBoxes(Assets.Textures.Box, 64);
    this.setState('Active');

    return this;
  }

  private setState(state: keyof States) {
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
    const delta = this.clock.getDelta();
    if (this.timestamp.delta >= this.delay) {
      if (this.camera.position.y <= -25) this.player.reset();
      this.player.update(delta);

      for (const child of this.scene.children) {
        if (child instanceof RigidBody) child.update();
      }

      this.renderer.clear(); // Clear the color buffer
      this.renderer.render(this.scene, this.camera);

      this.renderer.clearDepth(); // Clear only the depth buffer

      this.camera.getWorldPosition(this.player.weapon.camera.position);
      this.camera.getWorldQuaternion(this.player.weapon.camera.quaternion);

      this.renderer.render(this.player.weapon.scene, this.player.weapon.camera);
    }
    this.timestamp.update();
  }

  pause() {
    this.setState('Paused');
  }

  resume() {
    this.setState('Active');
  }
}
