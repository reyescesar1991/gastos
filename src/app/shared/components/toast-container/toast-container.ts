import { Component, inject } from '@angular/core';
import { ToastService } from '../../../core/services/toast-service';

/**
 * Contenedor de notificaciones tipo toast.
 *
 * Se monta una sola vez en la raíz de la app. Lee la lista reactiva de
 * `ToastService` y la pinta fija en la esquina inferior derecha, tanto en móvil
 * como en escritorio. Cada toast muestra su icono según la variante, el mensaje,
 * un botón de cierre y, cuando tiene duración, una barra que representa su
 * temporizador. El estilo vive en `toast-container.scss` y consume los tokens
 * globales de `styles.scss`.
 */
@Component({
  selector: 'app-toast-container',
  styleUrl: './toast-container.scss',
  templateUrl: './toast-container.html',
})
export class ToastContainer {
  /** Servicio de toasts: aporta la lista y el cierre manual. */
  protected readonly toastService = inject(ToastService);
}
