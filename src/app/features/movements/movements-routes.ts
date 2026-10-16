import { Routes } from '@angular/router';

/**
 * Rutas del módulo de movimientos.
 *
 * Se cargan de forma diferida desde la ruta padre del layout, así que el
 * formulario de registro hereda el header y el menú. La ruta vacía lleva al
 * registro, que es hoy el único destino del módulo.
 */
export const MOVEMENTS_ROUTES: Routes = [

    {
        path: '',
        redirectTo: 'nuevo',
        pathMatch: 'full',
    },
    {
        path: 'nuevo',
        loadComponent: () =>
            import('./components/add-movement/add-movement').then((m) => m.AddMovement),
    },
];
