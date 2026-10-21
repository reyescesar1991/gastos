import { Injectable, inject } from '@angular/core';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createSupabaseClient } from './supabase.client';
import { SUPABASE_CONFIG } from './supabase.config';

/**
 * Punto único de acceso al cliente de Supabase.
 *
 * El cliente se crea una sola vez y de forma perezosa: ningún componente paga
 * el costo de la librería hasta que realmente lo pide, y el arranque de la app
 * sigue igual mientras todo se resuelve con mocks.
 *
 * Si la creación falla (credenciales vacías o error al cargar el bundle), la
 * promesa se descarta para permitir un reintento en la próxima llamada: el
 * usuario puede completar la configuración y volver a intentar sin recargar.
 */
@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private readonly config = inject(SUPABASE_CONFIG);

  private clientPromise: Promise<SupabaseClient> | null = null;

  /** Indica si el entorno tiene credenciales cargadas. */
  get isConfigured(): boolean {
    return this.config.url.trim() !== '' && this.config.anonKey.trim() !== '';
  }

  /** Cliente listo para usar; se construye la primera vez que se consulta. */
  get client(): Promise<SupabaseClient> {
    this.clientPromise ??= createSupabaseClient(this.config).catch((error: unknown) => {
      this.clientPromise = null;
      throw error;
    });

    return this.clientPromise;
  }
}
