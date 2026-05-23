import { DoubleSide, Euler, Mesh, MeshStandardMaterial, PlaneGeometry } from 'three';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';

/**
 * Ground is composition-only: it holds a `mesh` and a `body`. It does not
 * extend Mesh because it is not used polymorphically as a Mesh anywhere —
 * Scene reads `ground.mesh` and `ground.body` directly. Removing the base
 * class avoids the previous is-a / has-a contradiction.
 */
export class Ground {
  readonly mesh: Mesh;
  readonly body: CANNON.Body;

  constructor(readonly size = 100) {
    this.body = new CANNON.Body({
      type: CANNON.Body.STATIC,
      shape: new CANNON.Plane(),
    });
    this.body.quaternion.setFromEuler(-Math.PI / 2, 0, 0); // face up

    const imageCanvas = document.createElement('canvas');
    const context = imageCanvas.getContext('2d')!;

    imageCanvas.width = imageCanvas.height = 100;

    context.fillStyle = '#000000';
    context.fillRect(0, 0, 100, 100);

    // Checkerboard pattern
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
      }),
    );
    this.mesh.scale.set(this.size / 10, this.size / 10, this.size / 10);
    this.mesh.quaternion.setFromEuler(new Euler(-Math.PI / 2, 0, 0));
    this.mesh.position.y = -0.001;
    this.mesh.receiveShadow = true;
  }
}
