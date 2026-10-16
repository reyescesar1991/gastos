import { z } from 'zod';


export const DESCRIPTION_MAX_LENGTH = 100;

export const DESCRIPTION_MIN_LENGTH = 3;

export const MOVEMENT_TYPE = ['expense', 'income'] as const;

export const CURRENCY_TYPE = ['EUR', 'USD', 'USDT', 'VES'] as const;

export const MIN_MOVEMENT_AMOUNT = 0.01;


export const descriptionSchema = z
    .string()
    .min(DESCRIPTION_MIN_LENGTH, `Mínimo ${DESCRIPTION_MIN_LENGTH} caracteres`)
    .max(DESCRIPTION_MAX_LENGTH, `Máximo ${DESCRIPTION_MAX_LENGTH} caracteres`);

export const amountSchema = z
    .number()
    .min(MIN_MOVEMENT_AMOUNT, 'El importe debe ser mayor que cero');

export const movementTypeSchema = z.enum(MOVEMENT_TYPE);

export const categorySchema = z
    .string()
    .optional()
    .default('');

export const currencySchema = z.enum(CURRENCY_TYPE);

export const dateSchema = z.date();

export const addMovementSchema = z.object({
    description: descriptionSchema,
    amount: amountSchema,
    type: movementTypeSchema,
    category: categorySchema,
    currency: currencySchema,
    date: dateSchema,
});