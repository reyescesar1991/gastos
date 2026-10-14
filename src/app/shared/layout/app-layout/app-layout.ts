import { Component, effect, inject, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { NavStore } from '../../../core/stores/navigation/nav.store';
import { AppHeader } from '../../components/app-header/app-header';
import { NavMenu } from '../../components/nav-menu/nav-menu';

/**
 * Layout de la app.
 *
 * Monta el header, el menú de navegación y el `router-outlet` a nivel de ruta
 * padre, de modo que cualquier módulo que cuelgue de este layout herede ambos
 * elementos. El panel del menú se cierra al cambiar de ruta (incluye atrás y
 * adelante) y con la tecla Escape.
 */
@Component({
  imports: [RouterOutlet, AppHeader, NavMenu],
  selector: 'app-layout',
  styleUrl: './app-layout.scss',
  templateUrl: './app-layout.html',
  host: {
    '(document:keydown.escape)': 'onEscape()',
  },
})
export class AppLayout {
  private readonly router = inject(Router);
  private readonly navStore = inject(NavStore);

  /** URL actual; cualquier cambio cierra el panel del menú. */
  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  constructor() {
    effect(() => {
      this.currentUrl();

      untracked(() => this.navStore.closeMenu());
    });
  }

  /** Cierra el panel del menú al pulsar Escape. */
  protected onEscape(): void {
    this.navStore.closeMenu();
  }
}
