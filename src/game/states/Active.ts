import { Game } from '@/src/game/Game';
import { State } from '@/src/game/types/state.interface';
import { menu } from '@/src/game/ui/menu/Menu';
import * as ui from '@/src/game/ui';

export class ActiveState implements State {
  constructor(private readonly game: Game) {}

  activate() {
    menu.hide();
    ui.crosshair.show();
    document.body.requestPointerLock();
  }

  deactivate() {}

  update() {
    this.game.nextTick();
  }
}
