/**
 * Datos del diálogo de confirmación.
 *
 * `content` es una unión discriminada por `kind`, y ese discriminante es la
 * variable que decide qué se pinta: un resumen campo-valor (`facts`) o un mensaje
 * a secas (`message`). Un resumen puede llevar además su mensaje de contexto, que
 * es lo que usa la confirmación de un formulario ("revisa los valores antes de
 * guardarlo" + la lista de valores).
 */

/** Fila del resumen: una etiqueta y su valor, al estilo clave-valor. */
export interface DialogFact {

    /** Etiqueta del dato. */
    readonly label: string;

    /** Valor ya formateado, listo para leer. */
    readonly value: string;

    /** Semáforo del valor, cuando representa un tipo de movimiento. */
    readonly tone?: 'income' | 'expense';

    /** Fuerza la tipografía monoespaciada, para cifras y fechas. */
    readonly mono?: boolean;
}

/** Contenido del diálogo, según el tipo de dato que se quiera mostrar. */
export type DialogContent =
    | {
        readonly kind: 'message';
        readonly message: string;
    }
    | {
        readonly kind: 'facts';
        readonly facts: readonly DialogFact[];
        /** Mensaje de contexto, opcional, encima del resumen. */
        readonly message?: string;
    };

/** Datos que recibe el contenido del diálogo. */
export interface ConfirmDialogData {

    /** Título del diálogo. */
    readonly title: string;

    /** Contenido: un mensaje o un resumen campo-valor. */
    readonly content: DialogContent;

    /** Etiqueta de la acción principal. */
    readonly confirmLabel?: string;

    /** Etiqueta de la acción secundaria. */
    readonly cancelLabel?: string;
}
