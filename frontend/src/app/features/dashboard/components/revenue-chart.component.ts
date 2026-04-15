import { Component, Input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

export interface GraficoDado {
  dia: string;
  valor: number;
  alturaPercentual: number;
}

@Component({
  selector: 'app-revenue-chart',
  standalone: true,
  imports: [CurrencyPipe],
  template: `
    <div class="card-header">
      <h2 class="card-title">Faturamento (Últimos 7 dias)</h2>
    </div>

    <div class="card-body">
      <div class="flex items-end justify-between h-48 gap-2">

        @for (item of data; track item.dia) {
          <div class="flex flex-col items-center flex-1 group h-full justify-end">

            <div class="opacity-0 group-hover:opacity-100 transition bg-gray-800 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded mb-2 whitespace-nowrap pointer-events-none">
              {{ item.valor | currency:'BRL' }}
            </div>

            <div
              class="w-full max-w-10 chart-bar-fill"
              [style.height.%]="item.alturaPercentual">
            </div>

            <span class="text-xs text-secondary mt-2">
              {{ item.dia }}
            </span>

          </div>
        }

      </div>
    </div>
  `
})
export class RevenueChartComponent {
  @Input() data: GraficoDado[] = [];
}
