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

  /**
   * URL del proyecto de Supabase (Project URL).
   *
   * Vacía mientras no haya proyecto: el cliente no se crea y la app sigue
   * funcionando con los mocks.
   */
  readonly supabaseUrl: string;

  /**
   * Anon key del proyecto.
   *
   * Es pública por diseño (va en el bundle); la seguridad real la dan las
   * políticas RLS de la base.
   */
  readonly supabaseAnonKey: string;

  /**
   * Crea el cliente de Supabase durante el arranque en vez de esperar al primer
   * uso.
   *
   * En `false` el cliente sigue siendo perezoso. Se activa cuando Supabase Auth
   * pase a ser la sesión principal y haga falta restaurarla antes de la primera
   * pantalla.
   */
  readonly supabaseEagerInit: boolean;
}
