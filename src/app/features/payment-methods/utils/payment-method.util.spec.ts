import { maskPaymentMethodNumber, sanitizePaymentMethodNumber } from './payment-method.util';

/**
 * Pruebas de las utilidades de presentación y saneo del número.
 *
 * La máscara es lo que ve el usuario en la lista y en la confirmación; el saneo
 * es el respaldo del tope por tipo cuando el valor ya llegó al input (pegado,
 * autocompletado o cambio de tipo).
 */
describe('payment method utils', () => {
  describe('maskPaymentMethodNumber', () => {
    it('deja visibles solo los últimos cuatro dígitos', () => {
      expect(maskPaymentMethodNumber('1234123412341234')).toBe('•••• 1234');
      expect(maskPaymentMethodNumber('12341234123412341234')).toBe('•••• 1234');
    });

    it('ignora los espacios del valor', () => {
      expect(maskPaymentMethodNumber(' 1234123412341234 ')).toBe('•••• 1234');
    });

    it('usa un texto por defecto cuando no hay número', () => {
      expect(maskPaymentMethodNumber('')).toBe('Sin número');
      expect(maskPaymentMethodNumber('   ')).toBe('Sin número');
      expect(maskPaymentMethodNumber(undefined)).toBe('Sin número');
    });
  });

  describe('sanitizePaymentMethodNumber', () => {
    it('descarta todo lo que no sea dígito', () => {
      expect(sanitizePaymentMethodNumber('12ab34-56', 'card')).toBe('123456');
    });

    it('recorta al tope de la tarjeta y de Binance', () => {
      expect(sanitizePaymentMethodNumber('1'.repeat(20), 'card')).toBe('1'.repeat(16));
      expect(sanitizePaymentMethodNumber('1'.repeat(20), 'binance')).toBe('1'.repeat(16));
    });

    it('recorta al tope de la cuenta bancaria', () => {
      expect(sanitizePaymentMethodNumber('1'.repeat(21), 'account')).toBe('1'.repeat(20));
    });

    it('deja intacto un valor dentro del tope', () => {
      expect(sanitizePaymentMethodNumber('1234', 'account')).toBe('1234');
    });
  });
});
