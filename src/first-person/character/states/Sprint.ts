import { State } from '@/src/first-person/character/states/State';

/** Target horizontal speed in metres per second while sprinting. */
export class SprintState extends State {
  getSpeed(): number {
    return 13;
  }
}
