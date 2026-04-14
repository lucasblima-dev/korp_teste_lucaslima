import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ProdutoFormComponent } from '../produto-form/produto-form.component';
import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ProdutoService, Produto } from '../../services/produto.service';

@Component({
  selector: 'app-produto-list',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatTableModule, MatButtonModule,
    MatIconModule, MatInputModule, MatFormFieldModule, MatPaginatorModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-6 h-full fade-in">

      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 class="text-2xl font-bold">Catálogo de Produtos</h1>
        <button mat-flat-button color="primary" (click)="abrirFormulario()">
          <mat-icon>add</mat-icon> Novo Produto
        </button>
      </div>

      <mat-form-field appearance="outline" class="w-full sm:w-96 rounded-lg">
        <mat-icon matPrefix>search</mat-icon>
        <input matInput [formControl]="searchControl" placeholder="Buscar por código ou descrição...">
      </mat-form-field>

      <div class="overflow-x-auto rounded-lg shadow">
        <table mat-table [dataSource]="produtos()" class="w-full">

          <ng-container matColumnDef="codigo">
            <th mat-header-cell *matHeaderCellDef class="font-semibold"> Código </th>
            <td mat-cell *matCellDef="let p" class="font-mono text-sm"> {{p.codigo}} </td>
          </ng-container>

          <ng-container matColumnDef="descricao">
            <th mat-header-cell *matHeaderCellDef class="font-semibold"> Descrição </th>
            <td mat-cell *matCellDef="let p" class="font-medium"> {{p.descricao}} </td>
          </ng-container>

          <ng-container matColumnDef="saldo">
            <th mat-header-cell *matHeaderCellDef class="font-semibold"> Saldo </th>
            <td mat-cell *matCellDef="let p">
              <span class="px-2.5 py-1 rounded-full text-xs font-bold"
                    [class.bg-green-100]="p.saldo >= 10" [class.text-green-700]="p.saldo >= 10"
                    [class.bg-yellow-100]="p.saldo > 0 && p.saldo < 10" [class.text-yellow-700]="p.saldo > 0 && p.saldo < 10"
                    [class.bg-red-100]="p.saldo === 0" [class.text-red-700]="p.saldo === 0">
                {{p.saldo}} un.
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="acoes">
            <th mat-header-cell *matHeaderCellDef class="text-right"> Ações </th>
            <td mat-cell *matCellDef="let p" class="text-right">
              <button mat-icon-button color="primary" aria-label="Editar" (click)="abrirFormulario(p)">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" aria-label="Excluir">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="colunasExibidas"></tr>
          <tr mat-row *matRowDef="let row; columns: colunasExibidas;" class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"></tr>

          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell text-center py-8 text-gray-500" colspan="4">Nenhum produto encontrado.</td>
          </tr>
        </table>

        <mat-paginator [pageSizeOptions]="[5, 10, 20]" showFirstLastButtons aria-label="Selecione a página de produtos"></mat-paginator>
      </div>

    </div>
  `
})
export class ProdutoListComponent implements OnInit {
  private produtoService = inject(ProdutoService);
  private destroy$ = new Subject<void>();
  private dialog = inject(MatDialog);

  produtos = signal<Produto[]>([]);
  colunasExibidas: string[] = ['codigo', 'descricao', 'saldo', 'acoes'];

  searchControl = new FormControl('');

  abrirFormulario(produto?: Produto) {
    const dialogRef = this.dialog.open(ProdutoFormComponent, {
      width: '600px',
      data: produto
    });

    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado) {
        console.log('Dados a serem salvos/editados:', resultado);
        // futuramente vai para o backend
      }
    });
  }

  ngOnInit(): void {
    this.carregarProdutos();

    // RxJS com Debounce
    this.searchControl.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(termo => this.produtoService.listar(termo || '')),
      takeUntil(this.destroy$)
    ).subscribe(resultado => {
      this.produtos.set(resultado);
    });
  }

  carregarProdutos() {
    this.produtoService.listar().pipe(takeUntil(this.destroy$)).subscribe(res => this.produtos.set(res));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
