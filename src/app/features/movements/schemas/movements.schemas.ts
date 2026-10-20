import { z } from 'zod';
import type { MovementCurrency, MovementType } from '../../../core/models/movements/movement.model';

/**
 * Fuente única de verdad de las reglas del formulario de registro de movimientos.
 *
 * El componente las aplica con `validateStandardSchema()` de Signal Forms, que
 * reparte cada `issue` de Zod al campo que lo originó. Cambiar una regla aquí la
 * actualiza en la interfaz y en el estado del formulario.
 *
 * Dos detalles que explican la forma de este archivo:
 * - Los textos llevan mensaje de tipo ("Ingresa un importe", "Selecciona una
 *   fecha") porque un `<input>` vacío entrega `null` al modelo y, sin ese
 *   mensaje, Zod reportaría su error por defecto en inglés.
 * - `validateStandardSchema` solo valida: lee el valor del campo y reporta
 *   errores, pero **no** escribe la salida del schema en el modelo. Por eso el
 *   `trim()` de los textos se aplica en `AddMovementMapper` y no acá.
 */

/** Longitud mínima aceptada para la descripción. */
export const DESCRIPTION_MIN_LENGTH = 3;

/** Longitud máxima aceptada para la descripción. */
export const DESCRIPTION_MAX_LENGTH = 100;

/** Longitud máxima aceptada para la categoría, que además es opcional. */
export const CATEGORY_MAX_LENGTH = 60;

/** Importe mínimo aceptado: por debajo de un centavo no es un movimiento real. */
export const MIN_MOVEMENT_AMOUNT = 0.01;

/**
 * Tipos de movimiento aceptados.
 *
 * La anotación contra `MovementType` garantiza que el vocabulario del schema y el
 * del dominio no se separen: agregar un tipo en el modelo sin agregarlo acá (o al
 * revés) rompe la compilación.
 */
export const MOVEMENT_TYPE = ['expense', 'income'] as const satisfies readonly MovementType[];

/** Monedas aceptadas, alineadas con `MovementCurrency`. */
export const CURRENCY_TYPE = ['EUR', 'USD', 'USDT', 'VES'] as const satisfies readonly MovementCurrency[];

export const descriptionSchema = z
  .string({ error: 'Describe el movimiento' })
  .min(DESCRIPTION_MIN_LENGTH, `Mínimo ${DESCRIPTION_MIN_LENGTH} caracteres`)
  .max(DESCRIPTION_MAX_LENGTH, `Máximo ${DESCRIPTION_MAX_LENGTH} caracteres`);

export const amountSchema = z
  .number({ error: 'Ingresa un importe' })
  .min(MIN_MOVEMENT_AMOUNT, 'El importe debe ser mayor que cero');

export const movementTypeSchema = z.enum(MOVEMENT_TYPE, { error: 'Selecciona un tipo de movimiento' });

/** Categoría: opcional, pero con tope de longitud cuando se escribe. */
export const categorySchema = z
  .string()
  .max(CATEGORY_MAX_LENGTH, `Máximo ${CATEGORY_MAX_LENGTH} caracteres`)
  .optional();

export const currencySchema = z.enum(CURRENCY_TYPE, { error: 'Selecciona una moneda' });

export const dateSchema = z.date({ error: 'Selecciona una fecha' });

export const paymentMethodSchema = z.number().optional();

export const addMovementSchema = z.object({
  description: descriptionSchema,
  amount: amountSchema,
  type: movementTypeSchema,
  category: categorySchema,
  currency: currencySchema,
  date: dateSchema,
  paymentMethodId: paymentMethodSchema,
});
