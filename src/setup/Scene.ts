import { GUI } from 'lil-gui';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { AmbientLight, AxesHelper, GridHelper, HemisphereLight, PointLight } from 'three';
import { Texture, Vector3 } from 'three';
import { Scene as ThreeScene, Color, Fog, PointLightHelper } from 'three';
import { Ground } from '@/src/setup/scene/components/Ground';
import { Box } from '@/src/setup/scene/components/Box';
import { Ball } from '@/src/setup/scene/components/Ball';
import * as CANNON from 'cannon-es';

export default class Scene extends ThreeScene {
  constructor(
    private readonly gui: GUI,
    private readonly physicsWorld: CANNON.World,
    private readonly width = 100,
  ) {
    super();

    this.background = new Color('#1f1e1e');
  }

  addFog() {
    this.fog = new Fog('#0e0d0d', 0, 24);
    return this;
  }

  addAxisHelper() {
    this.add(new AxesHelper(20));
    return this;
  }

  addGridHelper() {
    this.add(new GridHelper(32, 32, 0x888888, 0x444444));
    return this;
  }

  addLight() {
    const hemi = new HemisphereLight('#a8c4ff', '#3a2a1a', 1.2);
    const ambient = new AmbientLight('#ffffff', 0.4);
    const point = new PointLight('#fff5d6', 200, 100, 1.5);
    point.castShadow = true;
    point.position.set(2.5, 7.5, 15);

    this.add(hemi, ambient, point, new PointLightHelper(point));

    const gui = this.gui.addFolder('Light');
    gui.add(point, 'intensity', 0, 500, 0.5).name('point intensity');
    gui.addColor(point, 'color').name('point color');
    gui.add(point, 'distance', 0, 200, 0.5).name('point distance');
    gui.add(point, 'decay', 0, 4, 0.05).name('point decay');
    gui.add(hemi, 'intensity', 0, 5, 0.01).name('hemi intensity');
    gui.add(ambient, 'intensity', 0, 2, 0.01).name('ambient intensity');
    gui.close();

    return this;
  }

  addGround() {
    const ground = new Ground(this.width);
    // Tag with the world's default material so the player's frictionless
    // ContactMaterial pair lookup actually matches this body (cannon-es only
    // looks up paired ContactMaterials when *both* bodies have non-null materials).
    ground.body.material = this.physicsWorld.defaultMaterial;
    this.add(ground.mesh);
    this.physicsWorld.addBody(ground.body);
    return this;
  }

  addSky(sky: GLTF) {
    sky.scene.scale.set(100, 100, 100);
    this.add(sky.scene);
    return this;
  }

  /**
   * Curated shoot-and-tumble demo stage. Every cube and the bowling ball is a
   * full CANNON RigidBody, so shooting any one of them imparts an impulse and
   * tumbles the stack. Player collision against all of these is handled by
   * CANNON automatically.
   */
  addDemoStage(texture: Texture) {
    this.addPyramid(texture, new Vector3(0, 0, -28));
    this.addCastleWall(texture, new Vector3(-18, 0, -16));
    this.addWatchtower(texture, new Vector3(20, 0, -14));
    this.addBowlingPins(texture, new Vector3(0, 0, -10));
    this.addCrateStack(texture, new Vector3(-10, 0, -6));
    this.addShootingRange(texture, new Vector3(10, 0, -6));
    this.addBowlingBall(new Vector3(0, 0, -3));
    return this;
  }

  /** 3-tier stepped pyramid: 5×5 + 3×3 + 1 = 35 cubes. */
  private addPyramid(texture: Texture, origin: Vector3) {
    const map = texture.clone();
    const radii = [2, 1, 0];
    radii.forEach((radius, level) => {
      for (let x = -radius; x <= radius; x++) {
        for (let z = -radius; z <= radius; z++) {
          this.placeBox(map, 1, origin.x + x, origin.y + 0.5 + level, origin.z + z);
        }
      }
    });
  }

  /** Castle wall with crenellations. */
  private addCastleWall(texture: Texture, origin: Vector3) {
    const map = texture.clone();
    const width = 7;
    const offsetX = (width - 1) / 2;

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < 3; y++) {
        this.placeBox(map, 1, origin.x + x - offsetX, origin.y + 0.5 + y, origin.z);
      }
    }
    for (let x = 0; x < width; x += 2) {
      this.placeBox(map, 1, origin.x + x - offsetX, origin.y + 3.5, origin.z);
    }
  }

  /** Single column 8 cubes tall. */
  private addWatchtower(texture: Texture, origin: Vector3) {
    const map = texture.clone();
    for (let y = 0; y < 8; y++) {
      this.placeBox(map, 1, origin.x, origin.y + 0.5 + y, origin.z);
    }
  }

  /** 10 small cubes in a classic 1/2/3/4 triangle. */
  private addBowlingPins(texture: Texture, origin: Vector3) {
    const map = texture.clone();
    const size = 0.6;
    const spacing = size * 1.4;
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col <= row; col++) {
        const x = origin.x + (col - row / 2) * spacing;
        const z = origin.z - row * spacing;
        this.placeBox(map, size, x, origin.y + size / 2, z);
      }
    }
  }

  /** Asymmetric warehouse-style stack. */
  private addCrateStack(texture: Texture, origin: Vector3) {
    const map = texture.clone();
    const layout: ReadonlyArray<readonly [number, number, number]> = [
      [-1, 0.5, 0],
      [0, 0.5, 0],
      [1, 0.5, 0],
      [-0.5, 1.5, 0],
      [0.5, 1.5, 0],
      [0, 2.5, 0],
      [-1, 0.5, 1],
      [0, 0.5, 1],
      [-0.5, 1.5, 1],
    ];
    for (const [dx, dy, dz] of layout) {
      this.placeBox(map, 1, origin.x + dx, origin.y + dy, origin.z + dz);
    }
  }

  /** Carnival shooting range — static plinth + 10 tiny bottle-cubes. */
  private addShootingRange(texture: Texture, origin: Vector3) {
    const map = texture.clone();
    const plinthLength = 6;
    const plinthHeight = 0.6;
    const plinthDepth = 1;

    for (let i = -1; i <= 1; i++) {
      const x = origin.x + i * (plinthLength / 3);
      const plinth = new Box(map, plinthDepth, true);
      plinth.body.position.set(x, origin.y + plinthHeight / 2, origin.z);
      plinth.position.copy(plinth.body.position as unknown as Vector3);
      plinth.body.material = this.physicsWorld.defaultMaterial;
      plinth.castShadow = true;
      plinth.receiveShadow = true;
      this.physicsWorld.addBody(plinth.body);
      this.add(plinth);
    }

    const bottleSize = 0.22;
    const count = 10;
    const startX = origin.x - plinthLength / 2 + bottleSize;
    const step = (plinthLength - bottleSize * 2) / (count - 1);
    const bottleY = origin.y + plinthHeight + bottleSize / 2;
    for (let i = 0; i < count; i++) {
      this.placeBox(map, bottleSize, startX + i * step, bottleY, origin.z);
    }
  }

  /** Heavy bowling ball that rolls satisfyingly when shot. */
  private addBowlingBall(origin: Vector3) {
    const radius = 0.45;
    const ball = new Ball(radius, 20, '#2a2a2a');
    ball.body.position.set(origin.x, origin.y + radius, origin.z);
    ball.position.copy(ball.body.position as unknown as Vector3);
    ball.body.material = this.physicsWorld.defaultMaterial;
    ball.castShadow = true;
    ball.receiveShadow = true;
    this.physicsWorld.addBody(ball.body);
    this.add(ball);
  }

  /** Common construction step for every cube. */
  private placeBox(map: Texture, size: number, x: number, y: number, z: number) {
    const box = new Box(map, size);
    box.body.position.set(x, y, z);
    box.position.set(x, y, z);
    box.body.material = this.physicsWorld.defaultMaterial;
    box.castShadow = true;
    box.receiveShadow = true;
    this.physicsWorld.addBody(box.body);
    this.add(box);
  }
}
