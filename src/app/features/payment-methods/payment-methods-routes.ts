import { Routes } from "@angular/router";


export const PAYMENT_METHODS_ROUTES : Routes = [

    {
        path: '',
        redirectTo: 'nuevo',
        pathMatch: 'full',
    },

    {

        path: 'nuevo',
        loadComponent: () => import('./components/add-payment-method/add-payment-method').then((m) => m.AddPaymentMethod)
    }

]