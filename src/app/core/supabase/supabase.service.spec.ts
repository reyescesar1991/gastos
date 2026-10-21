import { TestBed } from '@angular/core/testing';
import { SupabaseService } from './supabase.service';
import { SUPABASE_CONFIG, SupabaseConfig } from './supabase.config';

/**
 * Pruebas del acceso al cliente de Supabase.
 *
 * La configuración se inyecta por token, así que cada caso fija su propio
 * escenario sin depender de los archivos de entorno.
 */
describe('SupabaseService', () => {
  const validConfig: SupabaseConfig = {
    url: 'https://example.supabase.co',
    anonKey: 'anon-key',
  };

  /** Crea el servicio con la configuración indicada. */
  function setup(config: SupabaseConfig): SupabaseService {
    TestBed.configureTestingModule({
      providers: [{ provide: SUPABASE_CONFIG, useValue: config }],
    });

    return TestBed.inject(SupabaseService);
  }

  it('se declara sin configurar y falla con un mensaje accionable', async () => {
    const service = setup({ url: '', anonKey: '' });

    expect(service.isConfigured).toBe(false);
    await expect(service.client).rejects.toThrow('Supabase no está configurado');
  });

  it('reutiliza el mismo cliente en llamadas repetidas', async () => {
    const service = setup(validConfig);

    expect(service.isConfigured).toBe(true);

    const first = service.client;

    expect(service.client).toBe(first);

    const client = await first;

    expect(typeof client.from).toBe('function');

    await client.auth.stopAutoRefresh();
  });

  it('descarta la promesa fallida para permitir un reintento', async () => {
    const service = setup({ url: '', anonKey: '' });

    await expect(service.client).rejects.toThrow();

    // La próxima llamada vuelve a intentar en vez de devolver el error cacheado.
    await expect(service.client).rejects.toThrow('Supabase no está configurado');
  });
});
