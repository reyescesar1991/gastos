import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { patchState } from '@ngrx/signals';
import { unprotected } from '@ngrx/signals/testing';
import { NavStore } from '../../../../core/stores/navigation/nav.store';
import {
  NAVIGATION_IDS,
  NAVIGATION_MENU_MOCK,
} from '../../../../shared/components/nav-menu/mocks/navigation-menu.mock';
import { NavigationItem } from '../../../../shared/models/navigation/navigation-item.model';
import { QuickNav } from './quick-nav';

/** Pruebas del combobox de navegación rápida y sus estados del desplegable. */
describe('QuickNav', () => {
  let fixture: ComponentFixture<QuickNav>;
  let navStore: InstanceType<typeof NavStore>;
  let router: Router;

  const enabledItem: NavigationItem = {
    id: NAVIGATION_IDS.movementList,
    label: 'Ver movimientos',
    icon: 'list',
    route: '/movimientos',
    enabled: true,
  };

  /** Input del combobox. */
  function input(): HTMLInputElement {
    return fixture.nativeElement.querySelector('#quick-nav-input') as HTMLInputElement;
  }

  /** Texto del estado vacío del desplegable. */
  function emptyMessage(): string {
    const empty = fixture.nativeElement.querySelector('.quick-nav__empty') as HTMLElement;

    return empty.textContent?.trim() ?? '';
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuickNav],
      providers: [provideRouter([{ path: 'movimientos', children: [] }])],
    }).compileComponents();

    navStore = TestBed.inject(NavStore);
    router = TestBed.inject(Router);

    fixture = TestBed.createComponent(QuickNav);
    fixture.detectChanges();
  });

  it('avisa que no hay opciones mientras el menú no tenga ninguna habilitada', () => {
    // El mock ya trae habilitada la configuración de usuario, así que acá se
    // desactivan todas para ejercitar el estado vacío.
    patchState(unprotected(navStore), {
      items: NAVIGATION_MENU_MOCK.map((item) => ({ ...item, enabled: false })),
    });
    fixture.detectChanges();

    input().dispatchEvent(new Event('focus'));
    fixture.detectChanges();

    expect(input().getAttribute('aria-expanded')).toBe('true');
    expect(emptyMessage()).toContain('Aún no hay opciones disponibles');
    expect(fixture.nativeElement.querySelectorAll('.quick-nav__option').length).toBe(0);
  });

  it('avisa cuando el texto no coincide con ninguna opción', () => {
    patchState(unprotected(navStore), { items: [enabledItem] });
    fixture.detectChanges();

    input().dispatchEvent(new Event('focus'));
    input().value = 'zapato';
    input().dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(emptyMessage()).toContain('Sin coincidencias');
  });

  it('navega a la opción elegida y cierra el desplegable', () => {
    patchState(unprotected(navStore), { items: [enabledItem] });
    fixture.detectChanges();

    const navigate = vi.spyOn(router, 'navigateByUrl');

    input().dispatchEvent(new Event('focus'));
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('.quick-nav__option') as HTMLElement).click();
    fixture.detectChanges();

    expect(navigate).toHaveBeenCalledWith('/movimientos');
    expect(input().getAttribute('aria-expanded')).toBe('false');
    expect(input().value).toBe('');
  });

  it('ofrece las opciones habilitadas del mock y navega a la elegida', () => {
    // El mock trae habilitadas "Agregar movimiento" y "Configuración de usuario".
    const navigate = vi.spyOn(router, 'navigateByUrl');

    input().dispatchEvent(new Event('focus'));
    fixture.detectChanges();

    const options = fixture.nativeElement.querySelectorAll('.quick-nav__option');

    expect(options.length).toBe(2);
    expect(options[0].textContent).toContain('Agregar movimiento');
    expect(options[1].textContent).toContain('Configuración de usuario');

    (options[1] as HTMLElement).click();
    fixture.detectChanges();

    expect(navigate).toHaveBeenCalledWith('/configuracion');
  });

  it('cierra el desplegable con Escape', () => {
    input().dispatchEvent(new Event('focus'));
    fixture.detectChanges();

    input().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(input().getAttribute('aria-expanded')).toBe('false');
  });
});
