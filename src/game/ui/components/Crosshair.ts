import { ElementAbstract } from '@/src/game/ui/components/Element.abstract';

export default class Crosshair extends ElementAbstract<HTMLDivElement> {
  private accuracy = 100;

  constructor() {
    const crosshair = document.createElement('div');
    crosshair.setAttribute('class', 'crosshair');
    crosshair.setAttribute('hidden', '');
    crosshair.innerHTML = `
      <div class='line-horizontal left'></div>
      <div class='line-horizontal right'></div>
      <div class='line-vertical top'></div>
      <div class='line-vertical bottom'></div>
    `;

    super(crosshair);

    document.body.appendChild(crosshair);
  }
  setAccuracy(accuracy: number): void {
    this.accuracy = this.calculateAccuracy(accuracy);
    this.element.setAttribute('class', 'crosshair ' + `accuracy-${this.accuracy}`);
  }

  getAccuracy() {
    return this.accuracy;
  }

  private calculateAccuracy(accuracy: number) {
    // Values are 25, 50, 75 and 100
    // Clamp it to the closest value upwards
    if (accuracy <= 25) return 25;
    if (accuracy <= 50) return 50;
    if (accuracy <= 75) return 75;

    return 100;
  }
}

export const crosshair = new Crosshair();
