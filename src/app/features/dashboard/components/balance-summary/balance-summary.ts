import { Component, input } from '@angular/core';
import type { Balance } from '../../../../core/models/balance/balance.model';
import { AppIcon } from '../../../../shared/components/app-icon/app-icon';
import { formatAmount } from '../../../../shared/utils/format.util';

/**
 * Resumen de balance en tres celdas.
 *
 * Presentacional: recibe el balance por input y lo pinta de izquierda a derecha
 * (ingresos, egresos y disponible). Cada celda se semaforiza con un acento
 * pastel de la paleta. Cuando el balance es `null` —el usuario todavía no
 * registró data— las celdas pierden el semáforo y muestran la etiqueta de valor
 * nulo junto a una nota.
 */
@Component({
  imports: [AppIcon],
  selector: 'app-balance-summary',
  styleUrl: './balance-summary.scss',
  templateUrl: './balance-summary.html',
})
export class BalanceSummary {
  /** Balance del usuario; `null` mientras no haya data registrada. */
  readonly balance = input<Balance | null>(null);

  /** Etiqueta que reemplaza al valor cuando no hay data. */
  protected readonly nullValue = '—';

  /** Formatea un importe con la moneda del balance. */
  protected amount(value: number): string {
    return formatAmount(value, this.balance()?.currency ?? 'USD');
  }
}
