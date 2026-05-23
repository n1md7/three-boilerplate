import { ElementAbstract } from '@/src/game/ui/components/Element.abstract';

/**
 * Loader overlay — drives a real progress bar plus a status line.
 *
 * Public API (kept stable so main.ts wiring stays untouched):
 *   show()          — inherited from ElementAbstract
 *   hide()          — inherited
 *   update(percent) — animate the bar fill + show "Loading… NN%"
 *   displayText(s)  — replace the status line text (e.g. "Initializing…")
 */
export default class Progress extends ElementAbstract<HTMLDivElement> {
  private readonly status: HTMLElement;
  private readonly fill: HTMLElement;

  constructor() {
    super(document.querySelector('#loader'));

    const status = this.element.querySelector<HTMLElement>('.card-status');
    const fill = this.element.querySelector<HTMLElement>('.progress-bar-fill');
    if (!status || !fill) throw new Error('Progress: required child elements not found');

    this.status = status;
    this.fill = fill;
  }

  update(progress: number) {
    const clamped = Math.min(100, Math.max(0, progress));
    this.fill.style.width = `${clamped}%`;
    this.status.textContent = `Loading… ${clamped.toFixed(0)}%`;
  }

  displayText(text: string) {
    this.status.textContent = text;
  }
}

export const progress = new Progress();
