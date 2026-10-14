import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { patchState } from '@ngrx/signals';
import { unprotected } from '@ngrx/signals/testing';
import { NavStore } from '../../../../core/stores/navigation/nav.store';
import { NAVIGATION_IDS } from '../../../../shared/components/nav-menu/mocks/navigation-menu.mock';
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

  it('cierra el desplegable con Escape', () => {
    input().dispatchEvent(new Event('focus'));
    fixture.detectChanges();

    input().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(input().getAttribute('aria-expanded')).toBe('false');
  });
});
