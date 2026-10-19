import { PaymentMethodCurrency, PaymentMethodType } from "./payment-method.model";


export interface AddPaymentMethodRequest {

    name: string,
    type: PaymentMethodType,
    description?: string,
    number?: string,
    currency: PaymentMethodCurrency
}