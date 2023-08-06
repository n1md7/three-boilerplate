export interface State {
  activate(): void;
  deactivate(): void;
  update(): void;
}

export type States = Record<'Idle' | 'Active' | 'Paused', State>;
