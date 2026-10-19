import { PaymentMethodCurrency, PaymentMethodType } from './payment-method.model';

export interface AddPaymentMethodForm {
  name: string;
  type: PaymentMethodType;
  description: string;
  number: string;
  currency: PaymentMethodCurrency;
}

export function createInitialAddPaymentMethodForm(): AddPaymentMethodForm {
  return {
    name: '',
    type: 'account',
    description: '',
    number: '',
    currency: 'USD',
  };
}
