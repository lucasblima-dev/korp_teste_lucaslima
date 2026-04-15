import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { NgClass } from '@angular/common';

//[ngClass]="colorClass"

@Component({
  selector: 'app-metric-card',
  standalone: true,
  imports: [MatIconModule, NgClass],
  template: `
  <div class="card flex items-center gap-4">

    <div
      class="icon"
      [ngClass]="colorClass"
    >
      <mat-icon>{{ icon }}</mat-icon>
    </div>

    <div>
      <p class="subtitle">{{ label }}</p>
      <h2 class="text-3xl font-bold">{{ value }}</h2>
    </div>

  </div>
`
})
export class MetricCardComponent {
  @Input() icon!: string;
  @Input() label!: string;
  @Input() value!: number;
  @Input() color: 'blue' | 'yellow' | 'green' = 'blue';

  get colorClass() {
    return {
      blue: 'bg-blue-100 text-blue-600 dark:bg-cyan-500/10 dark:text-cyan-400',
      yellow: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-400',
      green: 'bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400'
    }[this.color];
  }
}
