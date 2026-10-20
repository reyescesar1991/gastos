import { Routes } from "@angular/router";


export const PAYMENT_METHODS_ROUTES : Routes = [

    {
        path: '',
        loadComponent: () => import('./components/list-payment-methods/list-payment-methods').then((m) => m.ListPaymentMethods)
    },

    {

        path: 'nuevo',
        loadComponent: () => import('./components/add-payment-method/add-payment-method').then((m) => m.AddPaymentMethod)
    }

]