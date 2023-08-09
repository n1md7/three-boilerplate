import { GameState } from '@/src/game/types/state.interface';
import { Game } from '@/src/game/Game';

export abstract class AbstractState implements GameState {
  protected constructor(protected readonly game: Game) {}

  activate(): void {}

  deactivate(): void {}

  update(): void {}
}
