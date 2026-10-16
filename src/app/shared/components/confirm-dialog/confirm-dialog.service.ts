import { Dialog, type DialogConfig, type DialogRef } from '@angular/cdk/dialog';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type { ConfirmDialogData } from '../../models/dialog/confirm-dialog.model';
import { ConfirmDialog } from './confirm-dialog';

/** Ancho del diálogo: ocupa el móvil con márgenes y se corta en escritorio. */
const DIALOG_WIDTH = 'calc(100vw - 2rem)';

/** Ancho máximo del diálogo. */
const DIALOG_MAX_WIDTH = '30rem';

/**
 * Servicio de confirmación.
 *
 * Envuelve `Dialog` del CDK para que quien pregunta no repita la configuración ni
 * gestione el resultado: el CDK aporta el overlay, el velo, el trap de foco, el
 * cierre con `Escape` y la devolución del foco, y acá solo queda exponer la
 * pregunta como una promesa.
 *
 * Así el consumo queda en una línea:
 * `if (await confirmDialog.ask({ ... })) { ... }`
 */
@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  private readonly dialog = inject(Dialog);

  /**
   * Abre el diálogo de confirmación y resuelve si el usuario confirmó.
   *
   * @param data Título, contenido (mensaje o resumen campo-valor) y etiquetas.
   * @param config Ajustes puntuales sobre la configuración por defecto, como
   * `restoreFocus` cuando el foco debe volver a un elemento concreto.
   * @returns `true` solo si se pulsó la acción principal; `false` si se pulsó la
   * secundaria, con `Escape` o con el velo.
   */
  async ask(
    data: ConfirmDialogData,
    config?: DialogConfig<ConfirmDialogData, DialogRef<boolean>>,
  ): Promise<boolean> {
    const dialogRef = this.dialog.open<boolean, ConfirmDialogData>(ConfirmDialog, {
      data,
      width: DIALOG_WIDTH,
      maxWidth: DIALOG_MAX_WIDTH,
      // El nombre accesible del `role="dialog"` que arma el CDK sale del título.
      ariaLabel: data.title,
      ariaModal: true,
      // El foco entra por la acción principal y no por la primera del DOM (que es
      // la secundaria): quien abre el diálogo suele querer continuar.
      autoFocus: '.confirm__button--confirm',
      restoreFocus: true,
      ...config,
    });

    // `Escape` y el velo cierran sin resultado: solo el `true` explícito confirma.
    return (await firstValueFrom(dialogRef.closed)) === true;
  }
}
