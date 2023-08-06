import { ElementAbstract } from '@/src/game/ui/components/Element.abstract';

export default class Progress extends ElementAbstract<HTMLDivElement> {
  constructor() {
    super(document.querySelector('#loader'));
  }

  update(progress: number) {
    this.element.innerHTML = `Loading... <br/><br/> ${progress.toFixed(2)}%`;
  }

  displayText(text: string) {
    this.element.innerHTML = text;
  }
}

export const progress = new Progress();
