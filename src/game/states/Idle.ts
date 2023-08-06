import { State } from '@/src/game/types/state.interface';
import { Game } from '@/src/game/Game';
import { AbstractState } from '@/src/game/states/State';

export class IdleState extends AbstractState implements State {
  constructor(game: Game) {
    super(game);
  }
}
