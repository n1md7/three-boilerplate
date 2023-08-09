export interface GameState {
  activate(): void;
  deactivate(): void;
  update(): void;
}

export type GameStates = Record<'Idle' | 'Active' | 'Paused', GameState>;
