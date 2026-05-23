import { Character } from '@/src/first-person/Character';
import { Camera } from '@/src/setup';
import { Command, CommandKind } from '@/src/first-person/character/commands/Command';

export type MoveDirection = 'forward' | 'backward' | 'left' | 'right';

/**
 * Side multipliers preserve the original feel: backward/strafe are slower than forward.
 */
const SIDE_MULTIPLIER: Record<MoveDirection, number> = {
  forward: 1.0,
  backward: 0.9,
  left: 0.8,
  right: 0.8,
};

/**
 * One Move command for all four cardinal directions — collapses what used to be
 * four near-identical Go* classes into a single parameterised one.
 */
export class Move extends Command {
  readonly kind: CommandKind = 'move';

  constructor(
    character: Character,
    camera: Camera,
    private readonly direction: MoveDirection,
  ) {
    super(character, camera);
  }

  override execute(_delta: number): void {
    const useZAxis = this.direction === 'forward' || this.direction === 'backward';
    const sign = this.direction === 'forward' || this.direction === 'right' ? 1 : -1;
    const vector = useZAxis ? this.getZAxisVector() : this.getXAxisVector();

    // Push a raw input contribution. Character clamps the combined length to ≤1
    // and applies speed × delta itself, so diagonals don't outpace straight moves.
    this.character.move(vector.multiplyScalar(sign * SIDE_MULTIPLIER[this.direction]));
  }
}
