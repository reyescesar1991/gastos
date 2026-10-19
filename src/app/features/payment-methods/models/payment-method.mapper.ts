import type { AddPaymentMethodForm } from './add-payment-method-form.model';
import type { AddPaymentMethodRequest } from './add-payment-method-request.model';
import type { PaymentMethodDto } from './payment-method.dto';
import type { PaymentMethodModel } from './payment-method.model';

/**
 * Conversión entre el contrato del API y el dominio del módulo.
 *
 * `toRequest` normaliza lo que el schema no puede hacer: `validateStandardSchema`
 * solo valida, no escribe la salida del schema en el modelo. Por eso aquí se
 * recortan los espacios y los campos opcionales vacíos se omiten en lugar de
 * viajar como `''`.
 */
export class PaymentMethodMapper {
  public static toModel(paymentMethodDto: PaymentMethodDto): PaymentMethodModel {
    return {
      id: paymentMethodDto.id,
      number: paymentMethodDto.number ?? '',
      type: paymentMethodDto.type,
      description: paymentMethodDto.description ?? '',
      name: paymentMethodDto.name,
      currency: paymentMethodDto.currency,
    };
  }

  public static toDto(paymentMethod: PaymentMethodModel): PaymentMethodDto {
    return {
      id: paymentMethod.id,
      number: paymentMethod.number ?? '',
      type: paymentMethod.type,
      description: paymentMethod.description ?? '',
      name: paymentMethod.name,
      currency: paymentMethod.currency,
    };
  }

  public static toRequest(form: AddPaymentMethodForm): AddPaymentMethodRequest {
    const description = form.description?.trim();
    const number = form.number.trim();

    return {
      name: form.name.trim(),
      type: form.type,
      description: description ? description : undefined,
      number: number ? number : undefined,
      currency: form.currency,
    };
  }

  public static toModels(paymentMethodsDto: PaymentMethodDto[]): PaymentMethodModel[] {
    return paymentMethodsDto.map((paymentMethodDto) => this.toModel(paymentMethodDto));
  }
}
