import { Routes } from '@angular/router';

/**
 * Rutas del módulo de movimientos.
 *
 * Se cargan de forma diferida desde la ruta padre del layout, así que ambas
 * vistas heredan el header y el menú. La ruta vacía es la lista completa y
 * `nuevo`, el formulario de registro.
 */
export const MOVEMENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/list-movements/list-movements').then((m) => m.ListMovements),
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./components/add-movement/add-movement').then((m) => m.AddMovement),
  },
];
