import { Signal, signal } from '@angular/core';

/** Media query del esquema oscuro del sistema operativo. */
export const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)';

/**
 * Convierte una media query en una señal de solo lectura.
 *
 * Una media query no es un signal: si se consulta al vuelo no se vuelve a
 * evaluar cuando el usuario cambia el tema del sistema. Esta utilidad se
 * suscribe al evento `change` y refleja el resultado en una señal, de modo que
 * cualquier `computed` que la lea se recalcule solo.
 *
 * Si el entorno no expone `matchMedia` —prerender/SSR o un DOM sin esa API—
 * devuelve una señal que nunca coincide, para que quien la consuma pueda
 * resolver igual su valor por defecto.
 *
 * @param query Media query a observar (por ejemplo `(prefers-color-scheme: dark)`).
 */
export function mediaQuerySignal(query: string): Signal<boolean> {

  const mediaQuery = typeof window === 'undefined' || typeof window.matchMedia !== 'function'
    ? null
    : window.matchMedia(query);

  const matches = signal(mediaQuery?.matches ?? false);

  mediaQuery?.addEventListener('change', (event) => matches.set(event.matches));

  return matches.asReadonly();
}

/**
 * Indica si el sistema operativo pide esquema oscuro.
 *
 * Se crea una sola vez por carga de la app y se mantiene viva mientras dure la
 * sesión: hay un único listener sobre el sistema.
 */
export const prefersDarkScheme = mediaQuerySignal(DARK_SCHEME_QUERY);
