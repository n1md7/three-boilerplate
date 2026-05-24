import { AnimationAction, LoopOnce } from 'three';

/**
 * Wraps an AnimationAction so it always plays for a caller-specified wall-clock
 * duration regardless of the underlying clip's natural length.
 *
 * Use case (FPS / RPG): a single fire/reload/cast/spell animation needs to
 * retime to match different fire rates, reload speeds, cast haste values, etc.
 *
 * Contract:
 *   • playFor(ms)  — animation completes in exactly ms milliseconds.
 *   • stop()       — halts the animation.
 *   • isFinished() — true once the underlying action reports a finished loop.
 *
 * Why this exists instead of just calling `action.setDuration()` once:
 *   • setDuration only mutates timeScale; timeScale survives reset() and stop(),
 *     but it's fragile to rely on a one-time configuration. Each playFor()
 *     recomputes timeScale from the *current* clip duration so the contract
 *     holds even if the clip is later swapped or the action is rebuilt.
 *   • Centralises clampWhenFinished + LoopOnce so the action behaves
 *     consistently (holds final pose, plays once per trigger).
 */
export class TimedAnimation {
  /** Cached clip length in seconds — fixed for the lifetime of the clip. */
  private readonly clipDuration: number;

  constructor(private readonly action: AnimationAction) {
    this.action.setLoop(LoopOnce, 1);
    this.action.clampWhenFinished = true;
    this.clipDuration = this.action.getClip().duration;
  }

  /**
   * Play the animation from the beginning and have it finish in exactly
   * `durationMs` milliseconds. Safe to call mid-play — restarts cleanly.
   */
  playFor(durationMs: number): void {
    const seconds = Math.max(0.001, durationMs / 1000);
    // timeScale > 1 = faster than natural, < 1 = slower. Recomputed every
    // call so the timing contract is honoured even if timeScale was changed
    // elsewhere or the clip swapped.
    this.action.timeScale = this.clipDuration / seconds;
    this.action.reset();
    this.action.enabled = true;
    this.action.paused = false;
    this.action.play();
  }

  /** Halt the animation. Safe to call when not playing. */
  stop(): void {
    this.action.stop();
  }

  /** True once the action has reported a finished loop (LoopOnce ⇒ ended). */
  isFinished(): boolean {
    return !this.action.isRunning() && this.action.time >= this.clipDuration;
  }
}
