import { Command } from '@/src/first-person/character/commands/Command';
import { CharacterCommands } from '@/src/first-person/character/commands/Commands';
import { GoForward } from '@/src/first-person/character/commands/GoForward';
import { Character } from '@/src/first-person/Character';
import { Camera } from '@/src/setup';
import { GoLeft } from '@/src/first-person/character/commands/GoLeft';
import { GoBackward } from '@/src/first-person/character/commands/GoBackward';
import { GoRight } from '@/src/first-person/character/commands/GoRight';
import { GoSprint } from '@/src/first-person/character/commands/GoSprint';

export type Code = KeyboardEvent['code'];
export class InputHandler {
  private readonly commands: CharacterCommands;
  private readonly keys: Map<Code, Command> = new Map();

  constructor(character: Character, camera: Camera, commands: CharacterCommands) {
    this.commands = commands;
    this.keys.set('KeyW', new GoForward(character, camera));
    this.keys.set('KeyA', new GoLeft(character, camera));
    this.keys.set('KeyS', new GoBackward(character, camera));
    this.keys.set('KeyD', new GoRight(character, camera));
    this.keys.set('ShiftLeft', new GoSprint(character, camera));
  }

  handleInput(key: string): void {
    const command = this.keys.get(key);
    if (command) {
      this.commands.add(key, command);
    }
  }

  releaseInput(key: string): void {
    this.commands.remove(key);
  }
}
