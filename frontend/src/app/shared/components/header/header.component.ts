import { Component, signal, effect } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatToolbarModule, MatButtonModule, MatIconModule],
  template: `
    <mat-toolbar color="primary" class="flex justify-between items-center shadow-md relative z-10 px-4 sm:px-8">

      <div class="flex items-center gap-6">
        <span class="text-xl font-bold tracking-wider cursor-pointer" routerLink="/">
          KORP <span class="font-light">ERP</span>
        </span>

        <nav class="hidden md:flex gap-2">
          <a mat-button routerLink="/dashboard" routerLinkActive="bg-white/20">Dashboard</a>
          <a mat-button routerLink="/produtos" routerLinkActive="bg-white/20">Produtos</a>
          <a mat-button routerLink="/notas" routerLinkActive="bg-white/20">Notas Fiscais</a>
        </nav>
      </div>

      <div>
        <button mat-icon-button (click)="toggleTheme()" aria-label="Alternar tema">
          <mat-icon>{{ isDarkMode() ? 'light_mode' : 'dark_mode' }}</mat-icon>
        </button>
      </div>

    </mat-toolbar>
  `
})
export class HeaderComponent {
  isDarkMode = signal<boolean>(false);

  constructor() {
    effect(() => {
      if (this.isDarkMode()) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    });
  }

  toggleTheme(): void {
    this.isDarkMode.update(mode => !mode);
  }
}
