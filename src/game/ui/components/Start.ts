import { ElementAbstract } from '@/src/game/ui/components/Element.abstract';

export default class Start extends ElementAbstract<HTMLButtonElement> {
  constructor() {
    super(document.querySelector('#start'));
  }

  click(callback: () => void) {
    this.element.addEventListener('click', callback);
  }
}

export const start = new Start();
