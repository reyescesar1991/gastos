import type { PaymentMethodModel } from './payment-method.model';

/**
 * Datos que recibe el modal de actualización.
 *
 * Viaja el método completo y no solo el id porque el formulario se precarga con
 * sus valores actuales y el mapper necesita el original para calcular el diff.
 */
export interface UpdatePaymentMethodDialogData {
  readonly paymentMethod: PaymentMethodModel;
}
