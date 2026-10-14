import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { patchState } from '@ngrx/signals';
import { unprotected } from '@ngrx/signals/testing';
import { ToastService } from '../../../core/services/toast-service';
import { SessionStore } from '../../../core/stores/auth/session.store';
import { NavStore } from '../../../core/stores/navigation/nav.store';
import { NAVIGATION_IDS } from '../nav-menu/mocks/navigation-menu.mock';
import { AppHeader } from './app-header';

/**
 * Pruebas del header.
 *
 * Cubren los tres elementos pedidos (nombre, avatar y cierre de sesión) más el
 * comportamiento de la hamburguesa y el destino del avatar: navega a la
 * configuración de usuario cuando la opción está habilitada y avisa con un toast
 * cuando todavía no lo está.
 */
describe('AppHeader', () => {
  let fixture: ComponentFixture<AppHeader>;
  let sessionStore: InstanceType<typeof SessionStore>;
  let navStore: InstanceType<typeof NavStore>;
  let router: Router;

  /** Texto del nombre mostrado en el header. */
  function name(): string {
    const element = fixture.nativeElement.querySelector('.app-header__name') as HTMLElement;

    return element.textContent?.trim() ?? '';
  }

  /** Botón de identidad (avatar + nombre). */
  function identity(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('.app-header__identity') as HTMLButtonElement;
  }

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [AppHeader],
      providers: [provideRouter([{ path: 'configuracion', children: [] }])],
    }).compileComponents();

    sessionStore = TestBed.inject(SessionStore);
    navStore = TestBed.inject(NavStore);
    router = TestBed.inject(Router);

    patchState(unprotected(sessionStore), {
      token: 'token-de-prueba',
      user: {
        id: '1',
        email: 'ana.torres@correo.com',
        name: 'Ana Torres',
        username: 'ana.torres',
      },
    });

    fixture = TestBed.createComponent(AppHeader);
    await fixture.whenStable();
  });

  it('muestra el nombre del usuario y sus iniciales cuando no hay avatar', () => {
    const initials = fixture.nativeElement.querySelector('.app-header__avatar-initials');

    expect(name()).toBe('Ana Torres');
    expect(initials.textContent.trim()).toBe('AT');
  });

  it('cae en las iniciales si la imagen del avatar no carga', async () => {
    patchState(unprotected(sessionStore), {
      user: {
        id: '1',
        email: 'ana.torres@correo.com',
        name: 'Ana Torres',
        username: 'ana.torres',
        avatarUrl: 'https://ejemplo.invalido/avatar.png',
      },
    });
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.app-header__avatar-image')).toBeTruthy();

    const image = fixture.nativeElement.querySelector(
      '.app-header__avatar-image',
    ) as HTMLImageElement;
    image.dispatchEvent(new Event('error'));
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.app-header__avatar-initials')).toBeTruthy();
  });

  it('alterna el panel del menú con la hamburguesa', async () => {
    const menuButton = fixture.nativeElement.querySelector('.app-header__menu') as HTMLButtonElement;

    expect(menuButton.getAttribute('aria-expanded')).toBe('false');

    menuButton.click();
    await fixture.whenStable();

    expect(navStore.isMenuOpen()).toBe(true);
    expect(menuButton.getAttribute('aria-expanded')).toBe('true');
  });

  it('navega a la configuración de usuario, que ya está habilitada', async () => {
    const navigate = vi.spyOn(router, 'navigateByUrl');

    identity().click();
    await fixture.whenStable();

    expect(navigate).toHaveBeenCalledWith('/configuracion');
  });

  it('avisa por toast cuando la configuración de usuario no está disponible', async () => {
    patchState(unprotected(navStore), {
      items: [
        {
          id: NAVIGATION_IDS.userSettings,
          label: 'Configuración de usuario',
          icon: 'gear',
          route: '/configuracion',
          enabled: false,
        },
      ],
    });
    await fixture.whenStable();

    const toastService = TestBed.inject(ToastService);
    const info = vi.spyOn(toastService, 'info');
    const navigate = vi.spyOn(router, 'navigateByUrl');

    identity().click();
    await fixture.whenStable();

    expect(info).toHaveBeenCalledWith('Aún no disponible: Configuración de usuario', {
      duration: 4000,
    });
    expect(navigate).not.toHaveBeenCalled();
  });

  it('cierra la sesión y vuelve al login', async () => {
    const navigate = vi.spyOn(router, 'navigate');
    const logout = fixture.nativeElement.querySelector('.app-header__logout') as HTMLButtonElement;

    logout.click();
    await fixture.whenStable();

    expect(sessionStore.token()).toBeNull();
    expect(sessionStore.user()).toBeNull();
    expect(navigate).toHaveBeenCalledWith(['/auth/login']);
  });
});
