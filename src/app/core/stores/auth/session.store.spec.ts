import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { THEME_STORAGE_KEY } from '../../models/theme/theme.model';
import { SessionStore } from './session.store';

/**
 * Pruebas del tema en la store de sesión.
 *
 * Cubren los tres puntos finos de la persistencia: se guarda al cambiarlo, se
 * restaura en el arranque aunque no haya sesión y sobrevive al cierre de sesión.
 */
describe('SessionStore', () => {
  let store: InstanceType<typeof SessionStore>;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideRouter([{ path: 'auth/login', children: [] }]),
      ],
    }).compileComponents();

    store = TestBed.inject(SessionStore);
  });

  it('arranca siguiendo al sistema y resuelve un tema concreto', () => {
    expect(store.theme()).toBe('system');
    expect(['light', 'dark']).toContain(store.resolvedTheme());
  });

  it('persiste el tema al cambiarlo', () => {
    store.setTheme('dark');

    expect(store.theme()).toBe('dark');
    expect(store.resolvedTheme()).toBe('dark');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
  });

  it('restaura el tema guardado aunque no haya sesión', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');

    store.initSession();

    expect(store.theme()).toBe('dark');
    expect(store.isLoggedIn()).toBe(false);
  });

  it('ignora un tema guardado que no es válido', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'sepia');

    store.initSession();

    expect(store.theme()).toBe('system');
  });

  it('conserva el tema al cerrar sesión', () => {
    store.setTheme('dark');

    store.logout();

    expect(store.theme()).toBe('dark');
    expect(store.token()).toBeNull();
    expect(store.user()).toBeNull();
  });
});
