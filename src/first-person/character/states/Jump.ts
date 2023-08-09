import { State } from '@/src/first-person/character/states/State';

export class JumpState extends State {
  getSpeed(): number {
    return 8; // Gives a bit of air control
  }
}
