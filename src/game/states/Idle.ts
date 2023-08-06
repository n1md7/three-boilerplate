import { State } from '@/src/game/types/state.interface';
import { Game } from '@/src/game/Game';

export class IdleState implements State {
  constructor(_game: Game) {}

  activate() {}

  deactivate() {}

  update() {}
}
