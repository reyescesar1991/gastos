import { Component, inject } from '@angular/core';
import { PaymentMethodsStore } from '../../../../core/stores/paymentMethods/payment-method.store';

@Component({
  imports: [],
  selector: 'app-list-payment-methods',
  styleUrl: './list-payment-methods.scss',
  templateUrl: './list-payment-methods.html',
})
export class ListPaymentMethods {

  protected readonly paymentMethodsStore = inject(PaymentMethodsStore);

  
  
}
