import { Component, inject, OnInit, signal, DestroyRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
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
    MatIconModule
  ],
  templateUrl: './produto-form.html',
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
        this.aiService.classificar(descricao).pipe(catchError(() => of(null)))
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
