

/**
 * Tipo de movimiento.
 *
 * Un único vocabulario para todo el dominio: el mismo valor se envía al
 * registrar (`expense` / `income`) y el mismo se recibe al listar, así que no
 * hay traducciones entre request y lectura.
 */
export type MovementType = 'income' | 'expense';

/** Monedas soportadas por el formulario de registro. */
export type MovementCurrency = 'EUR' | 'USD' | 'USDT' | 'VES';

export interface Movement{

    id: string,
    amount: number,
    description: string,
    date: string,
    type: MovementType,
    paymentMethodId?: number,
    category: string,
    currency: string
}