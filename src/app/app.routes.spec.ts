import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';

/**
 * Pruebas de las rutas reales de la app.
 *
 * Verifican el punto 5 del instructivo: header y menú viven en la ruta padre del
 * layout, así que aparecen en los módulos internos y no en las pantallas de
 * autenticación. También cubren los redireccionamientos base y el comodín.
 */
describe('Rutas de la app', () => {
  let fixture: ComponentFixture<App>;
  let router: Router;

  /** Navega a la url indicada y espera a que el componente raíz repinte. */
  async function navigateTo(url: string): Promise<HTMLElement> {
    await router.navigateByUrl(url);
    fixture.detectChanges();
    await fixture.whenStable();

    return fixture.nativeElement as HTMLElement;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideRouter(routes)],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(App);
  });

  it('monta el layout con header y menú en el dashboard', async () => {
    const compiled = await navigateTo('/dashboard');

    expect(compiled.querySelector('app-header')).not.toBeNull();
    expect(compiled.querySelector('app-nav-menu')).not.toBeNull();
    expect(compiled.querySelector('app-dashboard')).not.toBeNull();
  });

  it('monta la configuración de usuario dentro del layout', async () => {
    const compiled = await navigateTo('/configuracion');

    expect(compiled.querySelector('app-header')).not.toBeNull();
    expect(compiled.querySelector('app-user-settings')).not.toBeNull();
    expect(compiled.querySelector('app-user-settings .theme__option')).not.toBeNull();
  });

  it('monta el registro de movimiento dentro del layout', async () => {
    const compiled = await navigateTo('/movimientos/nuevo');

    expect(compiled.querySelector('app-header')).not.toBeNull();
    expect(compiled.querySelector('app-nav-menu')).not.toBeNull();
    expect(compiled.querySelector('app-add-movement')).not.toBeNull();
  });

  it('redirige la raíz del módulo de movimientos a su registro', async () => {
    await navigateTo('/movimientos');

    expect(router.url).toBe('/movimientos/nuevo');
  });

  it('no monta el layout en las pantallas de autenticación', async () => {
    const compiled = await navigateTo('/auth/login');

    expect(compiled.querySelector('app-login')).not.toBeNull();
    expect(compiled.querySelector('app-header')).toBeNull();
    expect(compiled.querySelector('app-nav-menu')).toBeNull();
  });

  it('redirige la raíz al login', async () => {
    await navigateTo('/');

    expect(router.url).toBe('/auth/login');
  });

  it('redirige una ruta desconocida al dashboard', async () => {
    await navigateTo('/ruta-inexistente');

    expect(router.url).toBe('/dashboard');
  });
});
