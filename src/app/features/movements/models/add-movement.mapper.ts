import { toIsoDate } from '../../../shared/utils/format.util';
import type { AddMovementForm } from './add-movement-form.model';
import type { AddMovementRequest } from './add-movement-request.model';

/**
 * Conversión del modelo del formulario de registro al payload que consume el API.
 *
 * Es el único lugar donde el formulario se traduce a request, y asume un
 * formulario válido: `submit()` de Signal Forms solo llega acá cuando el schema
 * ya garantizó importe, descripción, tipo, moneda y fecha. Lo que sí normaliza es
 * lo que el schema deja laxo:
 * - `trim()` de descripción y categoría. No se hace en el schema porque
 *   `validateStandardSchema` no escribe su salida en el modelo; si se hiciera
 *   allí, un espacio al final nunca se limpiaría.
 * - Categoría vacía se omite del request, para no enviar una cadena en blanco.
 * - `Date` → día ISO (`YYYY-MM-DD`), sin desfase de huso horario.
 */
export class AddMovementMapper {

    public static toRequest(form: AddMovementForm): AddMovementRequest {

        const category = form.category.trim();

        return {
            amount: form.amount,
            description: form.description.trim(),
            date: toIsoDate(form.date),
            type: form.type,
            category: category === '' ? undefined : category,
            currency: form.currency,
        };
    }
}
