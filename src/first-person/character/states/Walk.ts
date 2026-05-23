import { State } from '@/src/first-person/character/states/State';

export class WalkState extends State {
  getSpeed(): number {
    return 48;
  }
}
