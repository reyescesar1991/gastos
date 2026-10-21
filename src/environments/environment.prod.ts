import type { AppEnvironment } from './environment.model';

/**
 * Entorno de producción.
 *
 * Solo entra al bundle con `ng build` (configuración `production`), que
 * reemplaza `environment.ts` por este archivo.
 */
export const environment: AppEnvironment = {
  production: true,

  // TODO: apuntar a la URL real del backend. Hoy la API se resuelve con mocks,
  // así que el valor todavía no se consume.
  apiUrl: 'http://localhost:3000/api',

  // Toda la app interna exige sesión: el layout monta `authGuard`.
  requireAuth: true,

  // Credenciales del proyecto de Supabase de producción.
  supabaseUrl: '',
  supabaseAnonKey: '',

  // Activar cuando Supabase Auth sea la sesión principal y haya que restaurarla
  // antes de la primera pantalla.
  supabaseEagerInit: false,
};
