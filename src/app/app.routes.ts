import { Routes } from '@angular/router';
import { DASHBOARD_ROUTES } from './features/dashboard/dashboard.routes';

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
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => DASHBOARD_ROUTES)
  },
    
];
