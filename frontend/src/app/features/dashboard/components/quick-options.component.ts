import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-quick-actions',
  standalone: true,
  imports: [MatIconModule, RouterLink],
  template: `
    <div class="card-header">
      <h2 class="card-title">Ações Rápidas</h2>
    </div>

    <div class="card-body flex flex-col gap-2">
      <a routerLink="/notas/nova" class="quick-action-btn">
        <mat-icon class="text-blue-600 dark:text-blue-400">add_circle</mat-icon>
        Emitir Nova Nota
      </a>

      <a routerLink="/produtos" class="quick-action-btn">
        <mat-icon class="text-purple-600 dark:text-purple-400">inventory_2</mat-icon>
        Gerenciar Produtos
      </a>
    </div>
  `
})
export class QuickActionsComponent { }
