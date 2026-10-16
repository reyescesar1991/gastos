import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { patchState } from '@ngrx/signals';
import { unprotected } from '@ngrx/signals/testing';
import { BalanceStore } from '../../core/stores/balance/balance.store';
import { MovementsStore } from '../../core/stores/movements/movements.store';
import { NavStore } from '../../core/stores/navigation/nav.store';
import {
  NAVIGATION_IDS,
  NAVIGATION_MENU_MOCK,
} from '../../shared/components/nav-menu/mocks/navigation-menu.mock';
import { NavigationItem } from '../../shared/models/navigation/navigation-item.model';
import { Dashboard } from './dashboard';

/**
 * Pruebas de la vista de resumen.
 *
 * Cubren los cuatro bloques del instructivo observables desde el DOM: las celdas
 * de balance con su semáforo y su etiqueta de valor nulo, la navegación rápida
 * con sus opciones, la lista de últimos movimientos y el acceso rápido a
 * registrar movimiento.
 */
describe('Dashboard', () => {
  let router: Router;
  let navStore: InstanceType<typeof NavStore>;

  /** Dos opciones de menú habilitadas, para ejercitar la navegación. */
  const enabledItems: NavigationItem[] = [
    {
      id: NAVIGATION_IDS.movementList,
      label: 'Ver movimientos',
      icon: 'list',
      route: '/movimientos',
      enabled: true,
    },
    {
      id: NAVIGATION_IDS.userSettings,
      label: 'Configuración de usuario',
      icon: 'gear',
      route: '/configuracion',
      enabled: true,
    },
  ];

  /**
   * Monta la vista.
   *
   * Con `withData` carga primero las stores y luego anula la recarga del
   * `ngOnInit`, para que la prueba no dependa del temporizador de los mocks.
   */
  async function render(withData: boolean): Promise<ComponentFixture<Dashboard>> {
    const balanceStore = TestBed.inject(BalanceStore);
    const movementsStore = TestBed.inject(MovementsStore);

    if (withData) {
      await Promise.all([balanceStore.getBalance(), movementsStore.getMovements()]);
    }

    vi.spyOn(balanceStore, 'getBalance').mockResolvedValue(undefined);
    vi.spyOn(movementsStore, 'getMovements').mockResolvedValue(undefined);

    const fixture = TestBed.createComponent(Dashboard);
    fixture.detectChanges();
    await fixture.whenStable();

    return fixture;
  }

  /** Texto de la celda de balance indicada. */
  function cellValue(fixture: ComponentFixture<Dashboard>, modifier: string): string {
    const cell = fixture.nativeElement.querySelector(`.summary__cell--${modifier} .summary__value`);

    return (cell as HTMLElement).textContent?.trim() ?? '';
  }

  /** Input de la navegación rápida. */
  function quickNavInput(fixture: ComponentFixture<Dashboard>): HTMLInputElement {
    return fixture.nativeElement.querySelector('#quick-nav-input') as HTMLInputElement;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        provideHttpClient(),
        provideRouter([
          { path: 'dashboard', children: [] },
          { path: 'movimientos', children: [] },
          { path: 'configuracion', children: [] },
        ]),
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    navStore = TestBed.inject(NavStore);
  });

  it('se crea', async () => {
    const fixture = await render(false);

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('pinta el resumen con los valores de la store de balance', async () => {
    const fixture = await render(true);

    expect(cellValue(fixture, 'income')).toMatch(/3[.,]000/);
    expect(cellValue(fixture, 'outcome')).toMatch(/1[.,]500/);
    expect(cellValue(fixture, 'available')).toMatch(/1[.,]200/);
    expect(fixture.nativeElement.querySelectorAll('.summary__cell--empty').length).toBe(0);
  });

  it('usa la etiqueta de valor nulo cuando todavía no hay data', async () => {
    const fixture = await render(false);

    expect(cellValue(fixture, 'income')).toBe('—');
    expect(cellValue(fixture, 'outcome')).toBe('—');
    expect(cellValue(fixture, 'available')).toBe('—');
    expect(fixture.nativeElement.querySelectorAll('.summary__cell--empty').length).toBe(3);
    expect(fixture.nativeElement.querySelector('.summary__empty')).toBeTruthy();
    expect(
      (fixture.nativeElement.querySelector('.movements__status') as HTMLElement).textContent,
    ).toContain('Aún no registras movimientos');
  });

  it('lista los últimos movimientos con sus atributos y el semáforo por tipo', async () => {
    const fixture = await render(true);

    const rows = Array.from(fixture.nativeElement.querySelectorAll('.movement')) as HTMLElement[];

    expect(rows.length).toBe(2);

    // Orden cronológico inverso: primero el movimiento más reciente.
    expect((rows[0].querySelector('.movement__description') as HTMLElement).textContent).toBe(
      'Pago de servicios',
    );
    expect(rows[0].getAttribute('data-type')).toBe('expense');
    expect(rows[0].querySelector('.movement__type')?.textContent).toBe('Egreso');
    expect(rows[0].querySelector('.movement__currency')?.textContent).toBe('USD');
    expect((rows[0].querySelector('.movement__amount') as HTMLElement).textContent).toContain('100');

    // El día debe ser el de la API (5), sin desfase por huso horario: con
    // `new Date('2023-07-05')` en husos negativos se mostraría el día 4.
    const newestDate = (rows[0].querySelector('.movement__date') as HTMLElement).textContent ?? '';

    expect(newestDate).toMatch(/2023/);
    expect(newestDate).toMatch(/(^|\D)0?5(\D|$)/);

    const oldestDate = (rows[1].querySelector('.movement__date') as HTMLElement).textContent ?? '';

    expect(oldestDate).toMatch(/(^|\D)0?1(\D|$)/);

    expect(rows[1].getAttribute('data-type')).toBe('income');
    expect(rows[1].querySelector('.movement__type')?.textContent).toBe('Ingreso');
  });

  it('avisa en la navegación rápida cuando no hay opciones habilitadas', async () => {
    const fixture = await render(true);

    // El mock ya trae habilitada la configuración de usuario, así que acá se
    // desactivan todas para ejercitar el estado vacío.
    patchState(unprotected(navStore), {
      items: NAVIGATION_MENU_MOCK.map((item) => ({ ...item, enabled: false })),
    });
    fixture.detectChanges();

    const input = quickNavInput(fixture);

    input.dispatchEvent(new Event('focus'));
    fixture.detectChanges();

    expect(input.getAttribute('aria-expanded')).toBe('true');
    expect(
      (fixture.nativeElement.querySelector('.quick-nav__empty') as HTMLElement).textContent,
    ).toContain('Aún no hay opciones disponibles');
  });

  it('filtra las opciones y navega a la elegida', async () => {
    const fixture = await render(true);

    patchState(unprotected(navStore), { items: enabledItems });
    fixture.detectChanges();

    const input = quickNavInput(fixture);

    input.dispatchEvent(new Event('focus'));
    input.value = 'mov';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const options = fixture.nativeElement.querySelectorAll('.quick-nav__option');

    expect(options.length).toBe(1);
    expect(options[0].textContent).toContain('Ver movimientos');

    const navigate = vi.spyOn(router, 'navigateByUrl');

    (options[0] as HTMLElement).click();
    fixture.detectChanges();

    expect(navigate).toHaveBeenCalledWith('/movimientos');
    expect(quickNavInput(fixture).getAttribute('aria-expanded')).toBe('false');
  });

  it('selecciona una opción con el teclado', async () => {
    const fixture = await render(true);

    patchState(unprotected(navStore), { items: enabledItems });
    fixture.detectChanges();

    const input = quickNavInput(fixture);
    const navigate = vi.spyOn(router, 'navigateByUrl');

    input.dispatchEvent(new Event('focus'));
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    fixture.detectChanges();

    expect(input.getAttribute('aria-activedescendant')).toBe('quick-nav-option-user-settings');

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    fixture.detectChanges();

    expect(navigate).toHaveBeenCalledWith('/configuracion');
  });

  it('deja el acceso rápido deshabilitado con la etiqueta Próximamente', async () => {
    const fixture = await render(true);

    // El módulo de movimientos ya existe, así que el estado deshabilitado se
    // fuerza acá: es lo que vería la vista mientras el ítem no estuviera activo.
    patchState(unprotected(navStore), {
      items: NAVIGATION_MENU_MOCK.map((item) =>
        item.id === NAVIGATION_IDS.movementAdd ? { ...item, enabled: false } : item,
      ),
    });
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector(
      '.quick-action__button',
    ) as HTMLButtonElement;

    expect(button.disabled).toBe(true);
    expect(
      (fixture.nativeElement.querySelector('.quick-action__state') as HTMLElement).textContent,
    ).toBe('Próximamente');
  });

  it('navega a registrar movimiento con la opción que ya trae el menú', async () => {
    const fixture = await render(true);

    const navigate = vi.spyOn(router, 'navigateByUrl');
    const button = fixture.nativeElement.querySelector(
      '.quick-action__button',
    ) as HTMLButtonElement;

    expect(button.disabled).toBe(false);
    expect(fixture.nativeElement.querySelector('.quick-action__state')).toBeNull();

    button.click();
    fixture.detectChanges();

    expect(navigate).toHaveBeenCalledWith('/movimientos/nuevo');
  });
});
