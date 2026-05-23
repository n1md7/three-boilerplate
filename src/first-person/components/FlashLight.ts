import { SpotLight, Vector3 } from 'three';
import { GUI } from 'lil-gui';
import { Camera } from '@/src/setup';

export class FlashLight extends SpotLight {
  constructor(private readonly gui: GUI) {
    // Physical light units (three r155+) — intensity in candelas. The old
    // value of 2 corresponded to legacy units; modern units need ~80–120.
    super('#FFFFFF', 120, 100, Math.PI / 18, 0.15, 1);

    this.castShadow = true;
    this.position.set(2.5, 7.5, 15);

    this.castShadow = true;

    this.shadow.mapSize.width = 1024;
    this.shadow.mapSize.height = 1024;

    this.shadow.camera.near = 500;
    this.shadow.camera.far = 4000;
    this.shadow.camera.fov = 30;

    this.visible = true;

    this.addGUI();
  }

  adjustBy(camera: Camera) {
    // INFO: Move and rotate flashlight with camera
    this.position.copy(camera.position);

    // Calculate the target position for the flashlight based on the camera's rotation
    const targetDistance = 2; // Adjust the distance of the flashlight's target from the camera
    const flashlightTarget = new Vector3().copy(camera.getWorldDirection(new Vector3())).multiplyScalar(targetDistance);
    flashlightTarget.add(this.position);

    // Update the flashlight target position
    this.target.position.copy(flashlightTarget);
  }

  toggle() {
    this.visible = !this.visible;
  }

  private addGUI() {
    this.gui.add(this, 'intensity', 0, 400, 0.5);
    this.gui.addColor(this, 'color');
    this.gui.add(this, 'distance', 0, 100, 0.01);
    this.gui.add(this, 'angle', 0, Math.PI / 2, 0.01);
    this.gui.add(this, 'penumbra', 0, 1, 0.01);
    this.gui.add(this.shadow.camera, 'near', 0, 1000, 0.01);
    this.gui.add(this.shadow.camera, 'far', 1000, 5000, 0.01);
    this.gui.add(this.shadow.camera, 'fov', 0, 180, 0.01);
    this.gui.close();
  }
}
