import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';
import { NavStore } from '../../../core/stores/navigation/nav.store';
import type { NavigationItem } from '../../models/navigation/navigation-item.model';
import { AppIcon } from '../app-icon/app-icon';

/**
 * Menú de navegación principal.
 *
 * Lee las opciones de `NavStore` y las pinta con su icono, nombre y estado:
 * las deshabilitadas se ven atenuadas, con la etiqueta "Próximamente" y sin
 * navegar; la opción correspondiente a la ruta actual queda marcada con
 * `aria-current` y el estilo de opción seleccionada.
 *
 * En móvil el panel se despliega bajo el header y su visibilidad la gobierna
 * `isMenuOpen`; en escritorio es una barra lateral siempre visible. El cambio de
 * breakpoint se resuelve solo con CSS.
 *
 * Una opción con `children` funciona como desplegable: al pulsarla se expande
 * su lista de rutas subhijas.
 */
@Component({
  imports: [AppIcon],
  selector: 'app-nav-menu',
  styleUrl: './nav-menu.scss',
  templateUrl: './nav-menu.html',
})
export class NavMenu {
  /** Estado del menú: opciones y visibilidad del panel. */
  protected readonly navStore = inject(NavStore);

  private readonly router = inject(Router);

  /** Ids de las opciones con subhijas desplegadas. */
  private readonly expandedIds = signal<readonly string[]>([]);

  /** URL actual, usada para marcar la opción seleccionada. */
  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  /** Indica si la opción corresponde a la ruta activa. */
  protected isActive(item: NavigationItem): boolean {
    const url = this.currentUrl();

    return url === item.route || url.startsWith(`${item.route}/`);
  }

  /** Indica si la opción tiene sus subhijas desplegadas. */
  protected isExpanded(item: NavigationItem): boolean {
    return this.expandedIds().includes(item.id);
  }

  /** Navega a la opción o despliega sus subhijas si las tiene. */
  protected onSelect(item: NavigationItem): void {
    if (item.children?.length) {
      this.toggleExpanded(item.id);
      return;
    }

    this.navStore.selectItem(item.id);
  }

  /** Navega a una ruta subhija. */
  protected onSelectChild(child: NavigationItem): void {
    this.navStore.selectItem(child.id);
  }

  /** Abre o cierra las subhijas de una opción con `children`. */
  private toggleExpanded(id: string): void {
    this.expandedIds.update((ids) =>
      ids.includes(id) ? ids.filter((itemId) => itemId !== id) : [...ids, id],
    );
  }
}
