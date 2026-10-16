import type { AddMovementForm } from './add-movement-form.model';
import { AddMovementMapper } from './add-movement.mapper';

/**
 * Pruebas del mapper de registro.
 *
 * Cubren las tres normalizaciones que el schema no hace: `trim()` de los textos,
 * omisión de la categoría vacía y conversión de `Date` al día ISO sin desfase de
 * huso horario.
 */
describe('AddMovementMapper', () => {

  /** Formulario válido de base, para variar un campo por prueba. */
  const form: AddMovementForm = {
    amount: 125.5,
    description: 'Cena con el equipo',
    date: new Date(2026, 9, 16),
    type: 'expense',
    category: 'Comidas',
    currency: 'USD',
  };

  it('mapea todos los campos del formulario al request', () => {
    expect(AddMovementMapper.toRequest(form)).toEqual({
      amount: 125.5,
      description: 'Cena con el equipo',
      date: '2026-10-16',
      type: 'expense',
      category: 'Comidas',
      currency: 'USD',
    });
  });

  it('mantiene el vocabulario del tipo sin traducirlo', () => {
    expect(AddMovementMapper.toRequest({ ...form, type: 'income' }).type).toBe('income');
    expect(AddMovementMapper.toRequest({ ...form, type: 'expense' }).type).toBe('expense');
  });

  it('limpia los espacios sobrantes de descripción y categoría', () => {
    const request = AddMovementMapper.toRequest({
      ...form,
      description: '  Cena con el equipo  ',
      category: '  Comidas  ',
    });

    expect(request.description).toBe('Cena con el equipo');
    expect(request.category).toBe('Comidas');
  });

  it('omite la categoría cuando queda vacía', () => {
    expect(AddMovementMapper.toRequest({ ...form, category: '' }).category).toBeUndefined();
    expect(AddMovementMapper.toRequest({ ...form, category: '   ' }).category).toBeUndefined();
  });

  it('convierte la fecha al día local, sin desfase por huso horario', () => {
    // Con `toISOString()` una fecha tardía saltaría de día según el huso.
    const late = AddMovementMapper.toRequest({
      ...form,
      date: new Date(2026, 9, 16, 23, 45),
    });
    const early = AddMovementMapper.toRequest({
      ...form,
      date: new Date(2026, 9, 16, 0, 15),
    });

    expect(late.date).toBe('2026-10-16');
    expect(early.date).toBe('2026-10-16');
  });
});
