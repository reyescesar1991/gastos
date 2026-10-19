import type { AddPaymentMethodForm } from './add-payment-method-form.model';
import { PaymentMethodMapper } from './payment-method.mapper';

/**
 * Pruebas del mapper de métodos de pago.
 *
 * Cubren las normalizaciones que el schema no hace: `trim()` de los textos y
 * omisión de los campos opcionales vacíos, que el API recibe como ausentes y no
 * como `''`.
 */
describe('PaymentMethodMapper', () => {
  /** Formulario válido de base, para variar un campo por prueba. */
  const form: AddPaymentMethodForm = {
    name: 'Banco principal',
    type: 'account',
    description: 'Cuenta nómina',
    number: '12341234123412341234',
    currency: 'VES',
  };

  it('mapea todos los campos del formulario al request', () => {
    expect(PaymentMethodMapper.toRequest(form)).toEqual({
      name: 'Banco principal',
      type: 'account',
      description: 'Cuenta nómina',
      number: '12341234123412341234',
      currency: 'VES',
    });
  });

  it('mantiene el vocabulario del tipo y la moneda sin traducirlos', () => {
    const request = PaymentMethodMapper.toRequest({ ...form, type: 'binance', currency: 'USDT' });

    expect(request.type).toBe('binance');
    expect(request.currency).toBe('USDT');
  });

  it('limpia los espacios sobrantes de nombre, descripción y número', () => {
    const request = PaymentMethodMapper.toRequest({
      ...form,
      name: '  Banco principal  ',
      description: '  Cuenta nómina  ',
      number: '  12341234123412341234  ',
    });

    expect(request.name).toBe('Banco principal');
    expect(request.description).toBe('Cuenta nómina');
    expect(request.number).toBe('12341234123412341234');
  });

  it('omite descripción y número cuando quedan vacíos', () => {
    const empty = PaymentMethodMapper.toRequest({ ...form, description: '', number: '' });
    const spaces = PaymentMethodMapper.toRequest({
      ...form,
      description: '   ',
      number: '   ',
    });

    expect(empty.description).toBeUndefined();
    expect(empty.number).toBeUndefined();
    expect(spaces.description).toBeUndefined();
    expect(spaces.number).toBeUndefined();
  });

  it('omite la descripción cuando el modelo no la trae', () => {
    const request = PaymentMethodMapper.toRequest({ ...form, description: undefined });

    expect(request.description).toBeUndefined();
  });
});
