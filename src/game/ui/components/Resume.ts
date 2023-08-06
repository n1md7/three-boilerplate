import { ElementAbstract } from '@/src/game/ui/components/Element.abstract';

export default class Resume extends ElementAbstract<HTMLButtonElement> {
  constructor() {
    super(document.querySelector('.resume'));
  }

  click(callback: () => void) {
    this.element.addEventListener('click', callback);
  }
}

export const resume = new Resume();
