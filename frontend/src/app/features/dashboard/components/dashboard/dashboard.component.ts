import { Component, inject, OnInit, signal, DestroyRef } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';

import { ProdutoService } from '../../../produtos/services/produto.service';
import { NotaService, StatusNota } from '../../../notas-fiscais/services/nota.service';

interface GraficoDado {
  dia: string;
  valor: number;
  alturaPercentual: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatCardModule, MatIconModule, MatButtonModule, RouterLink, CurrencyPipe],
  template: `
    <div class="flex flex-col gap-6 h-full fade-in max-w-7xl mx-auto">

      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold dark:text-white m-0">Dashboard</h1>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">

        <mat-card class="!bg-white dark:!bg-gray-800 !shadow-sm border border-gray-100 dark:border-gray-700">
          <mat-card-content class="flex items-center p-6 gap-4">
            <div class="p-4 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center">
              <mat-icon>inventory_2</mat-icon>
            </div>
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400 font-medium">Produtos Cadastrados</p>
              <h2 class="text-3xl font-bold dark:text-white m-0">{{ totalProdutos() }}</h2>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="!bg-white dark:!bg-gray-800 !shadow-sm border border-gray-100 dark:border-gray-700">
          <mat-card-content class="flex items-center p-6 gap-4">
            <div class="p-4 bg-yellow-100 text-yellow-700 rounded-full flex items-center justify-center">
              <mat-icon>pending_actions</mat-icon>
            </div>
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400 font-medium">Notas em Aberto</p>
              <h2 class="text-3xl font-bold dark:text-white m-0">{{ notasAbertas() }}</h2>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="!bg-white dark:!bg-gray-800 !shadow-sm border border-gray-100 dark:border-gray-700">
          <mat-card-content class="flex items-center p-6 gap-4">
            <div class="p-4 bg-green-100 text-green-700 rounded-full flex items-center justify-center">
              <mat-icon>task_alt</mat-icon>
            </div>
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400 font-medium">Notas Fechadas</p>
              <h2 class="text-3xl font-bold dark:text-white m-0">{{ notasFechadas() }}</h2>
            </div>
          </mat-card-content>
        </mat-card>

      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <mat-card class="lg:col-span-2 !bg-white dark:!bg-gray-800 !shadow-sm border border-gray-100 dark:border-gray-700">
          <mat-card-header class="border-b border-gray-100 dark:border-gray-700 pb-4">
            <mat-card-title class="text-lg">Faturamento (Últimos 7 dias)</mat-card-title>
          </mat-card-header>
          <mat-card-content class="pt-6 h-64">
            <div class="flex items-end justify-between h-48 gap-2 mt-4">
              @for (item of dadosGrafico(); track item.dia) {
                <div class="flex flex-col items-center flex-1 group">
                  <div class="opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs py-1 px-2 rounded mb-2 whitespace-nowrap pointer-events-none">
                    {{ item.valor | currency:'BRL' }}
                  </div>
                  <div class="w-full max-w-[40px] bg-primary/80 hover:bg-primary rounded-t-sm transition-all duration-500 ease-out"
                       [style.height.%]="item.alturaPercentual">
                  </div>
                  <span class="text-xs text-gray-500 mt-2">{{ item.dia }}</span>
                </div>
              }
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="!bg-white dark:!bg-gray-800 !shadow-sm border border-gray-100 dark:border-gray-700">
          <mat-card-header class="border-b border-gray-100 dark:border-gray-700 pb-4">
            <mat-card-title class="text-lg">Ações Rápidas</mat-card-title>
          </mat-card-header>
          <mat-card-content class="pt-6 flex flex-col gap-4">
            <a mat-flat-button color="primary" class="w-full py-6" routerLink="/notas/nova">
              <mat-icon>add_receipt</mat-icon> Emitir Nova Nota
            </a>
            <a mat-stroked-button color="primary" class="w-full py-6 dark:text-white dark:border-gray-600" routerLink="/produtos">
              <mat-icon>inventory_2</mat-icon> Gerir Catálogo
            </a>
          </mat-card-content>
        </mat-card>

      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private produtoService = inject(ProdutoService);
  private notaService = inject(NotaService);
  private destroyRef = inject(DestroyRef);

  totalProdutos = signal<number>(0);
  notasAbertas = signal<number>(0);
  notasFechadas = signal<number>(0);
  dadosGrafico = signal<GraficoDado[]>([]);

  ngOnInit() {
    this.carregarMetricas();
    this.gerarGraficoFalso();
  }

  carregarMetricas() {
    forkJoin({
      produtos: this.produtoService.listar(),
      notas: this.notaService.listar()
    }).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(({ produtos, notas }) => {
      this.totalProdutos.set(produtos.length);

      this.notasAbertas.set(notas.filter(n => n.status === StatusNota.Aberta).length);
      this.notasFechadas.set(notas.filter(n => n.status === StatusNota.Fechada).length);
    });
  }

  gerarGraficoFalso() {
    const mockValores = [1200, 2500, 800, 3100, 1500, 4200, 2800];
    const diasSemana = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    const maxValor = Math.max(...mockValores);

    const dadosMapeados = mockValores.map((valor, index) => ({
      dia: diasSemana[index],
      valor: valor,
      alturaPercentual: (valor / maxValor) * 100
    }));

    this.dadosGrafico.set(dadosMapeados);
  }
}
