import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { patchState } from '@ngrx/signals';
import { unprotected } from '@ngrx/signals/testing';
import { NavStore } from '../../../core/stores/navigation/nav.store';
import { NavigationItem } from '../../models/navigation/navigation-item.model';
import { NavMenu } from './nav-menu';

/**
 * Pruebas del menú de navegación.
 *
 * Cubren el instructivo observable desde el DOM: las cuatro opciones dummy, el
 * estado desactivado mientras no existan sus vistas, el estilo de opción
 * seleccionada y el desplegable de rutas subhijas.
 */
describe('NavMenu', () => {
  let fixture: ComponentFixture<NavMenu>;
  let store: InstanceType<typeof NavStore>;
  let router: Router;

  const enabledItemWithChild: NavigationItem = {
    id: 'movement-list',
    label: 'Ver movimientos',
    icon: 'list',
    route: '/movimientos',
    enabled: true,
    children: [
      {
        id: 'movement-latest',
        label: 'Últimos movimientos',
        icon: 'list',
        route: '/movimientos/ultimos',
        enabled: true,
      },
    ],
  };

  function links(): HTMLButtonElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.nav-menu__link'));
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavMenu],
      providers: [provideRouter([{ path: 'movimientos', children: [] }])],
    }).compileComponents();

    store = TestBed.inject(NavStore);
    router = TestBed.inject(Router);

    fixture = TestBed.createComponent(NavMenu);
    await fixture.whenStable();
  });

  it('lista las cuatro opciones del menú con su etiqueta', () => {
    const labels = Array.from(fixture.nativeElement.querySelectorAll('.nav-menu__label')).map(
      (element) => (element as HTMLElement).textContent?.trim(),
    );

    expect(labels).toEqual([
      'Agregar movimiento',
      'Ver movimientos',
      'Agregar método de pago',
      'Configuración de usuario',
    ]);
  });

  it('deja deshabilitadas las opciones que todavía no tienen vista', () => {
    const disabled = links().filter((link) => link.disabled);

    expect(links().length).toBe(4);
    expect(disabled.length).toBe(3);
    expect(disabled.every((link) => link.getAttribute('aria-disabled') === 'true')).toBe(true);
    expect(fixture.nativeElement.querySelectorAll('.nav-menu__state').length).toBe(3);
  });

  it('navega a la opción habilitada sin marca de inactividad', () => {
    const navigate = vi.spyOn(router, 'navigateByUrl');
    const settings = links()[3];

    expect(settings.disabled).toBe(false);
    expect(settings.getAttribute('aria-disabled')).toBeNull();
    expect(settings.textContent).toContain('Configuración de usuario');

    settings.click();

    expect(navigate).toHaveBeenCalledWith('/configuracion');
  });

  it('oculta el panel y lo despliega cuando el store abre el menú', async () => {
    const panel = fixture.nativeElement.querySelector('.nav-menu') as HTMLElement;

    expect(panel.classList.contains('nav-menu--open')).toBe(false);

    patchState(unprotected(store), { isMenuOpen: true });
    await fixture.whenStable();

    expect(panel.classList.contains('nav-menu--open')).toBe(true);
  });

  it('marca la opción activa y despliega sus subhijas al pulsarla', async () => {
    patchState(unprotected(store), { items: [enabledItemWithChild] });
    await router.navigateByUrl('/movimientos');
    await fixture.whenStable();

    const [link] = links();

    expect(link.disabled).toBe(false);
    expect(link.getAttribute('aria-disabled')).toBeNull();
    expect(link.getAttribute('aria-current')).toBe('page');
    expect(link.classList.contains('nav-menu__link--active')).toBe(true);

    link.click();
    await fixture.whenStable();

    const child = fixture.nativeElement.querySelector('.nav-menu__link--child') as HTMLButtonElement;

    expect(link.getAttribute('aria-expanded')).toBe('true');
    expect(child).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.nav-menu__label + .nav-menu__state')).toBeNull();
  });

  it('navega a la ruta subhija cuando está habilitada', async () => {
    patchState(unprotected(store), { items: [enabledItemWithChild] });
    await fixture.whenStable();

    links()[0].click();
    await fixture.whenStable();

    const navigate = vi.spyOn(router, 'navigateByUrl');
    const child = fixture.nativeElement.querySelector('.nav-menu__link--child') as HTMLButtonElement;

    child.click();
    await fixture.whenStable();

    expect(navigate).toHaveBeenCalledWith('/movimientos/ultimos');
  });
});
