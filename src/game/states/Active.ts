import { Game } from '@/src/game/Game';
import { GameState } from '@/src/game/types/state.interface';
import { menu } from '@/src/game/ui/menu/Menu';
import * as ui from '@/src/game/ui';
import { AbstractState } from '@/src/game/states/State';

export class ActiveState extends AbstractState implements GameState {
  constructor(game: Game) {
    super(game);
  }

  override activate() {
    menu.hide();
    ui.crosshair.show();
    document.body.requestPointerLock();
  }

  override update() {
    this.game.nextTick();
  }
}
