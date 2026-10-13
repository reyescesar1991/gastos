import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastContainer } from './shared/components/toast-container/toast-container';

/**
 * Componente raíz: monta el `router-outlet` de las rutas y el contenedor de
 * notificaciones, que queda disponible en todas las pantallas.
 */
@Component({
  imports: [RouterOutlet, ToastContainer],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {}
