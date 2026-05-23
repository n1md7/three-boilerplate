import { ElementAbstract } from '@/src/game/ui/components/Element.abstract';

/** Discrete spread levels — four buckets keeps the visual punchy without requiring per-pixel transitions. */
const ACCURACY_BUCKETS = [25, 50, 75, 100] as const;
type AccuracyBucket = (typeof ACCURACY_BUCKETS)[number];

/**
 * On-screen crosshair. Four short lines around a centre pip, spread outward
 * by an amount tied to the current accuracy bucket. The Character updates the
 * accuracy each frame (lower while moving/shooting/jumping), and the spread
 * smoothly transitions via CSS.
 *
 * Design notes:
 *   • Markup is built with DOM APIs (no innerHTML, no implicit parsing).
 *   • Class transitions use `classList.replace`, so the crosshair plays nice
 *     with any other classes a caller might add later.
 *   • setAccuracy() bails when the bucket hasn't actually changed — no DOM
 *     writes during a frame where nothing visually changed.
 */
export default class Crosshair extends ElementAbstract<HTMLDivElement> {
  private bucket: AccuracyBucket = 100;

  constructor() {
    const root = document.createElement('div');
    root.className = `crosshair accuracy-${100}`;
    root.hidden = true;

    // Four reticle lines + a center pip.
    const part = (cls: string) => {
      const el = document.createElement('div');
      el.className = cls;
      root.appendChild(el);
    };
    part('crosshair__line crosshair__line--h crosshair__line--left');
    part('crosshair__line crosshair__line--h crosshair__line--right');
    part('crosshair__line crosshair__line--v crosshair__line--top');
    part('crosshair__line crosshair__line--v crosshair__line--bottom');
    part('crosshair__dot');

    super(root);
    document.body.appendChild(root);
  }

  /** Snap the supplied 0–100 accuracy to the nearest bucket and apply the class. */
  setAccuracy(raw: number): void {
    const bucket = this.toBucket(raw);
    if (bucket === this.bucket) return; // no DOM write when unchanged
    this.element.classList.replace(`accuracy-${this.bucket}`, `accuracy-${bucket}`);
    this.bucket = bucket;
  }

  /** Returns the currently-active bucket (one of 25 / 50 / 75 / 100). */
  getAccuracy(): AccuracyBucket {
    return this.bucket;
  }

  /** Map an arbitrary numeric accuracy into the nearest upward bucket. Clamped to [0, 100]. */
  private toBucket(accuracy: number): AccuracyBucket {
    const clamped = Math.max(0, Math.min(100, accuracy));
    for (const b of ACCURACY_BUCKETS) {
      if (clamped <= b) return b;
    }
    return 100;
  }
}

export const crosshair = new Crosshair();
