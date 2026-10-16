import {
  CATEGORY_MAX_LENGTH,
  DESCRIPTION_MAX_LENGTH,
  DESCRIPTION_MIN_LENGTH,
  addMovementSchema,
} from './movements.schemas';

/**
 * Pruebas del schema de registro.
 *
 * Además de los límites, cubren los mensajes de los campos vacíos: un `<input>`
 * sin valor entrega `null` al modelo, así que sin mensaje propio Zod reportaría
 * su error por defecto en inglés.
 */
describe('addMovementSchema', () => {

  /** Formulario válido de base, para romper un campo por prueba. */
  const form = {
    amount: 1,
    description: 'Cena',
    type: 'expense',
    category: '',
    currency: 'USD',
    date: new Date(2026, 9, 16),
  };

  /** Primer mensaje de error del campo indicado. */
  function messageOf(field: keyof typeof form, value: unknown): string | undefined {

    const result = addMovementSchema.safeParse({ ...form, [field]: value });

    if (result.success) {
      return undefined;
    }

    return result.error.issues.find((issue) => issue.path[0] === field)?.message;
  }

  it('acepta un movimiento completo', () => {
    expect(addMovementSchema.safeParse(form).success).toBe(true);
  });

  it('acepta la categoría vacía u omitida', () => {
    expect(addMovementSchema.safeParse({ ...form, category: '' }).success).toBe(true);
    expect(addMovementSchema.safeParse({ ...form, category: undefined }).success).toBe(true);
  });

  it('exige descripción con un mensaje en español', () => {
    expect(messageOf('description', '')).toBe(`Mínimo ${DESCRIPTION_MIN_LENGTH} caracteres`);
  });

  it('limita la descripción por arriba', () => {
    expect(messageOf('description', 'a'.repeat(DESCRIPTION_MAX_LENGTH + 1))).toBe(
      `Máximo ${DESCRIPTION_MAX_LENGTH} caracteres`,
    );
  });

  it('avisa cuando el importe está vacío y cuando no supera el mínimo', () => {
    // Un input numérico vacío entrega `null`, no un número.
    expect(messageOf('amount', null)).toBe('Ingresa un importe');
    expect(messageOf('amount', 0)).toBe('El importe debe ser mayor que cero');
  });

  it('avisa cuando la fecha está vacía', () => {
    expect(messageOf('date', null)).toBe('Selecciona una fecha');
  });

  it('limita la categoría por arriba', () => {
    expect(messageOf('category', 'a'.repeat(CATEGORY_MAX_LENGTH + 1))).toBe(
      `Máximo ${CATEGORY_MAX_LENGTH} caracteres`,
    );
  });

  it('rechaza tipos y monedas fuera del vocabulario del dominio', () => {
    expect(addMovementSchema.safeParse({ ...form, type: 'outcome' }).success).toBe(false);
    expect(addMovementSchema.safeParse({ ...form, currency: 'BTC' }).success).toBe(false);
  });
});
