import { formatAmount, formatDate, toIsoDate } from './format.util';

/**
 * Pruebas de la utilidad de formato.
 *
 * Las de fechas cubren las dos direcciones de la conversión y la regresión que
 * apareció en el navegador: las fechas ISO sin hora se interpretaban como
 * medianoche UTC y en husos negativos (por ejemplo America/Caracas) mostraban el
 * día anterior. Al registrar pasa lo mismo al revés: `toISOString()` convertiría
 * el día local a UTC y guardaría el día anterior.
 */
describe('formatAmount', () => {
  it('formatea en es-CO con la moneda indicada', () => {
    expect(formatAmount(3000, 'USD')).toMatch(/^US\$\s?3[.,]000,00$/);
    expect(formatAmount(1500.5, 'USD')).toMatch(/1[.,]500,50$/);
  });

  it('respeta monedas distintas de USD', () => {
    expect(formatAmount(1500, 'COP')).toContain('1.500');
  });
});

describe('formatDate', () => {
  it('no desfasa el día de una fecha ISO', () => {
    // Con `new Date('2023-07-05')` en un huso negativo saldría el día 4.
    expect(formatDate('2023-07-05')).toMatch(/(^|\D)0?5(\D|$)/);
  });

  it('mantiene día, mes y año de una fecha ISO', () => {
    const firstOfJanuary = formatDate('2023-01-01');

    expect(firstOfJanuary).toMatch(/(^|\D)0?1(\D|$)/);
    expect(firstOfJanuary).toMatch(/2023/);
    expect(firstOfJanuary.toLowerCase()).toContain('ene');
  });

  it('devuelve el valor original cuando la fecha no es interpretable', () => {
    expect(formatDate('sin-fecha')).toBe('sin-fecha');
  });
});

describe('toIsoDate', () => {
  it('devuelve el día en formato YYYY-MM-DD', () => {
    expect(toIsoDate(new Date(2023, 6, 5))).toBe('2023-07-05');
  });

  it('rellena mes y día con cero a la izquierda', () => {
    expect(toIsoDate(new Date(2023, 0, 1))).toBe('2023-01-01');
  });

  it('no desfasa el día cuando la hora local es tardía', () => {
    // Con `toISOString()` esta fecha saltaría al día siguiente en husos
    // positivos y al anterior en negativos, según la hora del día.
    expect(toIsoDate(new Date(2023, 6, 5, 23, 45))).toBe('2023-07-05');
    expect(toIsoDate(new Date(2023, 6, 5, 0, 15))).toBe('2023-07-05');
  });

  it('es la operación inversa de formatDate', () => {
    const original = new Date(2023, 0, 1);
    const formatted = formatDate(toIsoDate(original));

    expect(formatted).toMatch(/(^|\D)0?1(\D|$)/);
    expect(formatted).toMatch(/2023/);
  });
});
