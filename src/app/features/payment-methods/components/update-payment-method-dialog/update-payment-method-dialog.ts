import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, computed, inject, signal } from '@angular/core';
import { FormField, form, submit, validateStandardSchema } from '@angular/forms/signals';
import { PaymentMethodsStore } from '../../../../core/stores/paymentMethods/payment-method.store';
import type { AddPaymentMethodForm } from '../../models/add-payment-method-form.model';
import { createPaymentMethodFormFromModel } from '../../models/add-payment-method-form.model';
import { PaymentMethodMapper } from '../../models/payment-method.mapper';
import type { PaymentMethodType } from '../../models/payment-method.model';
import {
  PAYMENT_METHOD_NUMBER_LABELS,
  PAYMENT_METHOD_TYPE_OPTIONS,
} from '../../models/payment-method-type.model';
import type { UpdatePaymentMethodDialogData } from '../../models/update-payment-method-dialog.model';
import {
  CURRENCY_TYPE,
  MAX_DESCRIPTION_LENGTH_PAYMENT_METHOD,
  MAX_NAME_LENGTH_PAYMENT_METHOD,
  PAYMENT_METHOD_NUMBER_MAX_LENGTH,
  paymentMethodSchema,
} from '../../schemas/payment-methods.schemas';
import { sanitizePaymentMethodNumber } from '../../utils/payment-method.util';

/**
 * Modal de actualización de un método de pago.
 *
 * Reutiliza el schema y los controles del alta, pero parte de los valores
 * actuales del método y guarda solo el diff. El formulario arranca válido y sin
 * cambios: el botón de guardar se habilita recién cuando hay algo que enviar.
 *
 * El diálogo lo monta `UpdatePaymentMethodDialogService`; el CDK aporta el
 * overlay, el foco y el cierre con `Escape`. Si la actualización falla, el modal
 * queda abierto con los datos para reintentar, y el error se lee de la store.
 *
 * El número mantiene el tope por tipo del alta, incluida la barrera de
 * `beforeinput` que el compilador de Signal Forms exige en lugar de `maxlength`.
 */
@Component({
  imports: [FormField],
  selector: 'app-update-payment-method-dialog',
  styleUrl: './update-payment-method-dialog.scss',
  templateUrl: './update-payment-method-dialog.html',
})
export class UpdatePaymentMethodDialog {
  /** Método que se está editando, inyectado por el CDK. */
  protected readonly data = inject<UpdatePaymentMethodDialogData>(DIALOG_DATA);

  /** Referencia del diálogo, para cerrarlo con el resultado. */
  private readonly dialogRef = inject<DialogRef<boolean>>(DialogRef);

  /** Store: guardado, error y estado de carga compartidos con la lista. */
  protected readonly store = inject(PaymentMethodsStore);

  /** Modelo mutable del formulario, precargado con el método actual. */
  protected readonly model = signal<AddPaymentMethodForm>(
    createPaymentMethodFormFromModel(this.data.paymentMethod),
  );

  /** Árbol de campos con el mismo schema del alta. */
  protected readonly formTree = form(this.model, (path) => {
    validateStandardSchema(path, paymentMethodSchema);
  });

  /** Tipos disponibles con su etiqueta corta. */
  protected readonly typeOptions = PAYMENT_METHOD_TYPE_OPTIONS;

  /** Monedas aceptadas. */
  protected readonly currencies = CURRENCY_TYPE;

  /** Tope de caracteres del nombre, para el contador. */
  protected readonly nameMaxLength = MAX_NAME_LENGTH_PAYMENT_METHOD;

  /** Tope de caracteres de la descripción, para el contador. */
  protected readonly descriptionMaxLength = MAX_DESCRIPTION_LENGTH_PAYMENT_METHOD;

  /** Tope de dígitos del número según el tipo elegido. */
  protected readonly numberMaxLength = computed(
    () => PAYMENT_METHOD_NUMBER_MAX_LENGTH[this.model().type],
  );

  /** En Binance el número es opcional; en tarjeta y cuenta es obligatorio. */
  protected readonly numberRequired = computed(() => this.model().type !== 'binance');

  /** Etiqueta del número, que cambia con el tipo elegido. */
  protected readonly numberLabel = computed(() => PAYMENT_METHOD_NUMBER_LABELS[this.model().type]);

  /** Indica si hay un guardado en curso, para bloquear el envío. */
  protected readonly isSaving = this.store.isLoading;

  /**
   * Valida y guarda el diff contra el método original.
   *
   * `submit()` solo ejecuta la acción cuando el formulario es válido y marca los
   * campos como tocados, para que los errores aparezcan tras el primer intento.
   * El guardia de `dirty` cubre el envío con Enter: sin cambios no hay diff que
   * mandar y el modal no debe cerrarse como si hubiera guardado algo.
   */
  protected onSubmit(event: Event): void {
    event.preventDefault();

    if (!this.formTree().dirty()) {
      return;
    }

    void submit(this.formTree, { action: async () => this.save() });
  }

  /**
   * Al cambiar el tipo, recorta el número al nuevo tope.
   *
   * Pasar de cuenta (20) a tarjeta (16) no debe dejar un número que el usuario no
   * pueda corregir sin borrarlo entero: se conservan los primeros dígitos.
   */
  protected onTypeChange(type: PaymentMethodType): void {
    const number = sanitizePaymentMethodNumber(this.model().number, type);

    if (number !== this.model().number) {
      this.formTree.number().value.set(number);
    }
  }

  /** Bloquea la inserción que superaría el tope del tipo actual. */
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

  /** Respaldo del tope: deja solo dígitos y recorta al máximo del tipo. */
  protected onNumberInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = sanitizePaymentMethodNumber(input.value, this.model().type);

    if (value !== input.value) {
      input.value = value;
    }

    if (value !== this.model().number) {
      this.formTree.number().value.set(value);
    }
  }

  /** Cierra el diálogo sin guardar. */
  protected onCancel(): void {
    this.dialogRef.close(false);
  }

  /**
   * Guarda el diff y cierra solo si la store confirmó la actualización.
   *
   * Un fallo deja el modal abierto con los datos y el error visible, para que el
   * usuario pueda corregir o reintentar sin volver a escribir todo.
   */
  private async save(): Promise<void> {
    const request = PaymentMethodMapper.toUpdateRequest(this.data.paymentMethod, this.model());
    const updated = await this.store.updatePaymentMethod(request);

    if (updated) {
      this.dialogRef.close(true);
    }
  }
}
