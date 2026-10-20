import { Component, OnInit, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PaymentMethodsStore } from '../../../../core/stores/paymentMethods/payment-method.store';
import { AppIcon } from '../../../../shared/components/app-icon/app-icon';
import { ConfirmDialogService } from '../../../../shared/components/confirm-dialog/confirm-dialog.service';
import { UpdatePaymentMethodDialogService } from '../update-payment-method-dialog/update-payment-method-dialog.service';
import type { PaymentMethodModel, PaymentMethodType } from '../../models/payment-method.model';
import { PAYMENT_METHOD_TYPE_LABELS } from '../../models/payment-method-type.model';
import { maskPaymentMethodNumber } from '../../utils/payment-method.util';

/**
 * Administración de los métodos de pago del usuario.
 *
 * La lista sale de la store —un computed, para que el alta y la edición se
 * reflejen sin recargar la vista— y la vista se pinta como una tabla que en
 * móvil se reordena en tarjetas. Acá viven la carga inicial, el reintento, el
 * borrado con confirmación y la apertura del modal de actualización.
 *
 * Los campos opcionales del modelo (`number`, `description`) se presentan con un
 * texto por defecto, y el número siempre va enmascarado: la lista no expone el
 * dato completo en pantalla.
 */
@Component({
  imports: [RouterLink, AppIcon],
  selector: 'app-list-payment-methods',
  styleUrl: './list-payment-methods.scss',
  templateUrl: './list-payment-methods.html',
})
export class ListPaymentMethods implements OnInit {
  /** Métodos de pago y estado de la última operación. */
  protected readonly paymentMethodsStore = inject(PaymentMethodsStore);

  /** Lista reactiva; el computed vive en la store. */
  protected readonly paymentMethods = this.paymentMethodsStore.paymentMethodsList;

  /** Indica si hay al menos un método cargado. */
  protected readonly hasPaymentMethods = this.paymentMethodsStore.hasPaymentMethods;

  /** Cantidad de métodos con su concordancia, para el pie de la tabla. */
  protected readonly methodsCount = computed(() => {
    const total = this.paymentMethods().length;

    return `${total} ${total === 1 ? 'método registrado' : 'métodos registrados'}`;
  });

  /** Confirmación de borrado (CDK Dialog). */
  private readonly confirmDialog = inject(ConfirmDialogService);

  /** Modal de actualización (CDK Dialog). */
  private readonly updateDialog = inject(UpdatePaymentMethodDialogService);

  /** Carga la lista al entrar a la vista. */
  ngOnInit(): void {
    void this.paymentMethodsStore.getPaymentMethods();
  }

  /** Etiqueta legible del tipo. */
  protected typeLabel(type: PaymentMethodType): string {
    return PAYMENT_METHOD_TYPE_LABELS[type];
  }

  /** Número enmascarado o su texto por defecto. */
  protected numberLabel(paymentMethod: PaymentMethodModel): string {
    return maskPaymentMethodNumber(paymentMethod.number);
  }

  /** Descripción o su texto por defecto. */
  protected descriptionLabel(paymentMethod: PaymentMethodModel): string {
    return this.descriptionTitle(paymentMethod) ?? 'Sin descripción';
  }

  /** Descripción completa para el `title`, o `null` si no hay. */
  protected descriptionTitle(paymentMethod: PaymentMethodModel): string | null {
    const description = paymentMethod.description?.trim();

    return description ? description : null;
  }

  /**
   * Abre el modal de actualización con el método elegido.
   *
   * Se limpian los mensajes de la operación anterior para que el modal no nazca
   * con un error ajeno; al guardar, la store refresca la lista y el cambio se
   * refleja sin recargar la vista.
   */
  protected async onUpdate(paymentMethod: PaymentMethodModel): Promise<void> {
    this.paymentMethodsStore.resetFeedback();

    await this.updateDialog.open(paymentMethod);
  }

  /**
   * Pide confirmación y elimina el método.
   *
   * El foco arranca en “Cancelar” porque la acción es destructiva. El toast de
   * éxito lo emite la store; duplicarlo acá mostraría dos avisos por el mismo
   * borrado.
   */
  protected async onDelete(paymentMethod: PaymentMethodModel): Promise<void> {
    this.paymentMethodsStore.resetFeedback();

    const confirmed = await this.confirmDialog.ask(
      {
        title: 'Eliminar método de pago',
        content: {
          kind: 'message',
          message: `Se eliminará «${paymentMethod.name}». Esta acción no se puede deshacer.`,
        },
        confirmLabel: 'Eliminar',
        cancelLabel: 'Cancelar',
      },
      { autoFocus: '.confirm__button--cancel' },
    );

    if (!confirmed) {
      return;
    }

    await this.paymentMethodsStore.deletePaymentMethod(paymentMethod.id);
  }

  /** Vuelve a pedir la lista tras un error. */
  protected onRetry(): void {
    void this.paymentMethodsStore.getPaymentMethods();
  }
}
