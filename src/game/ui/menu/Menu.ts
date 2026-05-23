import { ElementAbstract } from '@/src/game/ui/components/Element.abstract';
import Resume from '@/src/game/ui/components/Resume';
import Reset from '@/src/game/ui/components/Reset';

export default class Menu extends ElementAbstract<HTMLDivElement> {
  readonly resume: Resume;
  readonly reset: Reset;

  constructor() {
    super(document.querySelector('div.menu'));
    this.resume = new Resume();
    this.reset = new Reset();
  }
}

export const menu = new Menu();
