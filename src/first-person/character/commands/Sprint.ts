import { Character } from '@/src/first-person/Character';
import { Camera } from '@/src/setup';
import { Command, CommandKind } from '@/src/first-person/character/commands/Command';

/**
 * Sprint is a modifier — it has no per-frame work. Its presence in the active
 * command map signals to the Character that movement should use the Sprint
 * state. The Character derives its state every frame from active commands.
 */
export class Sprint extends Command {
  readonly kind: CommandKind = 'sprint';

  constructor(character: Character, camera: Camera) {
    super(character, camera);
  }
}
