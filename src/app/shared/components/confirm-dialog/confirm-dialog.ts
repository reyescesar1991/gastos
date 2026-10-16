import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, inject } from '@angular/core';
import type { ConfirmDialogData, DialogFact } from '../../models/dialog/confirm-dialog.model';

/**
 * Contenido del diálogo de confirmación.
 *
 * Es el componente que `ConfirmDialogService` monta dentro del overlay del CDK.
 * Del comportamiento del modal no queda nada acá: el servicio y el CDK ya
 * resuelven el foco al abrir, el trap, `Escape`, el clic en el velo y la devolución
 * del foco al cerrar, así que este componente solo pinta el contenido y las dos
 * acciones.
 *
 * El resultado se comunica cerrando el `DialogRef`: `true` para la acción
 * principal y `false` para la secundaria. (`Escape` y el velo cierran sin valor,
 * o sea `undefined`, que el servicio interpreta como no confirmado.)
 *
 * Los datos llegan por `DIALOG_DATA` y su forma la define `DialogContent`: el
 * discriminante `kind` decide si se pinta un resumen campo-valor o un mensaje.
 */
@Component({
  selector: 'app-confirm-dialog',
  styleUrl: './confirm-dialog.scss',
  templateUrl: './confirm-dialog.html',
})
export class ConfirmDialog {
  /** Datos del diálogo, inyectados por el CDK al abrirlo. */
  protected readonly data = inject<ConfirmDialogData>(DIALOG_DATA);

  /** Referencia al diálogo, para cerrarlo con el resultado. */
  private readonly dialogRef = inject<DialogRef<boolean>>(DialogRef);

  /**
   * Contenido resuelto para el template.
   *
   * La unión se normaliza acá —y no con un `@switch` en el markup— para que el
   * tipado quede cerrado en un solo lugar: el template se limita a pintar un
   * mensaje si lo hay y una lista de pares si la hay, sin importar cuál de los
   * dos tipos de contenido se pidió.
   */
  protected readonly view = this.resolveContent();

  /** Cierra el diálogo confirmando la acción principal. */
  protected onConfirm(): void {
    this.dialogRef.close(true);
  }

  /** Cierra el diálogo sin confirmar. */
  protected onCancel(): void {
    this.dialogRef.close(false);
  }

  /** Traduce el contenido recibido a mensaje y lista de pares. */
  private resolveContent(): { message: string | null; facts: readonly DialogFact[] } {
    const content = this.data.content;

    return content.kind === 'facts'
      ? { message: content.message ?? null, facts: content.facts }
      : { message: content.message, facts: [] };
  }
}
