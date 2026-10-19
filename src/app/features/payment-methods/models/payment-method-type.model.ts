import type { PaymentMethodType } from './payment-method.model';

/** Opción del selector de tipo de método de pago. */
export interface PaymentMethodTypeOption {
  /** Valor del dominio que se guarda (`card` / `account` / `binance`). */
  readonly value: PaymentMethodType;

  /** Etiqueta visible en español. */
  readonly label: string;
}

/**
 * Etiquetas del tipo de método de pago.
 *
 * El valor del dominio nunca se traduce: la etiqueta es solo de presentación y
 * evita mostrar `card`/`account` crudos en la confirmación.
 */
export const PAYMENT_METHOD_TYPE_LABELS: Record<PaymentMethodType, string> = {
  card: 'Tarjeta de crédito',
  account: 'Cuenta bancaria',
  binance: 'Binance',
};

/**
 * Opciones del selector, con la tarjeta primero por ser el caso más frecuente.
 *
 * El orden es de presentación: el valor por defecto lo fija
 * `createInitialAddPaymentMethodForm()`.
 */
export const PAYMENT_METHOD_TYPE_OPTIONS: readonly PaymentMethodTypeOption[] = [
  { value: 'card', label: PAYMENT_METHOD_TYPE_LABELS.card },
  { value: 'account', label: PAYMENT_METHOD_TYPE_LABELS.account },
  { value: 'binance', label: PAYMENT_METHOD_TYPE_LABELS.binance },
];
