import { Component, OnInit, computed, inject } from '@angular/core';
import { BalanceStore } from '../../core/stores/balance/balance.store';
import { MovementsStore } from '../../core/stores/movements/movements.store';
import { NavStore } from '../../core/stores/navigation/nav.store';
import { AppIcon } from '../../shared/components/app-icon/app-icon';
import { NAVIGATION_IDS } from '../../shared/components/nav-menu/mocks/navigation-menu.mock';
import { BalanceSummary } from './components/balance-summary/balance-summary';
import { MovementsList } from './components/movements-list/movements-list';
import { QuickNav } from './components/quick-nav/quick-nav';

/**
 * Vista de resumen del usuario.
 *
 * Orquesta la carga de datos y compone los cuatro bloques del instructivo,
 * mobile first: el resumen de balance, la navegación rápida, los últimos
 * movimientos y el acceso rápido a registrar movimiento. Cada bloque vive en su
 * propio componente presentacional, que recibe la data por inputs; acá quedan
 * las stores y el acceso rápido, que resuelve su acción contra el menú.
 */
@Component({
  imports: [AppIcon, BalanceSummary, QuickNav, MovementsList],
  selector: 'app-dashboard',
  styleUrl: './dashboard.scss',
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  /** Balance del usuario: ingresos, egresos y disponible. */
  protected readonly balanceStore = inject(BalanceStore);

  /** Movimientos del usuario y sus derivados para el resumen. */
  protected readonly movementsStore = inject(MovementsStore);

  /** Menú de navegación, fuente del acceso rápido. */
  protected readonly navStore = inject(NavStore);

  /** Indica si la acción de registrar movimiento ya está disponible. */
  protected readonly canAddMovement = computed(() =>
    this.navStore.items().some((item) => item.id === NAVIGATION_IDS.movementAdd && item.enabled),
  );

  /** Carga balance y movimientos al entrar a la vista. */
  ngOnInit(): void {
    void this.balanceStore.getBalance();
    void this.movementsStore.getMovements();
  }

  /** Usa la acción de registrar movimiento desde el acceso rápido. */
  protected onAddMovement(): void {
    this.navStore.selectItem(NAVIGATION_IDS.movementAdd);
  }
}
