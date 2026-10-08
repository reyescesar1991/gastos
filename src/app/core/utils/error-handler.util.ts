// src/app/core/utils/error-handler.util.ts
import { HttpErrorResponse } from '@angular/common/http';
import { ApiErrorResponse } from '../models/api/api-error.model';

export class ErrorUtils {
  /**
   * Extrae un mensaje de error legible a partir de cualquier excepción recibida.
   */
  static getErrorMessage(error: unknown): string {
    // Si es un error HTTP de Angular
    if (error instanceof HttpErrorResponse) {
      const apiError = error.error as ApiErrorResponse;
      
      if (apiError?.message) {
        return apiError.message;
      }

      // Si no hay body, usamos el statusText (ej. "Unauthorized", "Not Found")
      return `Error del servidor (${error.status})`;
    }

    // Si es un Error estándar de JS (ej. new Error('...'))
    if (error instanceof Error) {
      return error.message;
    }

    // Si es un string directo o desconocido
    if (typeof error === 'string') {
      return error;
    }

    return 'Ha ocurrido un error inesperado. Inténtalo de nuevo.';
  }
}