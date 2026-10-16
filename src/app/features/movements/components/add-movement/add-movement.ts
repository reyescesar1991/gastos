import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormField, form, maxLength, submit, validateStandardSchema } from '@angular/forms/signals';
import { MovementsStore } from '../../../../core/stores/movements/movements.store';
import { ConfirmDialogService } from '../../../../shared/components/confirm-dialog/confirm-dialog.service';
import type { DialogFact } from '../../../../shared/models/dialog/confirm-dialog.model';
import { formatAmount, formatDate } from '../../../../shared/utils/format.util';
import { MOVEMENT_CATEGORIES } from '../../mocks/movement-categories.mock';
import { createInitialMovementForm, type AddMovementForm } from '../../models/add-movement-form.model';
import { AddMovementMapper } from '../../models/add-movement.mapper';
import type { AddMovementRequest } from '../../models/add-movement-request.model';
import { MOVEMENT_TYPE_LABELS, MOVEMENT_TYPE_OPTIONS } from '../../models/movement-type.model';
import {
  CATEGORY_MAX_LENGTH,
  CURRENCY_TYPE,
  DESCRIPTION_MAX_LENGTH,
  addMovementSchema,
} from '../../schemas/movements.schemas';

/**
 * Pantalla de registro de movimiento.
 *
 * Usa Signal Forms de Angular 22: `movementModel` es la señal mutable del
 * formulario, `movementForm` el árbol de campos (`FieldTree`) y las reglas viven
 * en `addMovementSchema` (Zod), enganchadas con `validateStandardSchema()`.
 *
 * El flujo tiene tres pasos y todos los eventos pasan por `MovementsStore`:
 * 1. **Formulario**: se completa y se limpia (`onClear`), con los validadores
 *    activos después de limpiar.
 * 2. **Confirmación**: el envío válido no guarda todavía. Se abre el diálogo con
 *    el request ya mapeado como resumen campo-valor para revisar los valores.
 * 3. **Registrado**: si el guardado fue aceptado se pregunta si quiere registrar
 *    otro; al aceptar se limpia el formulario y el foco vuelve al primer campo, y
 *    al rechazar se redirige al resumen.
 *
 * Los diálogos los abre `ConfirmDialogService` (CDK Dialog) y se consumen con
 * `await`, así que el componente no mantiene estado de apertura ni se ocupa del
 * foco: cada paso es una pregunta y su respuesta.
 */
@Component({
  imports: [FormField, RouterLink],
  selector: 'app-add-movement',
  styleUrl: './add-movement.scss',
  templateUrl: './add-movement.html',
})
export class AddMovement {
  /** Movimientos del usuario: acá vive el guardado y su resultado. */
  protected readonly movementsStore = inject(MovementsStore);

  private readonly router = inject(Router);

  /** Modelo mutable del formulario; Signal Forms lo usa como fuente de verdad. */
  protected readonly movementModel = signal<AddMovementForm>(createInitialMovementForm());

  /** Árbol de campos del formulario con el schema Zod aplicado. */
  protected readonly movementForm = form(this.movementModel, (path) => {

    maxLength(path.description, DESCRIPTION_MAX_LENGTH);

    validateStandardSchema(path, addMovementSchema);
  });

  /** Tipos de movimiento con su etiqueta: Gasto e Ingreso. */
  protected readonly typeOptions = MOVEMENT_TYPE_OPTIONS;

  /** Monedas aceptadas por el formulario. */
  protected readonly currencies = CURRENCY_TYPE;

  /** Sugerencias del campo categoría. */
  protected readonly categories = MOVEMENT_CATEGORIES;

  /** Tope de caracteres de la descripción, para el `maxlength` y el contador. */
  protected readonly descriptionMaxLength = DESCRIPTION_MAX_LENGTH;

  /** Tope de caracteres de la categoría, para el `maxlength` y el contador. */
  protected readonly categoryMaxLength = CATEGORY_MAX_LENGTH;

  /** Indica si hay un guardado en curso, para bloquear el envío. */
  protected readonly isSaving = this.movementsStore.isLoading;

  /** Diálogos de confirmación (CDK Dialog). */
  private readonly confirmDialog = inject(ConfirmDialogService);

  /**
   * Valida y abre la confirmación de valores.
   *
   * `submit()` solo ejecuta la acción cuando el formulario es válido y marca los
   * campos como tocados, para que los errores se muestren tras el primer intento.
   * Acá no se guarda todavía: primero se revisan los valores (punto 8).
   *
   * @param event Evento nativo de envío del formulario.
   */
  protected onSubmit(event: Event): void {
    event.preventDefault();

    void submit(this.movementForm, { action: async () => this.confirmAndSave() });
  }

  /**
   * Pide confirmación, guarda y ofrece encadenar otro movimiento.
   *
   * El orden es el del instructivo: primero se revisan los valores (punto 8) y
   * solo después se envía a la store; si el guardado falla, la store ya avisó con
   * un toast y acá no se ofrece registrar otro, porque no se registró.
   */
  private async confirmAndSave(): Promise<void> {
    const request = AddMovementMapper.toRequest(this.movementModel());

    const confirmed = await this.confirmDialog.ask({
      title: 'Confirmar movimiento',
      confirmLabel: 'Guardar',
      cancelLabel: 'Volver',
      content: {
        kind: 'facts',
        message: 'Revisa los valores antes de guardarlo.',
        facts: this.factsOf(request),
      },
    });

    if (!confirmed) {
      return;
    }

    const saved = await this.movementsStore.addMovement(request);

    if (!saved) {
      return;
    }

    const another = await this.confirmDialog.ask(
      {
        title: 'Movimiento registrado',
        confirmLabel: 'Registrar otro',
        cancelLabel: 'Ir al resumen',
        content: { kind: 'message', message: '¿Quieres registrar otro movimiento?' },
      },
      // El foco vuelve al primer campo para poder encadenar otro sin el ratón.
      { restoreFocus: '#description' },
    );

    if (another) {
      this.onClear();
      return;
    }

    void this.router.navigate(['/dashboard']);
  }

  /** Resumen campo-valor del movimiento, para el diálogo de confirmación. */
  private factsOf(request: AddMovementRequest): DialogFact[] {
    return [
      { label: 'Tipo', value: MOVEMENT_TYPE_LABELS[request.type], tone: request.type },
      { label: 'Importe', value: formatAmount(request.amount, request.currency), mono: true },
      { label: 'Fecha', value: formatDate(request.date), mono: true },
      { label: 'Descripción', value: request.description },
      { label: 'Categoría', value: request.category ?? 'Sin categoría' },
    ];
  }

  /**
   * Devuelve el formulario a su estado inicial.
   *
   * Son tres pasos porque cada uno cubre algo distinto: el modelo vuelve a los
   * valores por defecto, `reset()` limpia el estado `touched`/`dirty` de todos los
   * campos —así los errores no reaparecen sobre un formulario recién limpiado y
   * los validadores vuelven a evaluar desde cero— y la store descarta el mensaje
   * de la operación anterior.
   */
  protected onClear(): void {
    this.movementModel.set(createInitialMovementForm());
    this.movementForm().reset();
    this.movementsStore.resetFeedback();
  }

}
