import { Command } from '@/src/first-person/character/commands/Command';

export class CharacterCommands {
  private readonly commands: Map<string, Command>;

  constructor() {
    this.commands = new Map();
  }

  add(key: string, command: Command): void {
    this.commands.set(key, command);
  }

  execute(delta: number): void {
    for (const [_, command] of this.commands) {
      command.execute(delta);
    }
  }

  remove(key: string): void {
    this.commands.get(key)?.stop();
    this.commands.delete(key);
  }

  getActiveCommandsCount(): number {
    return this.commands.size;
  }
}
