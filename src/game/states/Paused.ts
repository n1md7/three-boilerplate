import { State } from '@/src/game/types/state.interface';
import { menu } from '@/src/game/ui/menu/Menu';
import * as ui from '@/src/game/ui';
import { Game } from '@/src/game/Game';

export class PausedState implements State {
  constructor(_game: Game) {}

  activate() {
    menu.show();
    ui.crosshair.hide();
    document.exitPointerLock();
  }

  deactivate() {}

  update() {}
}
