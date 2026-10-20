import type { PaymentMethodRequest } from './add-payment-method-request.model';
import type { PaymentMethodModel } from './payment-method.model';

/**
 * Actualización parcial de un método de pago.
 *
 * El `id` identifica el registro —viaja en el request para que el servicio arme
 * el filtro de Supabase— y el resto de los campos son opcionales: solo viajan
 * los que cambiaron, para no sobrescribir con valores viejos lo que el usuario
 * no tocó.
 *
 * El tipo del `id` sale del modelo: si la tabla usa `uuid` en lugar de un
 * entero, basta con cambiar `PaymentMethodModel` y este request lo hereda.
 */
export type UpdatePaymentMethodRequest = Partial<PaymentMethodRequest> & {
  readonly id: PaymentMethodModel['id'];
};
