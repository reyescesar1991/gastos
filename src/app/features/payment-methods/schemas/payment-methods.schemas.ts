import { z } from 'zod';
import { PaymentMethodCurrency, PaymentMethodType } from '../models/payment-method.model';

export const CARD_NUMBER_LENGTH = 16;

export const ACCOUNT_NUMBER_LENGTH = 20;

export const MAX_NAME_LENGTH_PAYMENT_METHOD = 50;

export const MIN_NAME_LENGTH_PAYMENT_METHOD = 3;

export const MAX_DESCRIPTION_LENGTH_PAYMENT_METHOD = 100;

export const MIN_DESCRIPTION_LENGTH_PAYMENT_METHOD = 3;


export const CURRENCY_TYPE = ['EUR', 'USD', 'USDT', 'VES'] as const satisfies readonly PaymentMethodCurrency[];

export const TYPE_PAYMENT_METHOD = ['card', 'account', 'binance'] as const satisfies readonly PaymentMethodType[];

const descriptionSchema = z
    .string({ error: 'Describe el movimiento' })
    .min(MIN_DESCRIPTION_LENGTH_PAYMENT_METHOD, `Mínimo ${MIN_DESCRIPTION_LENGTH_PAYMENT_METHOD} caracteres`)
    .max(MAX_DESCRIPTION_LENGTH_PAYMENT_METHOD, `Máximo ${MAX_DESCRIPTION_LENGTH_PAYMENT_METHOD} caracteres`)
    .optional();

const nameSchema = z
    .string({ error: 'Ingresa un nombre' })
    .min(MIN_NAME_LENGTH_PAYMENT_METHOD, `Mínimo ${MIN_NAME_LENGTH_PAYMENT_METHOD} caracteres`)
    .max(MAX_NAME_LENGTH_PAYMENT_METHOD, `Máximo ${MAX_NAME_LENGTH_PAYMENT_METHOD} caracteres`);

const currencySchema = z.enum(CURRENCY_TYPE, { error: 'Selecciona una moneda' });

const cardNumberSchema = z
    .string({ error: 'Ingresa un nombre' })
    .regex(/^[0-9]+$/, 'Debe contener solo números')
    .min(CARD_NUMBER_LENGTH, `Mínimo ${CARD_NUMBER_LENGTH} caracteres`)
    .max(CARD_NUMBER_LENGTH, `Máximo ${CARD_NUMBER_LENGTH} caracteres`);

const accountNumberSchema = z
    .string({ error: 'Ingresa un nombre' })
    .regex(/^[0-9]+$/, 'Debe contener solo números')
    .min(ACCOUNT_NUMBER_LENGTH, `Mínimo ${ACCOUNT_NUMBER_LENGTH} caracteres`)
    .max(ACCOUNT_NUMBER_LENGTH, `Máximo ${ACCOUNT_NUMBER_LENGTH} caracteres`);

const typeSchema = z.enum(TYPE_PAYMENT_METHOD, { error: 'Selecciona un tipo de metodo de pago' });


export const paymentMethodSchema = z.object({
    name: nameSchema,
    description: descriptionSchema,
    currency: currencySchema,
    type: typeSchema,
    number: z.union([cardNumberSchema, accountNumberSchema]).optional()
});

