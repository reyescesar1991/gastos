import type { SupabaseClient } from '@supabase/supabase-js';
import type { SupabaseConfig } from './supabase.config';

/**
 * Crea el cliente de Supabase para la configuración recibida.
 *
 * El import es dinámico a propósito: `@supabase/supabase-js` es pesado y no
 * debe entrar al bundle inicial mientras la app sigue funcionando con mocks.
 * El cliente se descarga la primera vez que algo lo pide, no al arrancar.
 *
 * Mientras falten la URL o la anon key, falla con un mensaje accionable en vez
 * de dejar que `createClient` explote con un error genérico de la librería.
 */
export async function createSupabaseClient(config: SupabaseConfig): Promise<SupabaseClient> {
  const url = config.url.trim();
  const anonKey = config.anonKey.trim();

  if (url === '' || anonKey === '') {
    throw new Error(
      'Supabase no está configurado: completá supabaseUrl y supabaseAnonKey en src/environments/environment*.ts',
    );
  }

  const { createClient } = await import('@supabase/supabase-js');

  return createClient(url, anonKey, {
    auth: {
      // La sesión de Supabase se persiste y se refresca sola; el token sigue
      // viviendo en el navegador, igual que el de la store de sesión actual.
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}
