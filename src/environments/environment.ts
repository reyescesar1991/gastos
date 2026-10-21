import type { AppEnvironment } from './environment.model';

/**
 * Entorno de desarrollo.
 *
 * Es el archivo por defecto: lo usan `ng serve` y los tests. El build de
 * producción lo reemplaza por `environment.prod.ts` (`fileReplacements` en
 * `angular.json`), así que este archivo nunca llega a un bundle productivo.
 */
export const environment: AppEnvironment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  requireAuth: false,
};
