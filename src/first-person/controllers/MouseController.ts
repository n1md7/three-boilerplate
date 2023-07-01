import { Camera } from '@/src/setup';
import { AnimationAction, LoopOnce } from 'three';
import { FlashLight } from '@/src/first-person/components/FlashLight';

export class MouseController {
  private readonly mouseSensitivity = 0.002;

  constructor(
    private readonly camera: Camera,
    private readonly shootAnimation: AnimationAction,
    private readonly flashlight: FlashLight
  ) {}

  subscribe() {
    document.addEventListener('mousemove', this.mouseMoveHandler.bind(this));
    document.addEventListener('click', this.mouseClickHandler.bind(this));
    document.addEventListener('mouseup', this.mouseReleaseHandler.bind(this));
  }

  unsubscribe() {
    document.removeEventListener('mousemove', this.mouseMoveHandler.bind(this));
    document.removeEventListener('click', this.mouseClickHandler.bind(this));
    document.removeEventListener('mouseup', this.mouseReleaseHandler.bind(this));
  }

  private mouseMoveHandler({ movementY, movementX }: MouseEvent) {
    // INFO: only updates camera rotation if pointer is locked
    if (document.pointerLockElement !== document.body) return;
    // INFO: movement(X|Y) are delta values
    this.camera.rotation.y -= movementX * this.mouseSensitivity;
    this.camera.rotation.x -= movementY * this.mouseSensitivity;

    this.flashlight.adjust(this.camera);
  }

  private mouseClickHandler() {}

  private mouseReleaseHandler() {
    if (document.pointerLockElement !== null) {
      // TODO: do gameplay stuff

      this.shootAnimation.loop = LoopOnce;

      this.shootAnimation.reset();

      this.shootAnimation.play();
    }
  }
}
