import type {
  PaymentMethodCurrency,
  PaymentMethodModel,
  PaymentMethodType,
} from './payment-method.model';

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

/**
 * Precarga el formulario de edición con los valores actuales del método.
 *
 * Los opcionales del modelo se normalizan a `''`, que es lo que espera el
 * formulario y lo que el schema acepta como vacío. Se mantiene el mismo tipo de
 * formulario que el alta para reutilizar schema, controles y validaciones.
 */
export function createPaymentMethodFormFromModel(
  paymentMethod: PaymentMethodModel,
): AddPaymentMethodForm {
  return {
    name: paymentMethod.name,
    type: paymentMethod.type,
    description: paymentMethod.description ?? '',
    number: paymentMethod.number ?? '',
    currency: paymentMethod.currency,
  };
}
