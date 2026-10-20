import type { AddPaymentMethodForm } from './add-payment-method-form.model';
import type { PaymentMethodRequest } from './add-payment-method-request.model';
import type { PaymentMethodDto } from './payment-method.dto';
import type { PaymentMethodModel } from './payment-method.model';
import type { UpdatePaymentMethodRequest } from './update-payment-method-request.model';

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

  public static toRequest(form: AddPaymentMethodForm): PaymentMethodRequest {
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

  /**
   * Diff de la actualización: el id y solo los campos que cambiaron.
   *
   * Compara contra el método original —no contra el formulario vacío— porque el
   * update es parcial: mandar campos sin cambios sobrescribiría con valores
   * viejos lo que otro proceso pudo haber actualizado mientras tanto.
   *
   * Los opcionales que se vacían viajan como `''` (no como `undefined`): JSON
   * descarta las claves `undefined` y el API nunca se enteraría de que hay que
   * limpiar la descripción o el número de Binance. Los textos se recortan para
   * que el diff no se dispare por un espacio sobrante.
   */
  public static toUpdateRequest(
    original: PaymentMethodModel,
    form: AddPaymentMethodForm,
  ): UpdatePaymentMethodRequest {
    const request: UpdatePaymentMethodRequest = { id: original.id };
    const name = form.name.trim();
    const description = form.description.trim();
    const number = form.number.trim();

    if (name !== original.name) {
      request.name = name;
    }

    if (form.type !== original.type) {
      request.type = form.type;
    }

    if (form.currency !== original.currency) {
      request.currency = form.currency;
    }

    if (description !== (original.description ?? '')) {
      request.description = description;
    }

    if (number !== (original.number ?? '')) {
      request.number = number;
    }

    return request;
  }

  public static toModels(paymentMethodsDto: PaymentMethodDto[]): PaymentMethodModel[] {
    return paymentMethodsDto.map((paymentMethodDto) => this.toModel(paymentMethodDto));
  }
}
