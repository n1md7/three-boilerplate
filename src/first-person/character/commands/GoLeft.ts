import { Character } from '@/src/first-person/Character';
import { Camera } from '@/src/setup';
import { Command } from '@/src/first-person/character/commands/Command';

export class GoLeft extends Command {
  constructor(character: Character, camera: Camera) {
    super(character, camera);
  }
  override execute(delta: number) {
    super.execute(delta);

    const normalized = super.getXAxisVector();
    const velocity = this.character.getState().getSpeed();
    this.character.velocity.sub(normalized.multiplyScalar(velocity * delta));
  }
}
