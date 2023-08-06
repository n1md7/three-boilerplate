import { Game } from '@/src/game/Game';
import { State } from '@/src/game/types/state.interface';
import { menu } from '@/src/game/ui/menu/Menu';
import * as ui from '@/src/game/ui';

export class ActiveState implements State {
  constructor(private game: Game) {
    menu.hide();
    ui.crosshair.show();
    document.body.requestPointerLock();
  }

  update() {
    this.game.nextTick();
  }
}
