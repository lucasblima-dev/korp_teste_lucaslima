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
  templateUrl: 'nota-form.html'
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
