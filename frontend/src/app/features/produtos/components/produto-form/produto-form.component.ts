import { Component, inject, OnInit, signal, DestroyRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { debounceTime, distinctUntilChanged, filter, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AiService, ClassificacaoResponse } from '../../../../core/services/ai.service';
import { Produto } from '../../services/produto.service';

@Component({
  selector: 'app-produto-form',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatDialogModule, MatButtonModule,
    MatInputModule, MatFormFieldModule, MatSlideToggleModule,
    MatChipsModule, MatIconModule
  ],
  template: `
    <h2 mat-dialog-title class="dark:text-white">{{ data ? 'Editar Produto' : 'Novo Produto' }}</h2>

    <mat-dialog-content class="pt-4">
      <form [formGroup]="form" class="flex flex-col gap-4 mt-2">

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <mat-form-field appearance="outline">
            <mat-label>Código</mat-label>
            <input matInput formControlName="codigo" placeholder="Ex: PRD001">
            @if (form.get('codigo')?.hasError('required')) {
              <mat-error>O código é obrigatório</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Saldo Inicial</mat-label>
            <input matInput type="number" formControlName="saldo">
            @if (form.get('saldo')?.hasError('min')) {
              <mat-error>O saldo não pode ser negativo</mat-error>
            }
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Descrição</mat-label>
          <input matInput formControlName="descricao" placeholder="Ex: Caneta esferográfica azul">
          @if (form.get('descricao')?.hasError('required')) {
            <mat-error>A descrição é obrigatória</mat-error>
          }
        </mat-form-field>

        <div class="h-10 flex items-center transition-all duration-300">
          @if (categoriaSugerida()) {
            <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <mat-icon class="text-accent scale-90">auto_awesome</mat-icon>
              Categoria sugerida:
              <mat-chip class="!bg-purple-100 !text-purple-800 dark:!bg-purple-900 dark:!text-purple-100 font-bold">
                {{ categoriaSugerida()!.categoria }}
                ({{ (categoriaSugerida()!.confianca * 100).toFixed(0) }}%)
              </mat-chip>
              <span class="text-xs opacity-70">via IA</span>
            </div>
          }
        </div>

        <mat-slide-toggle formControlName="ativo" color="primary">
          Produto Ativo no Sistema
        </mat-slide-toggle>

      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="pb-4 pr-4">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid" (click)="salvar()">
        Salvar Produto
      </button>
    </mat-dialog-actions>
  `
})
export class ProdutoFormComponent implements OnInit {
  dialogRef = inject(MatDialogRef<ProdutoFormComponent>);
  data = inject<Produto>(MAT_DIALOG_DATA);
  fb = inject(FormBuilder);
  aiService = inject(AiService);
  destroyRef = inject(DestroyRef);

  form!: FormGroup;
  categoriaSugerida = signal<ClassificacaoResponse | null>(null);

  ngOnInit(): void {
    this.form = this.fb.group({
      id: [this.data?.id || null],
      codigo: [this.data?.codigo || '', Validators.required],
      descricao: [this.data?.descricao || '', Validators.required],
      saldo: [this.data?.saldo || 0, [Validators.required, Validators.min(0)]],
      ativo: [this.data ? this.data.ativo : true]
    });

    this.configurarIntegracaoIA();
  }

  configurarIntegracaoIA(): void {
    this.form.get('descricao')!.valueChanges.pipe(
      debounceTime(600),
      distinctUntilChanged(),
      filter(v => v && v.length >= 4),
      switchMap(descricao =>
        this.aiService.classificar(descricao).pipe(
          catchError(() => of(null)) // simula queda da IA
        )
      ),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(resultado => {
      this.categoriaSugerida.set(resultado);
    });
  }

  salvar(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}
