import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private snackBar = inject(MatSnackBar);

  showSuccess(message: string): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 3000,
      panelClass: ['bg-green-600', 'text-white'],
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  showError(message: string): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 5000,
      panelClass: ['bg-red-600', 'text-white'],
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }
}
