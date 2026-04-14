import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, switchMap, filter, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatTableModule } from '@angular/material/table';

import { ProdutoService, Produto } from '../../../produtos/services/produto.service';
import { NotaService, ItemNota } from '../../services/nota.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-nota-form',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatButtonModule, MatIconModule, MatInputModule,
    MatFormFieldModule, MatAutocompleteModule, MatTableModule
  ],
  template: `
    <div class="flex flex-col gap-6 h-full fade-in max-w-5xl mx-auto">

      <div class="flex items-center gap-4">
        <button mat-icon-button (click)="voltar()" aria-label="Voltar">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1 class="text-2xl font-bold dark:text-white m-0">Emitir Nova Nota Fiscal</h1>
      </div>

      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <mat-form-field appearance="outline" class="w-full sm:flex-1 m-0">
          <mat-label>Pesquisar Produto (Código ou Descrição)</mat-label>
          <mat-icon matPrefix>search</mat-icon>
          <input type="text" matInput [formControl]="searchControl" [matAutocomplete]="auto">

          <mat-autocomplete #auto="matAutocomplete" (optionSelected)="adicionarProduto($event)" [displayWith]="displayFn">
            @for (prod of produtosSugeridos(); track prod.id) {
              <mat-option [value]="prod" [disabled]="prod.saldo === 0">
                <div class="flex justify-between items-center w-full">
                  <span><span class="font-mono text-gray-500">{{prod.codigo}}</span> - {{prod.descricao}}</span>
                  <span class="text-xs font-bold" [class.text-red-500]="prod.saldo === 0" [class.text-green-600]="prod.saldo > 0">
                    {{prod.saldo}} disp.
                  </span>
                </div>
              </mat-option>
            }
          </mat-autocomplete>
        </mat-form-field>
      </div>

      <div class="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <table mat-table [dataSource]="itensNota()" class="w-full">

          <ng-container matColumnDef="codigo">
            <th mat-header-cell *matHeaderCellDef> Código </th>
            <td mat-cell *matCellDef="let item" class="font-mono text-sm"> {{item.codigoProduto}} </td>
          </ng-container>

          <ng-container matColumnDef="descricao">
            <th mat-header-cell *matHeaderCellDef> Descrição </th>
            <td mat-cell *matCellDef="let item"> {{item.descricaoProduto}} </td>
          </ng-container>

          <ng-container matColumnDef="quantidade">
            <th mat-header-cell *matHeaderCellDef> Quantidade </th>
            <td mat-cell *matCellDef="let item; let i = index">
              <div class="flex items-center gap-2 pt-3">
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-24">
                  <input matInput type="number" min="1" [max]="item.saldoDisponivel"
                         [value]="item.quantidade" (change)="atualizarQuantidade(i, $event)">
                </mat-form-field>
                <span class="text-xs text-gray-500">/ {{item.saldoDisponivel}}</span>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="acoes">
            <th mat-header-cell *matHeaderCellDef class="text-right"> Remover </th>
            <td mat-cell *matCellDef="let i = index" class="text-right">
              <button mat-icon-button color="warn" (click)="removerItem(i)">
                <mat-icon>delete_outline</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="colunasTabela"></tr>
          <tr mat-row *matRowDef="let row; columns: colunasTabela;" class="hover:bg-gray-50 dark:hover:bg-gray-700"></tr>

          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell text-center py-8 text-gray-500" colspan="4">Nenhum produto adicionado à nota.</td>
          </tr>
        </table>
      </div>

      <div class="flex justify-end gap-4 mt-4">
        <button mat-button (click)="voltar()">Cancelar</button>
        <button mat-flat-button color="primary" [disabled]="itensNota().length === 0" (click)="salvarEImprimir()">
          <mat-icon>print</mat-icon> Imprimir / Fechar Nota
        </button>
      </div>

    </div>
  `
})
export class NotaFormComponent implements OnInit {
  private router = inject(Router);
  private produtoService = inject(ProdutoService);
  private notaService = inject(NotaService);
  private notification = inject(NotificationService);
  private destroyRef = inject(DestroyRef);

  searchControl = new FormControl<string | Produto>('');
  produtosSugeridos = signal<Produto[]>([]);

  itensNota = signal<ItemNota[]>([]);
  colunasTabela = ['codigo', 'descricao', 'quantidade', 'acoes'];

  ngOnInit() {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      filter(val => typeof val === 'string' && val.length > 1),
      switchMap(termo => this.produtoService.listar(termo as string).pipe(
        catchError(() => of([]))
      )),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(produtos => {
      this.produtosSugeridos.set(produtos);
    });
  }

  displayFn(produto?: Produto): string {
    return '';
  }

  adicionarProduto(evento: MatAutocompleteSelectedEvent) {
    const produto: Produto = evento.option.value;

    const itensAtuais = this.itensNota();
    if (itensAtuais.some(i => i.produtoId === produto.id)) {
      this.notification.showError('Produto já adicionado à nota.');
      this.searchControl.setValue('');
      return;
    }

    const novoItem: ItemNota = {
      produtoId: produto.id,
      codigoProduto: produto.codigo,
      descricaoProduto: produto.descricao,
      quantidade: 1, // Default 1
      saldoDisponivel: produto.saldo
    };

    this.itensNota.update(itens => [...itens, novoItem]);
    this.searchControl.setValue('');
  }

  atualizarQuantidade(index: number, event: Event) {
    const input = event.target as HTMLInputElement;
    const novaQtd = parseInt(input.value, 10);

    this.itensNota.update(itens => {
      const item = itens[index];
      if (novaQtd > item.saldoDisponivel) {
        this.notification.showError(`A quantidade excede o saldo disponível (${item.saldoDisponivel}).`);
        input.value = item.saldoDisponivel.toString();
        item.quantidade = item.saldoDisponivel;
      } else if (novaQtd < 1 || isNaN(novaQtd)) {
        input.value = '1';
        item.quantidade = 1;
      } else {
        item.quantidade = novaQtd;
      }
      return [...itens];
    });
  }

  removerItem(index: number) {
    this.itensNota.update(itens => itens.filter((_, i) => i !== index));
  }

  salvarEImprimir() {
    this.notaService.criar({ itens: this.itensNota() }).pipe(
      switchMap(novaNota => this.notaService.imprimirEFechar(novaNota.id)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (pdfBlob) => {
        const url = window.URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Nota_Fiscal_KORP.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);

        this.notification.showSuccess('Nota fechada e PDF gerado com sucesso!');
        this.voltar();
      }
    });
  }

  voltar() {
    this.router.navigate(['/notas']);
  }
}
