import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { LoadingService } from './core/services/loading.service';
import { HeaderComponent } from './shared/components/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatProgressBarModule, HeaderComponent],
  template: `
    @if (loadingService.isLoading()) {
      <mat-progress-bar mode="indeterminate" class="fixed top-0 left-0 w-full z-50"></mat-progress-bar>
    }

    <app-header></app-header>

    <main class="p-4 sm:p-6 md:p-8 min-h-[calc(100vh-64px)] transition-colors duration-300">
      <router-outlet></router-outlet>
    </main>
  `
})
export class AppComponent {
  loadingService = inject(LoadingService);
}
