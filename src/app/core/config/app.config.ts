import { ApplicationConfig, provideBrowserGlobalErrorListeners, isDevMode, provideZonelessChangeDetection, inject, provideAppInitializer } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { routes } from '../../app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { apiUrlInterceptor } from '../interceptors/api-url.interceptor';
import { SUPABASE_CONFIG } from '../supabase/supabase.config';
import { SupabaseService } from '../supabase/supabase.service';
import { SessionStore } from '../stores/auth/session.store';
import { environment } from '../../../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // Inicializador de la aplicación
    provideAppInitializer(async () => {
      const sessionStore = inject(SessionStore);
      sessionStore.initSession();

      // Con `supabaseEagerInit` el cliente se crea en el arranque; si no, sigue
      // siendo perezoso y se construye en el primer acceso a `SupabaseService`.
      if (!environment.supabaseEagerInit) {
        return;
      }

      const supabase = inject(SupabaseService);

      if (!supabase.isConfigured) {
        return;
      }

      try {
        await supabase.client;
      } catch (error) {
        // La app debe arrancar igual: los mocks siguen disponibles.
        console.error('Supabase no se pudo inicializar', error);
      }
    }),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
    provideZonelessChangeDetection(),
    // Credenciales de Supabase del entorno activo. El cliente en sí se crea
    // perezosamente en `SupabaseService`.
    {
      provide: SUPABASE_CONFIG,
      useValue: {
        url: environment.supabaseUrl,
        anonKey: environment.supabaseAnonKey,
      },
    },
    provideHttpClient(
      withInterceptors([
        apiUrlInterceptor,
      ])
    ),
  ],
};
