import { z } from 'zod';
import type { PaymentMethodCurrency, PaymentMethodType } from '../models/payment-method.model';

/**
 * Fuente única de verdad del formulario de métodos de pago.
 *
 * El componente la aplica con `validateStandardSchema()` de Signal Forms, que
 * reparte cada `issue` de Zod al campo que lo originó. Cambiar una regla aquí la
 * actualiza en la interfaz y en el estado del formulario.
 *
 * La regla del número depende del tipo, por eso el schema es una unión
 * discriminada por `type`: una tarjeta no puede pasar como cuenta con 20
 * dígitos. Las longitudes son exactas (no rangos): no existen tarjetas de 15 o
 * 17 dígitos, y las cuentas del país del usuario son de 20.
 */

/** Longitud exacta del número de tarjeta, incluida la tarjeta de Binance. */
export const CARD_NUMBER_LENGTH = 16;

/** Longitud exacta del número de cuenta bancaria. */
export const ACCOUNT_NUMBER_LENGTH = 20;

/** Longitud mínima aceptada para el nombre del método. */
export const MIN_NAME_LENGTH_PAYMENT_METHOD = 3;

/** Longitud máxima aceptada para el nombre del método. */
export const MAX_NAME_LENGTH_PAYMENT_METHOD = 50;

/** Longitud mínima aceptada para la descripción (solo si se escribe). */
export const MIN_DESCRIPTION_LENGTH_PAYMENT_METHOD = 3;

/** Longitud máxima aceptada para la descripción. */
export const MAX_DESCRIPTION_LENGTH_PAYMENT_METHOD = 100;

/**
 * Tope de tecleo del número para cada tipo.
 *
 * Es el mismo valor que valida el schema y lo consume el componente para
 * recortar lo que se escribe o se pega. La anotación contra `PaymentMethodType`
 * garantiza que agregar un tipo sin definir su tope rompa la compilación.
 */
export const PAYMENT_METHOD_NUMBER_MAX_LENGTH = {
  card: CARD_NUMBER_LENGTH,
  account: ACCOUNT_NUMBER_LENGTH,
  binance: CARD_NUMBER_LENGTH,
} as const satisfies Record<PaymentMethodType, number>;

/** Monedas aceptadas, alineadas con `PaymentMethodCurrency`. */
export const CURRENCY_TYPE = [
  'EUR',
  'USD',
  'USDT',
  'VES',
] as const satisfies readonly PaymentMethodCurrency[];

/** Tipos aceptados, alineados con `PaymentMethodType`. */
export const TYPE_PAYMENT_METHOD = [
  'card',
  'account',
  'binance',
] as const satisfies readonly PaymentMethodType[];

export const currencySchema = z.enum(CURRENCY_TYPE, { error: 'Selecciona una moneda' });

export const nameSchema = z
  .string({ error: 'Ingresa un nombre' })
  .trim()
  .min(MIN_NAME_LENGTH_PAYMENT_METHOD, `Mínimo ${MIN_NAME_LENGTH_PAYMENT_METHOD} caracteres`)
  .max(MAX_NAME_LENGTH_PAYMENT_METHOD, `Máximo ${MAX_NAME_LENGTH_PAYMENT_METHOD} caracteres`);

/**
 * Descripción opcional.
 *
 * El modelo del formulario arranca en `''` (no en `undefined`), así que `''` y
 * los espacios deben ser válidos. `.optional()` se conserva para tolerar un
 * modelo sin el campo.
 */
export const descriptionSchema = z
  .string({ error: 'Describe el método de pago' })
  .trim()
  .max(
    MAX_DESCRIPTION_LENGTH_PAYMENT_METHOD,
    `Máximo ${MAX_DESCRIPTION_LENGTH_PAYMENT_METHOD} caracteres`,
  )
  .refine(
    (value) => value === '' || value.length >= MIN_DESCRIPTION_LENGTH_PAYMENT_METHOD,
    `Mínimo ${MIN_DESCRIPTION_LENGTH_PAYMENT_METHOD} caracteres`,
  )
  .optional();

/**
 * Número de tarjeta o cuenta: solo dígitos y longitud exacta.
 *
 * Los tres chequeos se hacen en un solo `superRefine` para que cada valor
 * inválido produzca un único mensaje; con `.min()` + `.regex()` + `.length()`
 * un campo vacío reportaría tres errores a la vez.
 */
function digitsSchema(length: number, optional = false) {
  return z.string({ error: 'Ingresa el número' }).superRefine((value, context) => {
    if (value === '') {
      if (!optional) {
        context.addIssue({ code: 'custom', message: 'Ingresa el número' });
      }

      return;
    }

    if (!/^\d+$/.test(value)) {
      context.addIssue({ code: 'custom', message: 'Debe contener solo números' });
      return;
    }

    if (value.length !== length) {
      context.addIssue({ code: 'custom', message: `Debe tener ${length} dígitos` });
    }
  });
}

const baseShape = {
  name: nameSchema,
  description: descriptionSchema,
  currency: currencySchema,
};

export const cardPaymentMethodSchema = z.object({
  ...baseShape,
  type: z.literal('card'),
  number: digitsSchema(CARD_NUMBER_LENGTH),
});

export const accountPaymentMethodSchema = z.object({
  ...baseShape,
  type: z.literal('account'),
  number: digitsSchema(ACCOUNT_NUMBER_LENGTH),
});

/**
 * Binance suele pagarse con la tarjeta de Binance, cuyo número es opcional:
 * vacío es válido; si se completa, exige 16 dígitos.
 */
export const binancePaymentMethodSchema = z.object({
  ...baseShape,
  type: z.literal('binance'),
  number: digitsSchema(CARD_NUMBER_LENGTH, true),
});

export const paymentMethodSchema = z.discriminatedUnion('type', [
  cardPaymentMethodSchema,
  accountPaymentMethodSchema,
  binancePaymentMethodSchema,
]);
