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
 * estado habilitado de cada vista, el estilo de opción seleccionada y el
 * desplegable de rutas subhijas.
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
      providers: [
        provideRouter([
          { path: 'movimientos', children: [] },
          {
            path: 'metodos-pago',
            children: [
              { path: '', children: [] },
              { path: 'nuevo', children: [] },
            ],
          },
        ]),
      ],
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
      'Métodos de pago',
      'Configuración de usuario',
    ]);
  });

  it('deja todas las opciones habilitadas porque todas tienen vista', () => {
    const disabled = links().filter((link) => link.disabled);

    expect(links().length).toBe(4);
    expect(disabled.length).toBe(0);
    expect(fixture.nativeElement.querySelector('.nav-menu__state')).toBeNull();
  });

  it('navega a la lista y al alta desde las subhijas de métodos de pago', async () => {
    const navigate = vi.spyOn(router, 'navigateByUrl');
    const paymentMethods = links()[2];

    expect(paymentMethods.disabled).toBe(false);
    expect(paymentMethods.getAttribute('aria-disabled')).toBeNull();
    expect(paymentMethods.textContent).toContain('Métodos de pago');
    expect(paymentMethods.getAttribute('aria-expanded')).toBe('false');

    paymentMethods.click();
    await fixture.whenStable();

    expect(paymentMethods.getAttribute('aria-expanded')).toBe('true');

    const children = Array.from(
      fixture.nativeElement.querySelectorAll('.nav-menu__link--child'),
    ) as HTMLButtonElement[];

    expect(children.length).toBe(2);
    expect(children[0].textContent).toContain('Mis métodos de pago');
    expect(children[1].textContent).toContain('Agregar método de pago');

    children[0].click();
    expect(navigate).toHaveBeenCalledWith('/metodos-pago');

    children[1].click();
    expect(navigate).toHaveBeenCalledWith('/metodos-pago/nuevo');
  });

  it('marca el padre y solo la subhija de la ruta actual', async () => {
    await router.navigateByUrl('/metodos-pago/nuevo');
    await fixture.whenStable();

    const paymentMethods = links()[2];

    paymentMethods.click();
    await fixture.whenStable();

    const children = Array.from(
      fixture.nativeElement.querySelectorAll('.nav-menu__link--child'),
    ) as HTMLButtonElement[];

    expect(paymentMethods.classList.contains('nav-menu__link--active')).toBe(true);

    // La subhija del listado comparte prefijo con `/metodos-pago/nuevo`, pero no
    // es la ruta actual: debe quedar sin marcar.
    expect(children[0].textContent).toContain('Mis métodos de pago');
    expect(children[0].classList.contains('nav-menu__link--active')).toBe(false);
    expect(children[0].getAttribute('aria-current')).toBeNull();

    expect(children[1].textContent).toContain('Agregar método de pago');
    expect(children[1].classList.contains('nav-menu__link--active')).toBe(true);
    expect(children[1].getAttribute('aria-current')).toBe('page');
  });

  it('marca la subhija del listado al abrir su ruta exacta', async () => {
    await router.navigateByUrl('/metodos-pago');
    await fixture.whenStable();

    const paymentMethods = links()[2];

    paymentMethods.click();
    await fixture.whenStable();

    const children = Array.from(
      fixture.nativeElement.querySelectorAll('.nav-menu__link--child'),
    ) as HTMLButtonElement[];

    expect(paymentMethods.classList.contains('nav-menu__link--active')).toBe(true);
    expect(children[0].classList.contains('nav-menu__link--active')).toBe(true);
    expect(children[1].classList.contains('nav-menu__link--active')).toBe(false);
    expect(children[1].getAttribute('aria-current')).toBeNull();
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

    const child = fixture.nativeElement.querySelector(
      '.nav-menu__link--child',
    ) as HTMLButtonElement;

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
    const child = fixture.nativeElement.querySelector(
      '.nav-menu__link--child',
    ) as HTMLButtonElement;

    child.click();
    await fixture.whenStable();

    expect(navigate).toHaveBeenCalledWith('/movimientos/ultimos');
  });
});
