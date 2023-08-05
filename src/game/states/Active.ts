import { Game } from '@/src/game/Game';
import { State } from '@/src/game/types/state.interface';
import { menu } from '@/src/game/menu/Menu';

export class ActiveState implements State {
  constructor(private game: Game) {
    menu.hide();
    document.body.requestPointerLock();
  }

  update() {
    this.game.nextTick();
  }
}
