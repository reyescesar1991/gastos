import type { PaymentMethodType } from './payment-method.model';

/** Opción del selector de tipo de método de pago. */
export interface PaymentMethodTypeOption {
  /** Valor del dominio que se guarda (`card` / `account` / `binance`). */
  readonly value: PaymentMethodType;

  /** Etiqueta completa, para la confirmación. */
  readonly label: string;

  /** Etiqueta corta, para el control segmentado en móvil. */
  readonly shortLabel: string;
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
 * Etiqueta del campo número según el tipo.
 *
 * En Binance el número es opcional, y la etiqueta lo dice para que el usuario no
 * lo confunda con un campo obligatorio. Se comparte entre el alta y el modal de
 * actualización para que ambos formularios hablen igual.
 */
export const PAYMENT_METHOD_NUMBER_LABELS: Record<PaymentMethodType, string> = {
  card: 'Número de tarjeta',
  account: 'Número de cuenta',
  binance: 'Número de la tarjeta Binance (opcional)',
};

/**
 * Opciones del selector, con la tarjeta primero por ser el caso más frecuente.
 *
 * El orden es de presentación: el valor por defecto lo fija
 * `createInitialAddPaymentMethodForm()`.
 */
export const PAYMENT_METHOD_TYPE_OPTIONS: readonly PaymentMethodTypeOption[] = [
  { value: 'card', label: PAYMENT_METHOD_TYPE_LABELS.card, shortLabel: 'Tarjeta' },
  { value: 'account', label: PAYMENT_METHOD_TYPE_LABELS.account, shortLabel: 'Cuenta' },
  { value: 'binance', label: PAYMENT_METHOD_TYPE_LABELS.binance, shortLabel: 'Binance' },
];
