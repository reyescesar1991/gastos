// src/app/core/net/interceptors/api-url.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../config/environments';

export const apiUrlInterceptor: HttpInterceptorFn = (req, next) => {
  // Si la petición es relativa (ej. '/gastos'), le pega la base de la API
  if (!req.url.startsWith('http://') && !req.url.startsWith('https://')) {
    const apiReq = req.clone({ url: `${environment.apiUrl}${req.url}` });
    return next(apiReq);
  }
  return next(req);
};