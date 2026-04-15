import { Component, signal, effect, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatIconModule, MatButtonModule],
  template: `
    <header class="header">

      <!-- Left: Logo + Nav -->
      <div class="flex items-center gap-4">
        <a class="logo" routerLink="/">
          KORP
          <span class="logo-sub">ERP</span>
          <span class="logo-dot"></span>
        </a>

        <nav class="nav-desktop">
          <a routerLink="/dashboard"  routerLinkActive="active-link">Dashboard</a>
          <a routerLink="/produtos"   routerLinkActive="active-link">Produtos</a>
          <a routerLink="/notas"      routerLinkActive="active-link">Notas</a>
        </nav>
      </div>

      <!-- Right: Actions -->
      <div class="flex items-center gap-2">

        <!-- Theme toggle -->
        <button
          mat-icon-button
          (click)="toggleTheme()"
          [attr.aria-label]="isDarkMode() ? 'Ativar modo claro' : 'Ativar modo escuro'"
          class="header-icon-btn"
        >
          <mat-icon>{{ isDarkMode() ? 'light_mode' : 'dark_mode' }}</mat-icon>
        </button>

        <!-- Mobile hamburger (hidden on md+) -->
        <button
          mat-icon-button
          class="header-icon-btn md:hidden"
          (click)="toggleMenu()"
          aria-label="Abrir menu"
        >
          <mat-icon>{{ menuOpen() ? 'close' : 'menu' }}</mat-icon>
        </button>

      </div>
    </header>

    <!-- Mobile slide-down menu -->
    @if (menuOpen()) {
      <nav class="mobile-menu md:hidden" role="navigation" aria-label="Menu mobile">
        <a routerLink="/dashboard" routerLinkActive="active-link" (click)="closeMenu()">
          <mat-icon>dashboard</mat-icon> Dashboard
        </a>
        <a routerLink="/produtos" routerLinkActive="active-link" (click)="closeMenu()">
          <mat-icon>inventory_2</mat-icon> Produtos
        </a>
        <a routerLink="/notas" routerLinkActive="active-link" (click)="closeMenu()">
          <mat-icon>receipt_long</mat-icon> Notas
        </a>
      </nav>
    }
  `,
  styles: [`
    .header-icon-btn {
      color: var(--text-secondary);
      transition: color 0.2s ease;
    }
    .header-icon-btn:hover { color: var(--text-primary); }

    /* Ensure mat-icon inside nav mobile respects gap */
    .mobile-menu mat-icon {
      font-size: 1.1rem;
      width: 1.1rem;
      height: 1.1rem;
    }
  `]
})
export class HeaderComponent {
  isDarkMode = signal(false);
  menuOpen = signal(false);

  constructor() {
    // Persist theme preference
    const saved = localStorage.getItem('korp-theme');
    if (saved === 'dark') this.isDarkMode.set(true);

    effect(() => {
      document.documentElement.classList.toggle('dark', this.isDarkMode());
      localStorage.setItem('korp-theme', this.isDarkMode() ? 'dark' : 'light');
    });
  }

  // Close menu on route change or outside click (escape key)
  @HostListener('document:keydown.escape')
  onEscape() { this.closeMenu(); }

  toggleTheme() { this.isDarkMode.update(v => !v); }
  toggleMenu() { this.menuOpen.update(v => !v); }
  closeMenu() { this.menuOpen.set(false); }
}
