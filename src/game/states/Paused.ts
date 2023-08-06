import { State } from '@/src/game/types/state.interface';
import { menu } from '@/src/game/ui/menu/Menu';
import * as ui from '@/src/game/ui';

export class PausedState implements State {
  constructor() {
    menu.show();
    ui.crosshair.hide();
    document.exitPointerLock();
  }

  update() {
    // Do nothing, for now
  }
}
