import { Dialog } from '@angular/cdk/dialog';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type { PaymentMethodModel } from '../../models/payment-method.model';
import type { UpdatePaymentMethodDialogData } from '../../models/update-payment-method-dialog.model';
import { UpdatePaymentMethodDialog } from './update-payment-method-dialog';

/** Ancho del diálogo: ocupa el móvil con márgenes y se corta en escritorio. */
const DIALOG_WIDTH = 'calc(100vw - 2rem)';

/** Ancho máximo del diálogo. */
const DIALOG_MAX_WIDTH = '30rem';

/**
 * Servicio del modal de actualización.
 *
 * Igual que `ConfirmDialogService`, envuelve `Dialog` del CDK para que la lista
 * solo haga `await updateDialog.open(method)`: el overlay, el velo, el trap de
 * foco, `Escape` y la devolución del foco viven en el CDK, y acá solo queda
 * resolver la promesa con el resultado.
 */
@Injectable({ providedIn: 'root' })
export class UpdatePaymentMethodDialogService {
  private readonly dialog = inject(Dialog);

  /**
   * Abre el modal con el método a editar.
   *
   * @param paymentMethod Método actual; el formulario se precarga con sus valores.
   * @returns `true` solo si se guardó; `false` al cancelar, con `Escape` o con
   * el clic en el velo.
   */
  async open(paymentMethod: PaymentMethodModel): Promise<boolean> {
    const dialogRef = this.dialog.open<boolean, UpdatePaymentMethodDialogData>(
      UpdatePaymentMethodDialog,
      {
        data: { paymentMethod },
        width: DIALOG_WIDTH,
        maxWidth: DIALOG_MAX_WIDTH,
        ariaLabel: 'Actualizar método de pago',
        ariaModal: true,
        // El foco entra por el primer campo editable, no por “Cancelar”.
        autoFocus: '#update-name',
        restoreFocus: true,
      },
    );

    return (await firstValueFrom(dialogRef.closed)) === true;
  }
}
