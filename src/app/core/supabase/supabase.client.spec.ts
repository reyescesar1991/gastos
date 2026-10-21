import { createSupabaseClient } from './supabase.client';

/**
 * Pruebas de la fábrica del cliente.
 *
 * Verifican la validación de credenciales y que con datos válidos se obtenga un
 * cliente real de la librería (sin red: solo se construye la instancia).
 */
describe('createSupabaseClient', () => {
  const config = {
    url: 'https://example.supabase.co',
    anonKey: 'anon-key',
  };

  it('rechaza la creación sin URL', async () => {
    await expect(createSupabaseClient({ ...config, url: '   ' })).rejects.toThrow(
      'Supabase no está configurado',
    );
  });

  it('rechaza la creación sin anon key', async () => {
    await expect(createSupabaseClient({ ...config, anonKey: '' })).rejects.toThrow(
      'Supabase no está configurado',
    );
  });

  it('crea el cliente con una configuración válida', async () => {
    const client = await createSupabaseClient(config);

    expect(typeof client.from).toBe('function');
    expect(client.auth).toBeDefined();

    // Sin esto, el refresco automático deja un temporizador vivo en la prueba.
    await client.auth.stopAutoRefresh();
  });
});
