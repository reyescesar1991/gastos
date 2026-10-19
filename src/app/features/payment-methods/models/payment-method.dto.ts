import { PaymentMethodCurrency, PaymentMethodType } from "./payment-method.model";


export interface PaymentMethodDto {
    id: number;
    name: string;
    type: PaymentMethodType;
    description?: string;
    number?: string;
    currency : PaymentMethodCurrency
}