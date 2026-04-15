import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-metric-card',
  standalone: true,
  imports: [MatIconModule, NgClass],
  template: `
  <div class="metric-card">

    <div class="metric-icon" [ngClass]="color">
      <mat-icon>{{ icon }}</mat-icon>
    </div>

    <div class="metric-content">
      <p class="metric-label">{{ label }}</p>
      <h2 class="metric-value">{{ value }}</h2>
    </div>

  </div>
  `
})
export class MetricCardComponent {
  @Input() icon!: string;
  @Input() label!: string;
  @Input() value!: number;
  @Input() color: 'blue' | 'yellow' | 'green' | 'purple' | 'red' = 'blue';
}
