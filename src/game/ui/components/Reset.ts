import { ElementAbstract } from '@/src/game/ui/components/Element.abstract';

/**
 * "Reset Scene" button in the pause menu. Same shape as Resume — wires a
 * click callback that Game uses to restore the world to its initial state.
 */
export default class Reset extends ElementAbstract<HTMLButtonElement> {
  constructor() {
    super(document.querySelector('.menu .reset'));
  }

  click(callback: () => void) {
    this.element.addEventListener('click', callback);
  }
}

export const reset = new Reset();
