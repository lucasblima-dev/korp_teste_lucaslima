import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';

export interface Produto {
  id: string;
  codigo: string;
  descricao: string;
  saldo: number;
  ativo: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProdutoService {
  // Mock temporário para simular info
  private mockProdutos: Produto[] = [
    { id: '1', codigo: 'PRD001', descricao: 'RTX 5090 16Gb', saldo: 150, ativo: true },
    { id: '2', codigo: 'PRD002', descricao: 'Samsung Galaxy S26 Pro +', saldo: 8, ativo: true },
    { id: '3', codigo: 'PRD003', descricao: 'Monitor Samsung ODYSSEY OLED G8 32"', saldo: 0, ativo: true },
    { id: '4', codigo: 'PRD004', descricao: 'Teclado Mecânico Red Dragon', saldo: 45, ativo: false },
    { id: '5', codigo: 'PRD005', descricao: 'Mouse sem fio fuleiro', saldo: 12, ativo: true },
  ];

  listar(busca: string = ''): Observable<Produto[]> {
    const filtrados = this.mockProdutos.filter(p =>
      p.descricao.toLowerCase().includes(busca.toLowerCase()) ||
      p.codigo.toLowerCase().includes(busca.toLowerCase())
    );
    // delay proposital
    return of(filtrados).pipe(delay(500));
  }
}
