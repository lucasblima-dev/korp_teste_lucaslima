import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
//import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-quick-actions',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  template: `
    <div class="card flex flex-col gap-4">

      <div class="card-header">
        Ações Rápidas
      </div>

      <a mat-flat-button class="w-full py-5 bg-blue-600 text-white hover:bg-blue-700">
        <mat-icon>add</mat-icon>
        Nova Nota
      </a>

      <a mat-stroked-button class="w-full py-5 border-gray-300 text-gray-700 dark:text-white dark:border-gray-600">
        <mat-icon>inventory_2</mat-icon>
        Produtos
      </a>

    </div>
  `
})
export class QuickActionsComponent { }
