import type { ApiSuccessResponse } from '../../../core/models/api/api-success.model';
import type { PaymentMethodDto } from '../models/payment-method.dto';

export const PAYMENT_METHODS_USER_MOCK: ApiSuccessResponse<PaymentMethodDto[]> = {
  statusCode: 200,
  message: 'Métodos de pago obtenidos con éxito',
  data: [
    {
      id: 1,
      name: 'Tarjeta de crédito',
      type: 'card',
      description: 'Tarjeta de crédito',
      number: '1234123412341234',
      currency: 'USD',
    },
    {
      id: 2,
      name: 'Cuenta bancaria',
      type: 'account',
      description: 'Cuenta bancaria',
      number: '12341234123412341234',
      currency: 'VES',
    },
  ],
};
