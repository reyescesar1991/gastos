import type { MovementCurrency, MovementType } from '../../../core/models/movements/movement.model';

/**
 * Modelo mutable del formulario de registro de movimientos.
 *
 * Es la forma que edita el usuario: la fecha viaja como `Date`, porque Signal
 * Forms la enlaza con un `<input type="date">` usando `valueAsDate`.
 *
 * `category` es una cadena y no `string | undefined` aunque la categoría sea
 * opcional: un campo opcional vuelve opcional también su nodo en el árbol de
 * Signal Forms (habría que comprobar `undefined` en cada acceso desde el
 * template) y, además, un `undefined` en un `input` de texto termina pintándose
 * como el texto "undefined". La categoría vacía se omite del request en
 * `AddMovementMapper`, que es donde esa opcionalidad importa.
 */
export interface AddMovementForm {

    amount: number;

    description: string;

    date: Date;

    type: MovementType;

    category: string;

    currency: MovementCurrency;
}

/**
 * Estado inicial del formulario, y el estado al que vuelve "Limpiar".
 *
 * Es una fábrica y no una constante porque la fecha por defecto es la de hoy:
 * una constante congelaría la fecha en el momento de importar el módulo y
 * "Limpiar" devolvería el día equivocado si la app queda abierta pasada la
 * medianoche.
 *
 * La categoría arranca vacía porque es opcional: quien deja de serlo es el
 * request, no el formulario.
 */
export function createInitialMovementForm(): AddMovementForm {

    return {
        amount: 1,
        description: '',
        date: today(),
        type: 'expense',
        category: '',
        currency: 'USD',
    };
}

/** Fecha de hoy sin hora, para no arrastrar una hora que no se muestra. */
function today(): Date {

    const now = new Date();

    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}
