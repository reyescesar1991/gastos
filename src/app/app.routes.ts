import { Routes } from '@angular/router';

export const routes: Routes = [

    {
        path: '',
        redirectTo: 'auth',
        pathMatch: 'full'
    },
    {
        path: 'auth',
        loadChildren: () => import('./features/auth/auth-routes').then((m) => m.AUTH_ROUTES)
    },
    {
        // Ruta padre del layout: header y menú disponibles en todos los módulos
        path: '',
        loadComponent: () => import('./shared/layout/app-layout/app-layout').then((m) => m.AppLayout),
        children: [
            {
                path: 'dashboard',
                loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard)
            },
            {
                path: 'configuracion',
                loadComponent: () => import('./features/settings/pages/user-settings/user-settings').then((m) => m.UserSettings)
            },
            {
                path: '**',
                redirectTo: 'dashboard'
            }
        ]
    },

];
