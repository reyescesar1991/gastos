/**
 * Formato y conversión de importes y fechas.
 *
 * Vive en `shared` porque lo comparten el resumen de balance, la lista de
 * movimientos y el registro de movimientos, y porque así se puede probar sin
 * montar una vista. Los formateadores se crean una sola vez por moneda y por eso
 * están memoizados a nivel de módulo.
 *
 * `toIsoDate` y `toLocalDate` son las dos direcciones de la misma conversión:
 * el día de la API (`YYYY-MM-DD`) y el día local del usuario.
 */

/** Formateadores de moneda, memoizados por código ISO de moneda. */
const currencyFormatters = new Map<string, Intl.NumberFormat>();

/** Formateador de fechas en español. */
const dateFormatter = new Intl.DateTimeFormat('es-CO', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

/**
 * Formatea un importe en la moneda indicada.
 *
 * @param amount Importe numérico.
 * @param currency Código ISO de la moneda (por ejemplo `USD`).
 */
export function formatAmount(amount: number, currency: string): string {

  let formatter = currencyFormatters.get(currency);

  if (formatter === undefined) {
    formatter = new Intl.NumberFormat('es-CO', { style: 'currency', currency });
    currencyFormatters.set(currency, formatter);
  }

  return formatter.format(amount);
}

/**
 * Formatea una fecha ISO (`YYYY-MM-DD`).
 *
 * Si la fecha no es interpretable devuelve el valor original para no ocultar el
 * dato.
 *
 * @param date Fecha tal como llega de la API.
 */
export function formatDate(date: string): string {

  const parsed = toLocalDate(date);

  return parsed === null ? date : dateFormatter.format(parsed);
}

/**
 * Convierte una fecha local en el día ISO (`YYYY-MM-DD`) que espera la API.
 *
 * Se construye con los componentes locales (`getFullYear`, `getMonth`,
 * `getDate`) y **no** con `toISOString()`: eso último convierte a UTC y en husos
 * negativos (por ejemplo America/Caracas) registraría el día anterior. Es la
 * operación inversa de `toLocalDate`.
 *
 * @param date Fecha elegida por el usuario.
 */
export function toIsoDate(date: Date): string {

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Convierte una fecha de la API en una fecha local.
 *
 * Las fechas `YYYY-MM-DD` son días sin hora: `new Date('2023-07-05')` las
 * interpreta como medianoche UTC y en husos negativos (por ejemplo
 * America/Caracas) terminan mostrando el día anterior. Por eso se construyen
 * con sus componentes en hora local. Cualquier otro formato cae al parseo
 * estándar.
 *
 * @param date Valor de fecha recibido.
 * @returns La fecha local, o `null` si no se puede interpretar.
 */
function toLocalDate(date: string): Date | null {

  const isoDate = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);

  if (isoDate !== null) {
    const [, year, month, day] = isoDate;

    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  const parsed = new Date(date);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}
