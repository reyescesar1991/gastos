/**
 * Contrato de la configuración por entorno.
 *
 * Los dos archivos (`environment.ts` y `environment.prod.ts`) implementan esta
 * interfaz para que el reemplazo del build de producción no pueda quedar
 * desincronizado: si un entorno agrega o pierde una clave, no compila.
 */
export interface AppEnvironment {
  /** Indica si el bundle es de producción. */
  readonly production: boolean;

  /** Base de la API para las peticiones relativas. */
  readonly apiUrl: string;

  /**
   * Exige sesión en las vistas internas (layout).
   *
   * En desarrollo queda en `false` para navegar sin login; en producción la
   * ruta del layout monta `authGuard` solo cuando está en `true`.
   */
  readonly requireAuth: boolean;
}
