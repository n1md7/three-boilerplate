import { ElementAbstract } from '@/src/game/ui/components/Element.abstract';
import Resume from '@/src/game/ui/components/Resume';

export default class Menu extends ElementAbstract<HTMLDivElement> {
  readonly resume: Resume;

  constructor() {
    super(document.querySelector('div.menu'));
    this.resume = new Resume();
  }
}

export const menu = new Menu();
