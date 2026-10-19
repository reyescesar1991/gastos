import { AddPaymentMethodRequest } from "./add-payment-method-request.model"
import { PaymentMethodDto } from "./payment-method.dto"
import { PaymentMethodModel } from "./payment-method.model"


export class PaymentMethodMapper {

    public static toModel(paymentMethodDto: PaymentMethodDto): PaymentMethodModel {
        return {
            id: paymentMethodDto.id,
            number: paymentMethodDto.number ?? '',
            type: paymentMethodDto.type,
            description: paymentMethodDto.description ?? '',
            name : paymentMethodDto.name,
            currency : paymentMethodDto.currency
        }
    }

    public static toDto(paymentMethod: PaymentMethodModel): PaymentMethodDto {
        return {
            id: paymentMethod.id,
            number: paymentMethod.number ?? '',
            type: paymentMethod.type,
            description: paymentMethod.description ?? '',
            name : paymentMethod.name,
            currency : paymentMethod.currency
        }
    }

    public static toRequest(paymentMethod: Omit<PaymentMethodModel , 'id'>): AddPaymentMethodRequest {
        return {
            name: paymentMethod.name,
            type: paymentMethod.type,
            description: paymentMethod.description ?? '',
            number: paymentMethod.number ?? '',
            currency: paymentMethod.currency
        }
    }

    public static toModels(paymentMethodsDto: PaymentMethodDto[]): PaymentMethodModel[] {
        return paymentMethodsDto.map(paymentMethodDto => this.toModel(paymentMethodDto));
    }
}