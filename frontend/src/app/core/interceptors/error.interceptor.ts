import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMsg = 'Ocorreu um erro inesperado. Tente novamente mais tarde.';

      if (error.error instanceof ErrorEvent) {
        errorMsg = `Erro: ${error.error.message}`;
      } else {
        if (error.status === 503) {
          errorMsg = 'Serviço temporariamente indisponível (Circuit Breaker aberto).';
        } else if (error.status === 422) {
          errorMsg = 'Erro de validação: Verifique os dados enviados ou saldo insuficiente.';
        } else if (error.status === 409) {
          errorMsg = 'Conflito: Este registro foi modificado por outro usuário.';
        } else if (error.error && typeof error.error === 'string') {
          errorMsg = error.error;
        }
      }

      notificationService.showError(errorMsg);
      return throwError(() => error);
    })
  );
};
