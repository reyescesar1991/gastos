import { Component, computed, inject, signal } from '@angular/core';
import { FormField, form, submit, validateStandardSchema } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { PaymentMethodsStore } from '../../../../core/stores/paymentMethods/payment-method.store';
import { ConfirmDialogService } from '../../../../shared/components/confirm-dialog/confirm-dialog.service';
import type { DialogFact } from '../../../../shared/models/dialog/confirm-dialog.model';
import type { AddPaymentMethodForm } from '../../models/add-payment-method-form.model';
import { createInitialAddPaymentMethodForm } from '../../models/add-payment-method-form.model';
import { PaymentMethodMapper } from '../../models/payment-method.mapper';
import type { PaymentMethodType } from '../../models/payment-method.model';
import {
  PAYMENT_METHOD_NUMBER_LABELS,
  PAYMENT_METHOD_TYPE_LABELS,
  PAYMENT_METHOD_TYPE_OPTIONS,
} from '../../models/payment-method-type.model';
import {
  CURRENCY_TYPE,
  MAX_DESCRIPTION_LENGTH_PAYMENT_METHOD,
  MAX_NAME_LENGTH_PAYMENT_METHOD,
  PAYMENT_METHOD_NUMBER_MAX_LENGTH,
  paymentMethodSchema,
} from '../../schemas/payment-methods.schemas';
import { PaymentMethodRequest } from '../../models/add-payment-method-request.model';
import {
  maskPaymentMethodNumber,
  sanitizePaymentMethodNumber,
} from '../../utils/payment-method.util';

/**
 * Pantalla de registro de un método de pago.
 *
 * Usa Signal Forms de Angular 22: `paymentMethodModel` es la señal mutable del
 * formulario, `paymentMethodForm` el árbol de campos (`FieldTree`) y las reglas
 * viven en `paymentMethodSchema` (Zod), enganchadas con `validateStandardSchema()`.
 *
 * El flujo es el mismo que el de movimientos y todos los eventos pasan por
 * `PaymentMethodsStore`:
 * 1. **Formulario**: se completa y se limpia (`onClear`), con los validadores
 *    activos después de limpiar.
 * 2. **Confirmación**: el envío válido no guarda todavía. Se abre el diálogo con
 *    el request ya mapeado y el número enmascarado para revisar los valores.
 * 3. **Registrado**: si el guardado fue aceptado se pregunta si quiere registrar
 *    otro; al aceptar se limpia el formulario y el foco vuelve a `#name`, y al
 *    rechazar se redirige al resumen.
 *
 * El número no se limita con `maxlength`: el compilador de Signal Forms rechaza
 * ese binding junto a `[formField]`. La barrera es `beforeinput` (navegador) y el
 * saneo de `input` (pegado, autocompletado y jsdom), con el tope según el tipo.
 */
@Component({
  imports: [FormField, RouterLink],
  selector: 'app-add-payment-method',
  styleUrl: './add-payment-method.scss',
  templateUrl: './add-payment-method.html',
})
export class AddPaymentMethod {
  /** Métodos de pago del usuario: acá vive el guardado y su resultado. */
  protected readonly paymentMethodsStore = inject(PaymentMethodsStore);

  private readonly router = inject(Router);

  /** Modelo mutable del formulario; Signal Forms lo usa como fuente de verdad. */
  protected readonly paymentMethodModel = signal<AddPaymentMethodForm>(
    createInitialAddPaymentMethodForm(),
  );

  /** Árbol de campos del formulario con el schema Zod aplicado. */
  protected readonly paymentMethodForm = form(this.paymentMethodModel, (path) => {
    validateStandardSchema(path, paymentMethodSchema);
  });

  /** Tipos de método de pago con su etiqueta corta y completa. */
  protected readonly typeOptions = PAYMENT_METHOD_TYPE_OPTIONS;

  /** Monedas aceptadas por el formulario. */
  protected readonly currencies = CURRENCY_TYPE;

  /** Tope de caracteres del nombre, para el contador. */
  protected readonly nameMaxLength = MAX_NAME_LENGTH_PAYMENT_METHOD;

  /** Tope de caracteres de la descripción, para el contador. */
  protected readonly descriptionMaxLength = MAX_DESCRIPTION_LENGTH_PAYMENT_METHOD;

  /** Tope de dígitos del número según el tipo elegido. */
  protected readonly numberMaxLength = computed(
    () => PAYMENT_METHOD_NUMBER_MAX_LENGTH[this.paymentMethodModel().type],
  );

  /** En Binance el número es opcional; en tarjeta y cuenta es obligatorio. */
  protected readonly numberRequired = computed(() => this.paymentMethodModel().type !== 'binance');

  /** Etiqueta del número, que cambia con el tipo elegido. */
  protected readonly numberLabel = computed(
    () => PAYMENT_METHOD_NUMBER_LABELS[this.paymentMethodModel().type],
  );

  /** Indica si hay un guardado en curso, para bloquear el envío. */
  protected readonly isSaving = this.paymentMethodsStore.isLoading;

  /** Diálogos de confirmación (CDK Dialog). */
  private readonly confirmDialog = inject(ConfirmDialogService);

  /**
   * Valida y abre la confirmación de valores.
   *
   * `submit()` solo ejecuta la acción cuando el formulario es válido y marca los
   * campos como tocados, para que los errores se muestren tras el primer intento.
   */
  protected onSubmit(event: Event): void {
    event.preventDefault();

    void submit(this.paymentMethodForm, { action: async () => this.confirmAndSave() });
  }

  /**
   * Al cambiar el tipo, recorta el número al nuevo tope.
   *
   * Pasar de cuenta (20) a tarjeta (16) no debe dejar un número inválido que el
   * usuario no puede corregir sin borrar: se conservan los primeros dígitos.
   */
  protected onTypeChange(type: PaymentMethodType): void {
    const number = sanitizePaymentMethodNumber(this.paymentMethodModel().number, type);

    if (number !== this.paymentMethodModel().number) {
      this.paymentMethodForm.number().value.set(number);
    }
  }

  /**
   * Bloquea la inserción que superaría el tope del tipo actual.
   *
   * Cubre el tecleo normal en el navegador; el pegado y el autocompletado pasan
   * por `onNumberInput()`.
   */
  protected onNumberBeforeInput(event: InputEvent): void {
    if (event.inputType.startsWith('delete') || event.data === null) {
      return;
    }

    const input = event.target as HTMLInputElement;
    const selected = (input.selectionEnd ?? 0) - (input.selectionStart ?? 0);

    if (input.value.length - selected + event.data.length > this.numberMaxLength()) {
      event.preventDefault();
    }
  }

  /**
   * Respaldo del tope: deja solo dígitos y recorta al máximo del tipo.
   *
   * También es el camino verificable en jsdom, donde los specs disparan `input`
   * con el valor ya escrito.
   */
  protected onNumberInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = sanitizePaymentMethodNumber(input.value, this.paymentMethodModel().type);

    if (value !== input.value) {
      input.value = value;
    }

    if (value !== this.paymentMethodModel().number) {
      this.paymentMethodForm.number().value.set(value);
    }
  }

  /**
   * Pide confirmación, guarda y ofrece encadenar otro método de pago.
   *
   * Si el guardado falla, la store ya avisó con un toast y acá no se ofrece
   * registrar otro, porque no se registró.
   */
  private async confirmAndSave(): Promise<void> {
    const request = PaymentMethodMapper.toRequest(this.paymentMethodModel());

    const confirmed = await this.confirmDialog.ask({
      title: 'Confirmar método de pago',
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

    const saved = await this.paymentMethodsStore.addPaymentMethod(request);

    if (!saved) {
      return;
    }

    const another = await this.confirmDialog.ask(
      {
        title: 'Método de pago registrado',
        confirmLabel: 'Registrar otro',
        cancelLabel: 'Ir al resumen',
        content: { kind: 'message', message: '¿Quieres registrar otro método de pago?' },
      },
      // El foco vuelve al primer campo para poder encadenar otro sin el ratón.
      { restoreFocus: '#name' },
    );

    if (another) {
      this.onClear();
      return;
    }

    void this.router.navigate(['/dashboard']);
  }

  /** Resumen campo-valor del método de pago, para la confirmación. */
  private factsOf(request: PaymentMethodRequest): DialogFact[] {
    return [
      { label: 'Tipo', value: PAYMENT_METHOD_TYPE_LABELS[request.type] },
      { label: 'Nombre', value: request.name },
      { label: 'Número', value: maskPaymentMethodNumber(request.number), mono: true },
      { label: 'Descripción', value: request.description ?? 'Sin descripción' },
      { label: 'Moneda', value: request.currency, mono: true },
    ];
  }

  /**
   * Devuelve el formulario a su estado inicial.
   *
   * El modelo vuelve a los valores por defecto, `reset()` limpia el estado
   * `touched`/`dirty` —para que los errores no reaparezcan sobre un formulario
   * recién limpiado— y la store descarta el mensaje de la operación anterior.
   */
  protected onClear(): void {
    this.paymentMethodModel.set(createInitialAddPaymentMethodForm());
    this.paymentMethodForm().reset();
    this.paymentMethodsStore.resetFeedback();
  }
}
