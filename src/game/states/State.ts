import { State } from '@/src/game/types/state.interface';
import { Game } from '@/src/game/Game';

export abstract class AbstractState implements State {
  protected constructor(protected readonly game: Game) {}

  activate(): void {}

  deactivate(): void {}

  update(): void {}
}
