import { State } from '@/src/first-person/character/states/State';
import { CharacterState } from '@/src/first-person/interfaces/CharacterState';

export class WalkState extends State implements CharacterState {
  getSpeed(): number {
    return 48;
  }
}
