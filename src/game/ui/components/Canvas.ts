import { ElementAbstract } from '@/src/game/ui/components/Element.abstract';

export default class Canvas extends ElementAbstract<HTMLCanvasElement> {
  constructor() {
    super(document.querySelector('#canvas'));
  }

  getElement() {
    return this.element;
  }

  get width() {
    return this.element.width;
  }

  get height() {
    return this.element.height;
  }

  getContext() {
    return this.element.getContext('2d');
  }
}

export const canvas = new Canvas();
