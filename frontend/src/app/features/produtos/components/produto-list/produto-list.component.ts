import { Component, OnInit, OnDestroy, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NgClass } from '@angular/common';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';

import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule } from '@angular/material/paginator';

import { ProdutoService, Produto } from '../../services/produto.service';
import { ProdutoFormComponent } from '../produto-form/produto-form.component';

@Component({
  selector: 'app-produto-list',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatTableModule, MatButtonModule,
    MatIconModule, MatInputModule, MatFormFieldModule,
    MatPaginatorModule, NgClass
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './produto-list.html'
})
export class ProdutoListComponent implements OnInit, OnDestroy {
  private produtoService = inject(ProdutoService);
  private destroy$ = new Subject<void>();
  private dialog = inject(MatDialog);

  produtos = signal<Produto[]>([]);
  colunasExibidas: string[] = ['codigo', 'descricao', 'saldo', 'acoes'];
  searchControl = new FormControl('');

  ngOnInit(): void {
    this.carregarProdutos();

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

  abrirFormulario(produto?: Produto) {
    const dialogRef = this.dialog.open(ProdutoFormComponent, {
      width: '600px',
      data: produto
    });

    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado) {
        console.log('Dados a serem salvos/editados:', resultado);
        // Futuramente integra com o backend
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
