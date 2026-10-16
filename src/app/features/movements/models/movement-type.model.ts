import type { MovementType } from '../../../core/models/movements/movement.model';

/** Opción del selector de tipo de movimiento. */
export interface MovementTypeOption {

    /** Valor del dominio que se guarda (`expense` / `income`). */
    readonly value: MovementType;

    /** Etiqueta visible en español. */
    readonly label: string;
}

/**
 * Etiquetas del tipo de movimiento.
 *
 * El valor del dominio nunca se traduce: la etiqueta es solo de presentación.
 * `expense` es "Gasto" (el valor por defecto del formulario) e `income` es
 * "Ingreso".
 */
export const MOVEMENT_TYPE_LABELS: Record<MovementType, string> = {
    expense: 'Gasto',
    income: 'Ingreso',
};

/**
 * Opciones del selector, con "Gasto" primero por ser el caso más frecuente.
 *
 * El orden es de presentación: el valor por defecto lo fija
 * `createInitialMovementForm()`.
 */
export const MOVEMENT_TYPE_OPTIONS: readonly MovementTypeOption[] = [
    { value: 'expense', label: MOVEMENT_TYPE_LABELS.expense },
    { value: 'income', label: MOVEMENT_TYPE_LABELS.income },
];
