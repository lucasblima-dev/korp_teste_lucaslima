import { Component, Input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { NgClass } from '@angular/common';

interface GraficoDado {
  dia: string;
  valor: number;
  alturaPercentual: number;
}

@Component({
  selector: 'app-revenue-chart',
  standalone: true,
  imports: [CurrencyPipe, NgClass],
  template: `
    <div class="card h-full flex flex-col">

      <div class="card-header">
        Faturamento (Últimos 7 dias)
      </div>

      <div class="flex items-end justify-between h-48 gap-2 mt-6">

        @for (item of data; track item.dia) {
          <div class="flex flex-col items-center flex-1 group">

            <div class="opacity-0 group-hover:opacity-100 transition bg-black text-white text-xs px-2 py-1 rounded mb-2">
              {{ item.valor | currency:'BRL' }}
            </div>

            <div
              class="w-full max-w-10 rounded-t-md transition-all duration-500"
              [ngClass]="barClass"
              [style.height.%]="item.alturaPercentual">
            </div>

            <span class="text-xs text-gray-400 mt-2">
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
  barClass: string | string[] | Set<string> | { [klass: string]: any; } | null | undefined;
}
