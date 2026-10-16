import { Component, input } from '@angular/core';
import type { Movement } from '../../../../core/models/movements/movement.model';
import { AppIcon } from '../../../../shared/components/app-icon/app-icon';
import { formatAmount, formatDate } from '../../../../shared/utils/format.util';

/**
 * Lista de últimos movimientos.
 *
 * Presentacional: recibe los movimientos ya recortados por la store y los pinta
 * con su descripción, importe, tipo, moneda y fecha. El semáforo va en el chip,
 * en la etiqueta de tipo y en la tinta del importe, según el tipo del
 * movimiento. Resuelve además los dos estados previos: cargando y sin
 * movimientos.
 */
@Component({
  imports: [AppIcon],
  selector: 'app-movements-list',
  styleUrl: './movements-list.scss',
  templateUrl: './movements-list.html',
})
export class MovementsList {
  /** Movimientos a listar, del más reciente al más antiguo. */
  readonly movements = input.required<readonly Movement[]>();

  /** Indica si el usuario tiene movimientos registrados. */
  readonly hasMovements = input(false);

  /** Indica si la carga de movimientos está en curso. */
  readonly isLoading = input(false);

  /** Etiqueta del tipo de movimiento. */
  protected typeLabel(type: Movement['type']): string {
    return type === 'income' ? 'Ingreso' : 'Egreso';
  }

  /** Formatea el importe de un movimiento en su moneda. */
  protected amount(movement: Movement): string {
    return formatAmount(movement.amount, movement.currency);
  }

  /** Formatea la fecha de un movimiento. */
  protected date(value: string): string {
    return formatDate(value);
  }
}
