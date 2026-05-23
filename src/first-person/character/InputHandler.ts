import { Command } from '@/src/first-person/character/commands/Command';
import { CharacterCommands } from '@/src/first-person/character/commands/Commands';
import { Move } from '@/src/first-person/character/commands/Move';
import { Sprint } from '@/src/first-person/character/commands/Sprint';
import { Jump } from '@/src/first-person/character/commands/Jump';
import { Character } from '@/src/first-person/Character';
import { Camera } from '@/src/setup';

export type Code = KeyboardEvent['code'];

/**
 * Maps keyboard codes to Command instances and forwards key events to the
 * CharacterCommands invoker. Single source of truth for held-key bindings.
 */
export class InputHandler {
  private readonly keys: Map<Code, Command> = new Map();

  constructor(
    character: Character,
    camera: Camera,
    private readonly commands: CharacterCommands,
  ) {
    this.keys.set('KeyW', new Move(character, camera, 'forward'));
    this.keys.set('KeyA', new Move(character, camera, 'left'));
    this.keys.set('KeyS', new Move(character, camera, 'backward'));
    this.keys.set('KeyD', new Move(character, camera, 'right'));
    this.keys.set('ShiftLeft', new Sprint(character, camera));
    this.keys.set('Space', new Jump(character, camera));
  }

  handleInput(key: string): void {
    const command = this.keys.get(key);
    if (command) this.commands.add(key, command);
  }

  releaseInput(key: string): void {
    this.commands.remove(key);
  }
}
