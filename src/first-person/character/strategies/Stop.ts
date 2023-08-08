import { AbstractStrategy } from '@/src/first-person/character/strategies/Strategy';
import { Character } from '@/src/first-person/Character';
import { Camera } from '@/src/setup';

export class StopStrategy extends AbstractStrategy {
  constructor(character: Character, camera: Camera) {
    super(character, camera);
  }
  update() {}
}
