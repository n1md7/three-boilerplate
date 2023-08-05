import { State } from '@/src/game/types/state.interface';
import { menu } from '@/src/game/menu/Menu';

export class PausedState implements State {
  constructor() {
    menu.show();
    document.exitPointerLock();
  }

  update() {
    // Do nothing, for now
  }
}
