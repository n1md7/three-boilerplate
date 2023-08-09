import { State } from '@/src/first-person/character/states/State';

export class SprintState extends State {
  getSpeed(): number {
    return 96;
  }
}
