import { AbstractStrategy } from '@/src/first-person/character/strategies/Strategy';
import { Character } from '@/src/first-person/Character';
import { Camera } from '@/src/setup';

export class RightStrategy extends AbstractStrategy {
  constructor(character: Character, camera: Camera) {
    super(character, camera);
  }
  update(delta: number) {
    const normalized = super.getXAxisVector();
    const velocity = this.character.getState().getSpeed();
    this.character.velocity.add(normalized.multiplyScalar(velocity * delta));
  }
}
