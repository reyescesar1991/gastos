import { Component, OnInit, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MovementsStore } from '../../../../core/stores/movements/movements.store';
import { PaymentMethodsStore } from '../../../../core/stores/paymentMethods/payment-method.store';
import { AppIcon } from '../../../../shared/components/app-icon/app-icon';
import { MovementsList } from '../movements-list/movements-list';

/**
 * Vista completa de movimientos.
 *
 * Reutiliza `MovementsList` —el mismo componente del resumen— con la lista
 * entera de la store y con `showPaymentMethod`, que agrega a cada fila el
 * método de pago con su número enmascarado. Acá viven la carga inicial, el
 * reintento y el conteo; la presentación de las filas queda en el componente.
 *
 * Los métodos de pago se cargan en paralelo porque el nombre y el número se
 * resuelven contra su store: si la lista de movimientos llega antes, las filas
 * se pintan igual y muestran `N/A` hasta que la otra carga termina.
 */
@Component({
  imports: [RouterLink, AppIcon, MovementsList],
  selector: 'app-list-movements',
  styleUrl: './list-movements.scss',
  templateUrl: './list-movements.html',
})
export class ListMovements implements OnInit {
  /** Movimientos del usuario y estado de la carga. */
  protected readonly movementsStore = inject(MovementsStore);

  /** Métodos de pago, fuente del detalle de cada fila. */
  private readonly paymentMethodsStore = inject(PaymentMethodsStore);

  /** Lista completa, de la más reciente a la más antigua. */
  protected readonly movements = this.movementsStore.sortedMovements;

  /** Indica si el usuario tiene movimientos registrados. */
  protected readonly hasMovements = this.movementsStore.hasMovements;

  /**
   * Solo la primera carga muestra el estado de carga.
   *
   * Una recarga con datos en pantalla (por ejemplo, al reintentar) no debe
   * reemplazar la lista por el texto de carga.
   */
  protected readonly isInitialLoading = computed(
    () => this.movementsStore.isLoading() && !this.hasMovements(),
  );

  /** Cantidad de movimientos con su concordancia, para el pie de la lista. */
  protected readonly movementsCount = computed(() => {
    const total = this.movements().length;

    return `${total} ${total === 1 ? 'movimiento registrado' : 'movimientos registrados'}`;
  });

  /** Carga movimientos y métodos de pago al entrar a la vista. */
  ngOnInit(): void {
    void this.movementsStore.getMovements();
    void this.paymentMethodsStore.getPaymentMethods();
  }

  /** Vuelve a pedir la lista tras un error. */
  protected onRetry(): void {
    void this.movementsStore.getMovements();
  }
}
