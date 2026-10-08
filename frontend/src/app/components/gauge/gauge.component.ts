import { Component, Input } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-gauge',
  standalone: true,
  imports: [DecimalPipe],
  styleUrl: './gauge.component.scss',
  templateUrl: './gauge.component.html'
})
export class GaugeComponent {
  @Input() label = '';
  @Input() value = 0;
  @Input() unit = '';
  @Input() min = 0;
  @Input() max = 100;
  @Input() status = 'Normal';

  get dashArray(): string {
    const circumference = 2 * Math.PI * 48;
    const ratio = Math.min(1, Math.max(0, (this.value - this.min) / (this.max - this.min)));
    return `${circumference * ratio} ${circumference}`;
  }
}
