import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  provideRouter,
} from '@angular/router';
import { patchState } from '@ngrx/signals';
import { unprotected } from '@ngrx/signals/testing';
import type { User } from '../models/user/user.model';
import { SessionStore } from '../stores/auth/session.store';
import { authGuard } from './auth.guard';

/**
 * Pruebas del guard de sesión.
 *
 * El guard en sí no conoce el entorno: es la tabla de rutas la que lo monta
 * (o no) según `environment.requireAuth`. Por eso acá se ejercita su decisión
 * con la store de sesión en ambos estados.
 */
describe('authGuard', () => {
  let router: Router;
  let session: InstanceType<typeof SessionStore>;

  const user: User = {
    id: '1',
    email: 'ana@example.com',
    name: 'Ana',
    username: 'ana',
  };

  /** Ejecuta el guard dentro de un contexto de inyección válido. */
  function run(): ReturnType<typeof authGuard> {
    return TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideRouter([])],
    });

    router = TestBed.inject(Router);
    session = TestBed.inject(SessionStore);
  });

  it('deja pasar cuando hay sesión iniciada', () => {
    patchState(unprotected(session), { token: 'token', user });

    expect(run()).toBe(true);
  });

  it('bloquea sin sesión y redirige al login de auth', () => {
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    expect(run()).toBe(false);
    expect(navigate).toHaveBeenCalledWith(['/auth/login']);
  });
});
