import { Character } from '@/src/first-person/Character';
import { Camera } from '@/src/setup';
import { Command, CommandKind } from '@/src/first-person/character/commands/Command';

/**
 * Jump is a one-shot action — start() triggers the impulse on the character,
 * which itself checks the grounded condition. No per-frame work.
 */
export class Jump extends Command {
  readonly kind: CommandKind = 'jump';

  constructor(character: Character, camera: Camera) {
    super(character, camera);
  }

  override start(): void {
    this.character.jump();
  }
}
