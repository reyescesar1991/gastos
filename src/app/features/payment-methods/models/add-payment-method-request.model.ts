import { PaymentMethodCurrency, PaymentMethodType } from "./payment-method.model";


export interface PaymentMethodRequest {

    name: string,
    type: PaymentMethodType,
    description?: string,
    number?: string,
    currency: PaymentMethodCurrency
}