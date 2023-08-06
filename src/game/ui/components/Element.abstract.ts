import { ElementInterface } from '@/src/game/ui/interfaces/element.interface';

export abstract class ElementAbstract<T extends HTMLElement> implements ElementInterface {
  protected readonly element: T;
  protected constructor(element: T | null) {
    if (!element) throw new Error('Element not found');

    this.element = element;
  }

  show() {
    this.element.removeAttribute('hidden');
  }

  hide() {
    this.element.setAttribute('hidden', '');
  }
}
