import { ApplicationConfig, provideBrowserGlobalErrorListeners, isDevMode, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { routes } from '../../app.routes';
import { FetchBackend, provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { apiUrlInterceptor } from '../interceptors/api-url.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
    provideZonelessChangeDetection(),
    provideHttpClient(
      withInterceptors([
        apiUrlInterceptor,
      ])
    ),
  ],
};
