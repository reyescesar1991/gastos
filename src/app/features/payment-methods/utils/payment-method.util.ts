import type { PaymentMethodType } from '../models/payment-method.model';
import { PAYMENT_METHOD_NUMBER_MAX_LENGTH } from '../schemas/payment-methods.schemas';

/**
 * Presenta el número de un método de pago sin exponerlo completo.
 *
 * Solo se conservan los últimos cuatro dígitos, que alcanzan para reconocer la
 * tarjeta o cuenta. Un número vacío se anuncia con un texto explícito en vez de
 * dejar la celda en blanco.
 */
export function maskPaymentMethodNumber(number?: string): string {
  const digits = number?.trim() ?? '';

  return digits === '' ? 'Sin número' : `•••• ${digits.slice(-4)}`;
}

/**
 * Deja solo dígitos y recorta al tope del tipo indicado.
 *
 * Es la misma regla que valida el schema, aplicada al valor que llega del input:
 * cubre el pegado, el autocompletado y el cambio de tipo, donde el navegador ya
 * escribió antes de que se pueda bloquear la tecla.
 */
export function sanitizePaymentMethodNumber(value: string, type: PaymentMethodType): string {
  return value.replace(/\D/g, '').slice(0, PAYMENT_METHOD_NUMBER_MAX_LENGTH[type]);
}
