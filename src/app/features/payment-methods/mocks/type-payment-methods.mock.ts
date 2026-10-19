import { ApiSuccessResponse } from "../../../core/models/api/api-success.model";
import { PaymentMethodDto } from "../models/payment-method.dto";


export interface TypePaymentMethodsDto{
    id: number;
    name: string;
}

export const TYPE_PAYMENT_METHODS_API_RESPONSE_MOCK : ApiSuccessResponse<TypePaymentMethodsDto[]> = {
    statusCode: 200,
    message: 'Tipos de metodos de pago obtenidos con éxito',
    data: [
        {
            id: 1,
            name: "Tarjeta de credito"
        },
        {
            id: 2,
            name: "Cuenta bancaria"
        },
        {
            id: 3,
            name: "Binance"
        }
    ]
    
}

export const PAYMENT_METHODS_USER_MOCK : ApiSuccessResponse<PaymentMethodDto[]> = {
    
    statusCode: 200,
    message: 'Metodos de pago obtenidos con éxito',
    data: [
        {
            id: 1,
            name: "Tarjeta de credito",
            type: "card",
            description: "Tarjeta de credito",
            number: "1234123412341234",
            currency: "USD"
        },
        {
            id: 2,
            name: "Cuenta bancaria",
            type: "account",
            description: "Cuenta bancaria",
            number: "12341234123412341234",
            currency: "VES"
        }
    ]
}