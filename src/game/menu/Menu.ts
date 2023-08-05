export default class Menu {
  private menuElement: HTMLElement;

  constructor() {
    this.menuElement = document.querySelector('div.menu')!;
  }

  show() {
    this.menuElement.classList.remove('hidden');
  }

  hide() {
    this.menuElement.classList.add('hidden');
  }
}

export const menu = new Menu();
