import { Character } from '@/src/first-person/Character';
import { Camera } from '@/src/setup';
import { Vector3 } from 'three';

export type CommandKind = 'move' | 'sprint' | 'jump';

/**
 * Command pattern base for character actions bound to held keys.
 *
 * Lifecycle (driven by CharacterCommands):
 *   start()   — called once when the key is first pressed
 *   execute() — called every frame while the key is held
 *   stop()    — called once when the key is released
 *
 * Defaults are no-ops; subclasses override only what they need.
 */
export abstract class Command {
  /** Discriminator the character uses to derive its movement state. */
  abstract readonly kind: CommandKind;

  protected constructor(
    protected readonly character: Character,
    protected readonly camera: Camera,
  ) {}

  start(): void {}
  execute(_delta: number): void {}
  stop(): void {}

  /** Forward-facing horizontal unit vector of the camera. */
  protected getZAxisVector(): Vector3 {
    const vector = this.camera.getWorldDirection(new Vector3());
    vector.y = 0;
    vector.normalize();
    return vector;
  }

  /** Right-facing horizontal unit vector of the camera. */
  protected getXAxisVector(): Vector3 {
    const vector = this.camera.getWorldDirection(new Vector3());
    vector.cross(new Vector3(0, 1, 0));
    vector.normalize();
    return vector;
  }
}
