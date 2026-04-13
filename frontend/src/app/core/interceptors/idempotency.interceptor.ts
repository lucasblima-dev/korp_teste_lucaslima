import { HttpInterceptorFn } from '@angular/common/http';

export const idempotencyInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method === 'POST' && req.url.includes('/imprimir')) {
    const idempotencyKey = crypto.randomUUID(); // Gera um UUID padrão da web

    const clonedReq = req.clone({
      headers: req.headers.set('Idempotency-Key', idempotencyKey)
    });

    return next(clonedReq);
  }

  return next(req);
};
