import { Character } from '@/src/first-person/Character';
import { Camera } from '@/src/setup';
import { Command } from '@/src/first-person/character/commands/Command';

export class GoBackward extends Command {
  constructor(character: Character, camera: Camera) {
    super(character, camera);
  }
  execute(delta: number) {
    const normalized = super.getZAxisVector();
    const velocity = this.character.states.currentState.getSpeed();
    this.character.velocity.sub(normalized.multiplyScalar(velocity * delta * 0.9));
    this.character.startMovingWhenIdle();
  }
}
