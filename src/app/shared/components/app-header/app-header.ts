import { Component, computed, inject, signal } from '@angular/core';
import { SessionStore } from '../../../core/stores/auth/session.store';
import { NavStore } from '../../../core/stores/navigation/nav.store';
import { AppIcon } from '../app-icon/app-icon';
import { NAVIGATION_IDS } from '../nav-menu/mocks/navigation-menu.mock';

/**
 * Header de la app.
 *
 * Contiene los tres elementos pedidos: el botón de cerrar sesión, la etiqueta
 * con el nombre del usuario y su avatar. En móvil suma el botón de hamburguesa
 * que despliega el menú (visible solo bajo 768px, donde el panel vive en el
 * header).
 *
 * El avatar es un botón: lleva a "Configuración de usuario" y, mientras esa
 * opción siga deshabilitada, avisa con un toast en vez de dejar el click sin
 * respuesta. Si el usuario no tiene imagen o la imagen falla, se muestran sus
 * iniciales.
 */
@Component({
  imports: [AppIcon],
  selector: 'app-header',
  styleUrl: './app-header.scss',
  templateUrl: './app-header.html',
})
export class AppHeader {
  /** Sesión del usuario: nombre, avatar y cierre de sesión. */
  protected readonly sessionStore = inject(SessionStore);

  /** Estado del menú: visibilidad del panel y resolución de opciones. */
  protected readonly navStore = inject(NavStore);

  /** Marca si la imagen del avatar falló y hay que caer en las iniciales. */
  protected readonly avatarFailed = signal(false);

  /** URL del avatar del usuario, si tiene una asignada. */
  protected readonly avatarUrl = computed(() => this.sessionStore.user()?.avatarUrl ?? null);

  /** Iniciales del nombre del usuario, como respaldo del avatar. */
  protected readonly initials = computed(() => {

    const parts = this.sessionStore.nameUser().trim().split(/\s+/).slice(0, 2);

    return parts.map((part) => part.charAt(0).toUpperCase()).join('');
  });

  /** Abre la configuración de usuario; si la opción no está activa, avisa. */
  protected onAvatarClick(): void {
    this.navStore.selectItem(NAVIGATION_IDS.userSettings);
  }

  /** Alterna el panel del menú en móvil. */
  protected onToggleMenu(): void {
    this.navStore.toggleMenu();
  }

  /** Cierra la sesión y vuelve al login. */
  protected onLogout(): void {
    this.sessionStore.logout();
  }
}
