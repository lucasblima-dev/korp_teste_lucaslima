import { Injectable } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';

export enum StatusNota {
  Aberta = 1,
  Fechada = 2
}

export interface ItemNota {
  id?: string;
  produtoId: string;
  codigoProduto: string;
  descricaoProduto: string;
  quantidade: number;
  saldoDisponivel: number; // validação no frontend
}

export interface NotaFiscal {
  id: string;
  numero: number;
  status: StatusNota;
  criadaEm: Date;
  fechadaEm?: Date;
  itens: ItemNota[];
}

@Injectable({
  providedIn: 'root'
})
export class NotaService {
  private mockNotas: NotaFiscal[] = [
    { id: '1', numero: 1001, status: StatusNota.Fechada, criadaEm: new Date('2026-04-10T10:00:00'), fechadaEm: new Date('2026-04-10T10:05:00'), itens: [] },
    { id: '2', numero: 1002, status: StatusNota.Aberta, criadaEm: new Date('2026-04-14T09:30:00'), itens: [] }
  ];

  listar(): Observable<NotaFiscal[]> {
    return of([...this.mockNotas]).pipe(delay(600));
  }

  criar(nota: Partial<NotaFiscal>): Observable<NotaFiscal> {
    const novaNota: NotaFiscal = {
      id: crypto.randomUUID(),
      numero: this.mockNotas.length + 1001,
      status: StatusNota.Aberta,
      criadaEm: new Date(),
      itens: nota.itens || []
    };
    this.mockNotas.unshift(novaNota);
    return of(novaNota).pipe(delay(500));
  }

  imprimirEFechar(id: string): Observable<Blob> {
    const nota = this.mockNotas.find(n => n.id === id);
    if (!nota) return throwError(() => new Error('Nota não encontrada'));

    if (nota.itens.length === 0) {
      return throwError(() => ({ status: 422, error: 'A nota precisa de ter pelo menos um item para ser fechada.' }));
    }

    nota.status = StatusNota.Fechada;
    nota.fechadaEm = new Date();

    const mockPdfBlob = new Blob(['Simulação de PDF Korp ERP'], { type: 'application/pdf' });
    return of(mockPdfBlob).pipe(delay(1500));
  }
}
