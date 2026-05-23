import { Command, CommandKind } from '@/src/first-person/character/commands/Command';

/**
 * Invoker for the Command pattern. Owns the lifecycle of active commands —
 * calls start() on add and stop() on remove, and execute() once per frame.
 *
 * Deduplicates browser key-repeat by ignoring re-add of an already-active key.
 */
export class CharacterCommands {
  private readonly commands: Map<string, Command> = new Map();

  add(key: string, command: Command): void {
    if (this.commands.has(key)) return; // browser key-repeat — already active
    this.commands.set(key, command);
    command.start();
  }

  remove(key: string): void {
    const command = this.commands.get(key);
    if (!command) return;
    command.stop();
    this.commands.delete(key);
  }

  execute(delta: number): void {
    for (const command of this.commands.values()) command.execute(delta);
  }

  /** Discriminator-based query — used by Character to derive its movement state. */
  hasKind(kind: CommandKind): boolean {
    for (const command of this.commands.values()) {
      if (command.kind === kind) return true;
    }
    return false;
  }

  getActiveCommandsCount(): number {
    return this.commands.size;
  }
}
