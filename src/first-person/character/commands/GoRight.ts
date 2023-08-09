import { Character } from '@/src/first-person/Character';
import { Camera } from '@/src/setup';
import { Command } from '@/src/first-person/character/commands/Command';

export class GoRight extends Command {
  constructor(character: Character, camera: Camera) {
    super(character, camera);
  }
  execute(delta: number) {
    const normalized = super.getXAxisVector();
    const velocity = this.character.states.currentState.getSpeed();
    this.character.velocity.add(normalized.multiplyScalar(velocity * delta * 0.8));
    this.character.startMovingWhenIdle();
  }
}
