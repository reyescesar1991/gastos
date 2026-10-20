import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { of } from 'rxjs/internal/observable/of';
import { throwError } from 'rxjs/internal/observable/throwError';
import { delay } from 'rxjs/internal/operators/delay';
import type { ApiSuccessResponse } from '../../core/models/api/api-success.model';
import { PAYMENT_METHODS_USER_MOCK } from './mocks/payment-methods.response.mock';
import type { PaymentMethodRequest } from './models/add-payment-method-request.model';
import type { PaymentMethodDto } from './models/payment-method.dto';
import type { UpdatePaymentMethodRequest } from './models/update-payment-method-request.model';

/** Latencia simulada del API mientras el módulo trabaja con mocks. */
const MOCK_DELAY = 500;

/** Respuesta de éxito del API, sin cuerpo. */
function success(message: string): ApiSuccessResponse<void> {
  return { statusCode: 200, message, data: undefined };
}

/**
 * Acceso a los métodos de pago del usuario.
 *
 * Mientras `useMock` esté activo, el servicio se comporta como un backend en
 * memoria: el seed se copia al construirse y las altas, ediciones y borrados se
 * aplican sobre esa copia. Así la lista refleja el resultado de cada operación y
 * el flujo se puede verificar en navegador y en tests. El estado vive en la
 * instancia (root), no en la constante exportada, para no contaminar otras
 * pruebas ni mutar el mock compartido.
 *
 * El contrato real es la Data API de Supabase (PostgREST): el update y el delete
 * filtran por query param (`?id=eq.{id}`) y el update viaja con `PATCH` y solo
 * los campos cambiados. Las URLs reales se resuelven cuando exista el proyecto y
 * `useMock` pase a `false`.
 */
@Injectable({ providedIn: 'root' })
export class PaymentMethodsApiService {
  private readonly httpClient = inject(HttpClient);

  /** Mientras no exista el backend real, todo se resuelve con el mock. */
  private readonly useMock = true;

  /** Copia mutable del seed: el mock pasa de constante a estado en memoria. */
  private readonly mockPaymentMethods: PaymentMethodDto[] = PAYMENT_METHODS_USER_MOCK.data.map(
    (paymentMethod) => ({ ...paymentMethod }),
  );

  /** Id del próximo método creado en el mock. */
  private nextMockId =
    Math.max(0, ...this.mockPaymentMethods.map((paymentMethod) => paymentMethod.id)) + 1;

  /** Lista los métodos de pago del usuario. */
  getPaymentMethods(): Observable<ApiSuccessResponse<PaymentMethodDto[]>> {
    if (this.useMock) {
      return of({
        ...PAYMENT_METHODS_USER_MOCK,
        data: this.mockPaymentMethods.map((paymentMethod) => ({ ...paymentMethod })),
      }).pipe(delay(MOCK_DELAY));
    }

    return this.httpClient.get<ApiSuccessResponse<PaymentMethodDto[]>>('/payment-methods');
  }

  /** Crea un método de pago. */
  addPaymentMethod(
    addPaymentMethodRequest: PaymentMethodRequest,
  ): Observable<ApiSuccessResponse<void>> {
    if (this.useMock) {
      this.mockPaymentMethods.push({
        id: this.nextMockId,
        name: addPaymentMethodRequest.name,
        type: addPaymentMethodRequest.type,
        description: addPaymentMethodRequest.description ?? '',
        number: addPaymentMethodRequest.number ?? '',
        currency: addPaymentMethodRequest.currency,
      });
      this.nextMockId += 1;

      return of(success('Método de pago creado con éxito')).pipe(delay(MOCK_DELAY));
    }

    return this.httpClient.post<ApiSuccessResponse<void>>(
      '/payment-methods',
      addPaymentMethodRequest,
    );
  }

  /**
   * Actualiza solo los campos recibidos del método indicado.
   *
   * El `id` se separa del cuerpo: en PostgREST la fila se selecciona con el
   * filtro de la URL y el body solo lleva las columnas que cambian.
   */
  updatePaymentMethod(
    updatePaymentMethodRequest: UpdatePaymentMethodRequest,
  ): Observable<ApiSuccessResponse<void>> {
    const { id, ...changes } = updatePaymentMethodRequest;

    if (this.useMock) {
      const index = this.mockPaymentMethods.findIndex((paymentMethod) => paymentMethod.id === id);

      if (index === -1) {
        return throwError(() => new Error('El método de pago no existe'));
      }

      this.mockPaymentMethods[index] = { ...this.mockPaymentMethods[index], ...changes };

      return of(success('Método de pago actualizado con éxito')).pipe(delay(MOCK_DELAY));
    }

    return this.httpClient.patch<ApiSuccessResponse<void>>('/payment-methods', changes, {
      params: { id: `eq.${id}` },
    });
  }

  /** Elimina el método de pago indicado. */
  deletePaymentMethod(paymentMethodId: number): Observable<ApiSuccessResponse<void>> {
    if (this.useMock) {
      const index = this.mockPaymentMethods.findIndex(
        (paymentMethod) => paymentMethod.id === paymentMethodId,
      );

      if (index !== -1) {
        this.mockPaymentMethods.splice(index, 1);
      }

      return of(success('Método de pago eliminado con éxito')).pipe(delay(MOCK_DELAY));
    }

    return this.httpClient.delete<ApiSuccessResponse<void>>('/payment-methods', {
      params: { id: `eq.${paymentMethodId}` },
    });
  }
}
