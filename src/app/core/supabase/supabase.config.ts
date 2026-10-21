import { InjectionToken } from '@angular/core';

/**
 * Credenciales del proyecto de Supabase.
 *
 * Viajan por un token y no por el `environment` directo: así el servicio se
 * puede probar con cualquier configuración sin tocar los archivos de entorno, y
 * cuando se conecten varios backends el proveedor se cambia en `app.config.ts`.
 */
export interface SupabaseConfig {
  /** Project URL del panel de Supabase. */
  readonly url: string;

  /** Anon key pública del proyecto. */
  readonly anonKey: string;
}

/** Token con la configuración de Supabase del entorno activo. */
export const SUPABASE_CONFIG = new InjectionToken<SupabaseConfig>('SUPABASE_CONFIG');
