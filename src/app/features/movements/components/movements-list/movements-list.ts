import { Component, computed, inject, input } from '@angular/core';
import type { Movement } from '../../../../core/models/movements/movement.model';
import { PaymentMethodsStore } from '../../../../core/stores/paymentMethods/payment-method.store';
import { AppIcon } from '../../../../shared/components/app-icon/app-icon';
import { formatAmount, formatDate } from '../../../../shared/utils/format.util';
import type { PaymentMethodModel } from '../../../payment-methods/models/payment-method.model';
import { maskPaymentMethodNumber } from '../../../payment-methods/utils/payment-method.util';

/** Texto para un método de pago que no se puede resolver (id ausente o ajeno). */
const NOT_AVAILABLE = 'N/A';

/**
 * Lista de movimientos.
 *
 * Presentacional: recibe los movimientos ya resueltos por la store y los pinta
 * con su descripción, importe, tipo, moneda y fecha. El semáforo va en el chip,
 * en la etiqueta de tipo y en la tinta del importe, según el tipo del
 * movimiento. Resuelve además los dos estados previos: cargando y sin
 * movimientos.
 *
 * Se reutiliza en el resumen (últimos 5) y en la vista completa de movimientos.
 * Con `showPaymentMethod` en `true` cada fila suma el método de pago asociado
 * —nombre y número enmascarado— que el movimiento puede no tener: en ese caso,
 * o si el id ya no existe en la store, se muestra `N/A`. Es la vista completa
 * quien carga los métodos de pago; sin ellos las filas siguen pintándose.
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

  /** Título de la sección; la vista completa lo cambia por "Todos los movimientos". */
  readonly heading = input('Últimos movimientos');

  /** Muestra el método de pago de cada movimiento (solo en la vista completa). */
  readonly showPaymentMethod = input(false);

  /** Métodos de pago del usuario, fuente del nombre y el número por id. */
  private readonly paymentMethodsStore = inject(PaymentMethodsStore);

  /**
   * Índice id → método de pago.
   *
   * Se arma una vez por cambio de la store y no por fila: resolver cada fila con
   * un `find` recorrería la lista completa de métodos por movimiento.
   */
  private readonly paymentMethodsById = computed(
    () =>
      new Map(
        this.paymentMethodsStore
          .paymentMethodsList()
          .map((paymentMethod) => [paymentMethod.id, paymentMethod] as const),
      ),
  );

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

  /**
   * Busca el método de pago del movimiento.
   *
   * El id es opcional en el movimiento y el método puede haberse eliminado
   * después de registrarlo, así que el resultado ausente es un caso esperado y
   * no un error: quien consume decide el texto por defecto.
   */
  protected paymentMethod(paymentMethodId?: number): PaymentMethodModel | undefined {
    return paymentMethodId === undefined
      ? undefined
      : this.paymentMethodsById().get(paymentMethodId);
  }

  /** Nombre del método de pago, o `N/A` si no se puede resolver. */
  protected paymentMethodName(paymentMethodId?: number): string {
    return this.paymentMethod(paymentMethodId)?.name ?? NOT_AVAILABLE;
  }

  /** Número enmascarado del método de pago, o `N/A` si no se puede resolver. */
  protected paymentMethodNumber(paymentMethodId?: number): string {
    const paymentMethod = this.paymentMethod(paymentMethodId);

    return paymentMethod === undefined
      ? NOT_AVAILABLE
      : maskPaymentMethodNumber(paymentMethod.number);
  }
}
