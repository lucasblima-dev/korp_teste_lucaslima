import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NotaService, NotaFiscal, StatusNota } from '../../services/nota.service';

@Component({
  selector: 'app-nota-list',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, MatIconModule, DatePipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-6 h-full fade-in">

      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 class="text-2xl font-bold dark:text-white">Notas Fiscais</h1>
        <a mat-flat-button color="primary" routerLink="/notas/nova">
          <mat-icon>add_receipt</mat-icon> Emitir Nota
        </a>
      </div>

      <div class="overflow-x-auto rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <table mat-table [dataSource]="notas()" class="w-full">

          <ng-container matColumnDef="numero">
            <th mat-header-cell *matHeaderCellDef class="font-semibold"> Número </th>
            <td mat-cell *matCellDef="let n" class="font-mono font-bold"> #{{n.numero}} </td>
          </ng-container>

          <ng-container matColumnDef="data">
            <th mat-header-cell *matHeaderCellDef class="font-semibold"> Criação </th>
            <td mat-cell *matCellDef="let n"> {{n.criadaEm | date:'dd/MM/yyyy HH:mm'}} </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef class="font-semibold"> Status </th>
            <td mat-cell *matCellDef="let n">
              <span class="px-3 py-1 rounded-full text-xs font-bold"
                    [class.bg-blue-100]="n.status === statusEnum.Aberta"
                    [class.text-blue-700]="n.status === statusEnum.Aberta"
                    [class.bg-gray-200]="n.status === statusEnum.Fechada"
                    [class.text-gray-600]="n.status === statusEnum.Fechada"
                    [class.dark:bg-gray-700]="n.status === statusEnum.Fechada"
                    [class.dark:text-gray-300]="n.status === statusEnum.Fechada">
                {{n.status === statusEnum.Aberta ? 'Aberta' : 'Fechada'}}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="acoes">
            <th mat-header-cell *matHeaderCellDef class="text-right"> Ações </th>
            <td mat-cell *matCellDef="let n" class="text-right">
              <button mat-icon-button color="primary" aria-label="Ver detalhes">
                <mat-icon>visibility</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="colunasExibidas"></tr>
          <tr mat-row *matRowDef="let row; columns: colunasExibidas;" class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"></tr>

          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell text-center py-8 text-gray-500" colspan="4">Nenhuma nota fiscal encontrada.</td>
          </tr>
        </table>
      </div>
    </div>
  `
})
export class NotaListComponent implements OnInit {
  private notaService = inject(NotaService);
  private destroy$ = new Subject<void>();

  notas = signal<NotaFiscal[]>([]);
  colunasExibidas: string[] = ['numero', 'data', 'status', 'acoes'];
  statusEnum = StatusNota;

  ngOnInit(): void {
    this.notaService.listar().pipe(takeUntil(this.destroy$)).subscribe(res => this.notas.set(res));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
