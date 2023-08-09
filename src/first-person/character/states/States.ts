import { State } from '@/src/first-person/character/states/State';
import { IdleState } from '@/src/first-person/character/states/Idle';
import { SprintState } from '@/src/first-person/character/states/Sprint';
import { WalkState } from '@/src/first-person/character/states/Walk';
import { JumpState } from '@/src/first-person/character/states/Jump';

export class CharacterStates {
  private states: Record<'Idle' | 'Jump' | 'Sprint' | 'Walk', State>;
  private state: State;

  constructor() {
    this.states = {
      Idle: new IdleState(),
      Sprint: new SprintState(),
      Walk: new WalkState(),
      Jump: new JumpState(),
    };
    this.state = this.states.Idle;
  }

  get currentState() {
    return this.state;
  }

  sprint() {
    this.state = this.states.Sprint;
  }

  walk() {
    this.state = this.states.Walk;
  }

  idle() {
    this.state = this.states.Idle;
  }

  isIdle() {
    return this.state === this.states.Idle;
  }

  isSprinting() {
    return this.state === this.states.Sprint;
  }

  isWalking() {
    return this.state === this.states.Walk;
  }
}
