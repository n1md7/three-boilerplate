import { DoubleSide, Euler, Mesh, MeshStandardMaterial, PlaneGeometry } from 'three';
import { RigidBody } from '@/src/abstract/RigidBody';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class Ground extends RigidBody {
  body: CANNON.Body;
  mesh: Mesh;

  constructor(readonly size = 100) {
    super();

    this.body = new CANNON.Body({
      type: CANNON.Body.STATIC, // can also be achieved by setting the mass to 0
      shape: new CANNON.Plane(),
    });
    this.body.quaternion.setFromEuler(-Math.PI / 2, 0, 0); // make it face up

    const imageCanvas = document.createElement('canvas')!;
    const context = imageCanvas.getContext('2d')!;

    imageCanvas.width = imageCanvas.height = 100; // 1m x 1m

    context.fillStyle = '#000000';
    context.fillRect(0, 0, 100, 100);

    // Creating a checkerboard pattern with four squares
    // [white, black]
    // [black, white]
    context.fillStyle = '#545050';
    context.fillRect(0, 0, 50, 50);
    context.fillRect(50, 50, 50, 50);

    const textureCanvas = new THREE.CanvasTexture(imageCanvas);
    textureCanvas.colorSpace = THREE.SRGBColorSpace;
    textureCanvas.repeat.set(1000, 1000);
    textureCanvas.wrapS = THREE.RepeatWrapping;
    textureCanvas.wrapT = THREE.RepeatWrapping;

    this.mesh = new Mesh(
      new PlaneGeometry(this.size, this.size),
      new MeshStandardMaterial({
        map: textureCanvas,
        side: DoubleSide,
        wireframe: false,
      })
    );
    this.mesh.scale.set(this.size / 10, this.size / 10, this.size / 10);
    this.mesh.quaternion.setFromEuler(new Euler(-Math.PI / 2, 0, 0)); // make it face up
    this.mesh.position.y = -0.001;
    this.mesh.receiveShadow = true;
    this.add(this.mesh);
  }

  update() {
    this.mesh.position.set(this.body.position.x, this.body.position.y, this.body.position.z);
    this.mesh.quaternion.set(this.body.quaternion.x, this.body.quaternion.y, this.body.quaternion.z, this.body.quaternion.w);
  }
}
