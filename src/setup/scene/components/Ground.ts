import { DoubleSide, Euler, Mesh, MeshStandardMaterial, PlaneGeometry, RepeatWrapping, Texture } from 'three';
import { Octree } from 'three/examples/jsm/math/Octree.js';
import { RigidBody } from '@/src/abstract/RigidBody';
import * as THREE from 'three';

export class Ground extends RigidBody {
  constructor(readonly texture: Texture, readonly world: Octree, readonly width = 100, readonly depth = 100) {
    super();

    this.texture = texture.clone();

    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.repeat.set(this.width, this.depth);

    const ground = new Mesh(
      new PlaneGeometry(256, 256),
      new MeshStandardMaterial({
        map: texture,
        side: DoubleSide,
        wireframe: false,
      })
    );
    ground.quaternion.setFromEuler(new Euler(-Math.PI / 2, 0, 0)); // make it face up
    ground.position.y = -0.01;
    ground.receiveShadow = true;

    this.add(ground, new THREE.AxesHelper(1), new THREE.GridHelper(128, 128));

    this.world.fromGraphNode(ground);
  }

  update() {}
}
