import { GameState } from '@/src/game/types/state.interface';
import { menu } from '@/src/game/ui/menu/Menu';
import * as ui from '@/src/game/ui';
import { Game } from '@/src/game/Game';
import { AbstractState } from '@/src/game/states/State';

export class PausedState extends AbstractState implements GameState {
  constructor(game: Game) {
    super(game);
  }

  override activate() {
    menu.show();
    ui.crosshair.hide();
    document.exitPointerLock();
  }
}
