import { InputHandler } from '@/src/first-person/character/InputHandler';

/**
 * Keyboard controller.
 *
 * Continuous-held keys (WASD, Shift, Space) are routed to the InputHandler,
 * which maps them onto Command objects for the per-frame command loop.
 *
 * One-shot keys (R, F, digit keys) are emitted as events for systems that
 * react to a single press rather than continuous state.
 */
export class InputController extends EventTarget {
  private readonly onKeyDownBound = this.onKeyDown.bind(this);
  private readonly onKeyUpBound = this.onKeyUp.bind(this);

  constructor(private readonly inputHandler: InputHandler) {
    super();
  }

  subscribe() {
    document.addEventListener('keydown', this.onKeyDownBound);
    document.addEventListener('keyup', this.onKeyUpBound);
  }

  unsubscribe() {
    document.removeEventListener('keydown', this.onKeyDownBound);
    document.removeEventListener('keyup', this.onKeyUpBound);
  }

  private onKeyDown(event: KeyboardEvent) {
    this.inputHandler.handleInput(event.code);

    switch (event.code) {
      case 'KeyF':
        this.dispatchEvent(new Event('flashlight:toggle'));
        break;
      case 'KeyR':
        this.dispatchEvent(new Event('weapon:reload'));
        break;
      case 'Digit1':
      case 'Digit2':
      case 'Digit3':
      case 'Digit4':
      case 'Digit5':
      case 'Digit6':
      case 'Digit7':
      case 'Digit8':
      case 'Digit9':
        this.dispatchEvent(
          new CustomEvent('weapon:switch', {
            detail: { weaponIndex: parseInt(event.code.slice(-1), 10) - 1 },
          }),
        );
        break;
    }
  }

  private onKeyUp(event: KeyboardEvent) {
    this.inputHandler.releaseInput(event.code);
  }
}
