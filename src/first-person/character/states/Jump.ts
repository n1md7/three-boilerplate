import { State } from '@/src/first-person/character/states/State';

/**
 * Jump state isn't currently entered by the state machine — Jump is handled
 * as a one-shot vertical impulse on the body. Kept here for API completeness.
 */
export class JumpState extends State {
  getSpeed(): number {
    return 0;
  }
}
