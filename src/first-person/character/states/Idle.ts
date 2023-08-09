import { State } from '@/src/first-person/character/states/State';

export class IdleState extends State {
  getSpeed(): number {
    return 0;
  }
}
