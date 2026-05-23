import { Camera } from '@/src/setup';

/**
 * Mouse controller.
 *
 * Owns camera rotation while the pointer is locked, and emits weapon trigger
 * events. Decoupled from the flashlight/weapons themselves — anything that
 * follows the camera does so during the per-frame update inside Character.
 */
export class MouseController extends EventTarget {
  private readonly mouseSensitivity = 0.002;

  private readonly onMouseMoveBound = this.onMouseMove.bind(this);
  private readonly onMouseDownBound = this.onMouseDown.bind(this);
  private readonly onMouseUpBound = this.onMouseUp.bind(this);

  constructor(private readonly camera: Camera) {
    super();
  }

  subscribe() {
    document.addEventListener('mousemove', this.onMouseMoveBound);
    document.addEventListener('mousedown', this.onMouseDownBound);
    document.addEventListener('mouseup', this.onMouseUpBound);
  }

  unsubscribe() {
    document.removeEventListener('mousemove', this.onMouseMoveBound);
    document.removeEventListener('mousedown', this.onMouseDownBound);
    document.removeEventListener('mouseup', this.onMouseUpBound);
  }

  private onMouseMove({ movementX, movementY }: MouseEvent) {
    if (document.pointerLockElement !== document.body) return;

    this.camera.rotation.y -= movementX * this.mouseSensitivity;
    this.camera.rotation.x -= movementY * this.mouseSensitivity;

    // Clamp vertical look so the camera can't flip over.
    this.camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.camera.rotation.x));
  }

  private onMouseDown() {
    if (document.pointerLockElement === null) return;
    this.dispatchEvent(new Event('weapon:start-shoot'));
  }

  private onMouseUp() {
    this.dispatchEvent(new Event('weapon:stop-shoot'));
  }
}
