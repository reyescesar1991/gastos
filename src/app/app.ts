import { Component, effect, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SessionStore } from './core/stores/auth/session.store';
import { ToastContainer } from './shared/components/toast-container/toast-container';

/**
 * Componente raíz: monta el `router-outlet` de las rutas y el contenedor de
 * notificaciones, que queda disponible en todas las pantallas.
 *
 * Además traduce el tema de la sesión al documento: el estado vive en
 * `SessionStore` y acá se escribe el atributo `data-theme` de `<html>`, que es
 * lo que activa los tokens de `styles.scss`. Se hace en la raíz —y no dentro
 * del layout— para que el tema también aplique a las pantallas de auth, y en un
 * `effect` para que cualquier cambio de tema se refleje solo.
 */
@Component({
  imports: [RouterOutlet, ToastContainer],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  private readonly sessionStore = inject(SessionStore);

  constructor() {
    effect(() => {
      document.documentElement.dataset['theme'] = this.sessionStore.resolvedTheme();
    });
  }
}
