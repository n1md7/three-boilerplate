import { State } from '@/src/first-person/character/states/State';

/** Target horizontal speed in metres per second while walking. */
export class WalkState extends State {
  getSpeed(): number {
    return 7;
  }
}
