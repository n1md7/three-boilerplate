import { Character } from '@/src/first-person/Character';
import { Camera } from '@/src/setup';
import { Command } from '@/src/first-person/character/commands/Command';

export class GoSprint extends Command {
  constructor(character: Character, camera: Camera) {
    super(character, camera);
  }
  execute(_delta: number) {
    this.character.states.sprint();
  }

  override stop() {
    this.character.states.walk();
  }
}
