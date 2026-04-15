import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'produtos',
    loadComponent: () => import('./features/produtos/components/produto-list/produto-list.component').then(m => m.ProdutoListComponent)
  },
  {
    path: 'notas/nova',
    loadComponent: () => import('./features/notas-fiscais/components/nota-form/nota-form.component').then(m => m.NotaFormComponent)
  },
  {
    path: 'notas',
    loadComponent: () => import('./features/notas-fiscais/components/nota-list/nota-list.component').then(m => m.NotaListComponent)
  },
  { path: '**', redirectTo: 'dashboard' }
];
