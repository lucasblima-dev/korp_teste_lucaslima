import { Component, inject, OnInit, signal, DestroyRef } from '@angular/core';
import { forkJoin } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ProdutoService } from '../../features/produtos/services/produto.service';
import { NotaService, StatusNota } from '../../features/notas-fiscais/services/nota.service';

import { MetricCardComponent } from './components/metric-card.component';
import { RevenueChartComponent } from './components/revenue-chart.component';
import { QuickActionsComponent } from './components/quick-options.component';
import { MatIconModule } from "@angular/material/icon";

export interface GraficoDado {
  dia: string;
  valor: number;
  alturaPercentual: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  // ✅ MetricCardComponent removido da lista duplicada
  imports: [MetricCardComponent, RevenueChartComponent, QuickActionsComponent, MatIconModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit {
  private readonly produtoService = inject(ProdutoService);
  private readonly notaService = inject(NotaService);
  private readonly destroyRef = inject(DestroyRef);

  totalProdutos = signal(0);
  notasAbertas = signal(0);
  notasFechadas = signal(0);
  dadosGrafico = signal<GraficoDado[]>([]);
  carregando = signal(true);

  ngOnInit(): void {
    this.gerarDadosGrafico();
    this.carregarMetricas();
  }

  private carregarMetricas(): void {
    forkJoin({
      produtos: this.produtoService.listar(),
      notas: this.notaService.listar()
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ produtos, notas }) => {
          this.totalProdutos.set(produtos.length);
          this.notasAbertas.set(notas.filter(n => n.status === StatusNota.Aberta).length);
          this.notasFechadas.set(notas.filter(n => n.status === StatusNota.Fechada).length);
        },
        error: (err) => console.error('Erro ao carregar métricas:', err),
        complete: () => this.carregando.set(false)
      });
  }

  private gerarDadosGrafico(): void {
    const valores = [1200, 2500, 800, 3100, 1500, 4200, 2800];
    const dias = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    const max = Math.max(...valores);

    this.dadosGrafico.set(
      valores.map((valor, i) => ({
        dia: dias[i],
        valor,
        alturaPercentual: Math.round((valor / max) * 100)
      }))
    );
  }
}
