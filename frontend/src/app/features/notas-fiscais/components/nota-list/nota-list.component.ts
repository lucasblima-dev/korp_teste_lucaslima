import { Component, OnInit, OnDestroy, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
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
  imports: [MatTableModule, MatButtonModule, MatIconModule, DatePipe, RouterLink, NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './nota-list.html'
})
export class NotaListComponent implements OnInit, OnDestroy {
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
