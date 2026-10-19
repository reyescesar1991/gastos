import {
  ACCOUNT_NUMBER_LENGTH,
  CARD_NUMBER_LENGTH,
  MAX_DESCRIPTION_LENGTH_PAYMENT_METHOD,
  MAX_NAME_LENGTH_PAYMENT_METHOD,
  MIN_DESCRIPTION_LENGTH_PAYMENT_METHOD,
  MIN_NAME_LENGTH_PAYMENT_METHOD,
  paymentMethodSchema,
} from './payment-methods.schemas';

/**
 * Pruebas del schema de métodos de pago.
 *
 * El caso central es la regla dependiente del tipo: antes una tarjeta con 20
 * dígitos pasaba como cuenta porque el número era un `union`. Además se cubre la
 * descripción vacía, que es el estado inicial del formulario.
 */
describe('paymentMethodSchema', () => {
  /** Formulario válido de base, para romper un campo por prueba. */
  const form = {
    name: 'Banco principal',
    type: 'card',
    description: '',
    number: '1234123412341234',
    currency: 'USD',
  };

  /** Primer mensaje de error del campo indicado. */
  function messageOf(field: keyof typeof form, value: unknown): string | undefined {
    const result = paymentMethodSchema.safeParse({ ...form, [field]: value });

    if (result.success) {
      return undefined;
    }

    return result.error.issues.find((issue) => issue.path[0] === field)?.message;
  }

  it('acepta una tarjeta completa con la descripción vacía', () => {
    expect(paymentMethodSchema.safeParse(form).success).toBe(true);
  });

  it('acepta la descripción omitida', () => {
    expect(paymentMethodSchema.safeParse({ ...form, description: undefined }).success).toBe(true);
  });

  it('exige 16 dígitos exactos en una tarjeta', () => {
    expect(messageOf('number', '1'.repeat(CARD_NUMBER_LENGTH - 1))).toBe(
      `Debe tener ${CARD_NUMBER_LENGTH} dígitos`,
    );
    expect(messageOf('number', '1'.repeat(CARD_NUMBER_LENGTH + 1))).toBe(
      `Debe tener ${CARD_NUMBER_LENGTH} dígitos`,
    );
    expect(messageOf('number', '1'.repeat(ACCOUNT_NUMBER_LENGTH))).toBe(
      `Debe tener ${CARD_NUMBER_LENGTH} dígitos`,
    );
  });

  it('no deja pasar una tarjeta de 20 dígitos como cuenta', () => {
    // Regresión del `z.union([card, account])`: la longitud de la cuenta era válida
    // aunque el tipo declarado fuera `card`.
    for (const type of ['card', 'account']) {
      const result = paymentMethodSchema.safeParse({
        ...form,
        type,
        number: '1'.repeat(type === 'card' ? ACCOUNT_NUMBER_LENGTH : CARD_NUMBER_LENGTH),
      });

      expect(result.success).toBe(false);
    }
  });

  it('exige 20 dígitos exactos en una cuenta', () => {
    const account = { ...form, type: 'account', number: '1'.repeat(ACCOUNT_NUMBER_LENGTH) };
    const short = paymentMethodSchema.safeParse({
      ...account,
      number: '1'.repeat(CARD_NUMBER_LENGTH),
    });

    expect(paymentMethodSchema.safeParse(account).success).toBe(true);
    expect(short.success).toBe(false);
    expect(short.success ? undefined : short.error.issues[0]?.message).toBe(
      `Debe tener ${ACCOUNT_NUMBER_LENGTH} dígitos`,
    );
  });

  it('avisa cuando el número está vacío o trae otros caracteres', () => {
    expect(messageOf('number', '')).toBe('Ingresa el número');
    expect(messageOf('number', '1234abcd1234abcd')).toBe('Debe contener solo números');
  });

  it('deja el número opcional en Binance, pero de 16 dígitos si se completa', () => {
    const binance = { ...form, type: 'binance' };

    expect(paymentMethodSchema.safeParse({ ...binance, number: '' }).success).toBe(true);
    expect(
      paymentMethodSchema.safeParse({ ...binance, number: '1'.repeat(CARD_NUMBER_LENGTH) }).success,
    ).toBe(true);
    expect(
      paymentMethodSchema.safeParse({ ...binance, number: '1'.repeat(CARD_NUMBER_LENGTH - 1) })
        .success,
    ).toBe(false);
    expect(
      paymentMethodSchema.safeParse({ ...binance, number: '1'.repeat(CARD_NUMBER_LENGTH + 1) })
        .success,
    ).toBe(false);
  });

  it('limita el nombre por abajo y por arriba, ignorando espacios', () => {
    expect(messageOf('name', 'a'.repeat(MIN_NAME_LENGTH_PAYMENT_METHOD - 1))).toBe(
      `Mínimo ${MIN_NAME_LENGTH_PAYMENT_METHOD} caracteres`,
    );
    expect(messageOf('name', '   ')).toBe(`Mínimo ${MIN_NAME_LENGTH_PAYMENT_METHOD} caracteres`);
    expect(messageOf('name', 'a'.repeat(MAX_NAME_LENGTH_PAYMENT_METHOD + 1))).toBe(
      `Máximo ${MAX_NAME_LENGTH_PAYMENT_METHOD} caracteres`,
    );
  });

  it('acepta la descripción vacía y exige el mínimo solo si se escribe', () => {
    expect(paymentMethodSchema.safeParse({ ...form, description: '   ' }).success).toBe(true);
    expect(messageOf('description', 'a'.repeat(MIN_DESCRIPTION_LENGTH_PAYMENT_METHOD - 1))).toBe(
      `Mínimo ${MIN_DESCRIPTION_LENGTH_PAYMENT_METHOD} caracteres`,
    );
    expect(messageOf('description', 'a'.repeat(MAX_DESCRIPTION_LENGTH_PAYMENT_METHOD + 1))).toBe(
      `Máximo ${MAX_DESCRIPTION_LENGTH_PAYMENT_METHOD} caracteres`,
    );
  });

  it('rechaza tipos y monedas fuera del vocabulario del dominio', () => {
    expect(paymentMethodSchema.safeParse({ ...form, type: 'cash' }).success).toBe(false);
    expect(paymentMethodSchema.safeParse({ ...form, currency: 'BTC' }).success).toBe(false);
  });
});
