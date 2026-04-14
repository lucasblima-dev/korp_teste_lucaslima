import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';

export interface ClassificacaoResponse {
  categoria: string;
  confianca: number;
}

@Injectable({
  providedIn: 'root'
})
export class AiService {

  // Simula a cchamada a API do Hugging Face
  classificar(descricao: string): Observable<ClassificacaoResponse | null> {
    const desc = descricao.toLowerCase();

    let categoria = 'Outros';
    let confianca = 0.65;

    if (desc.includes('caneta') || desc.includes('caderno') || desc.includes('papel')) {
      categoria = 'Papelaria';
      confianca = 0.94;
    } else if (desc.includes('monitor') || desc.includes('teclado') || desc.includes('mouse') || desc.includes('rtx')) {
      categoria = 'Informática';
      confianca = 0.89;
    } else if (desc.includes('sabão') || desc.includes('limpeza')) {
      categoria = 'Limpeza e Higiene';
      confianca = 0.98;
    }

    // 800ms de delay
    return of({ categoria, confianca }).pipe(delay(800));
  }
}
