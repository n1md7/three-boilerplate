import { State } from '@/src/game/types/state.interface';
import { menu } from '@/src/game/ui/menu/Menu';
import * as ui from '@/src/game/ui';

export class PausedState implements State {
  constructor() {
    menu.show();
    document.exitPointerLock();
    ui.crosshair.hide();
  }

  update() {
    // Do nothing, for now
  }
}
