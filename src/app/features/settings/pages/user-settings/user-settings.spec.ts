import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { patchState } from '@ngrx/signals';
import { unprotected } from '@ngrx/signals/testing';
import { THEME_STORAGE_KEY } from '../../../../core/models/theme/theme.model';
import { SessionStore } from '../../../../core/stores/auth/session.store';
import { UserSettings } from './user-settings';

/** Pruebas del selector de tema de la configuración de usuario. */
describe('UserSettings', () => {
  let fixture: ComponentFixture<UserSettings>;
  let store: InstanceType<typeof SessionStore>;

  /** Botones de las opciones de tema, en el orden de la vista. */
  function options(): HTMLButtonElement[] {
    return Array.from(
      fixture.nativeElement.querySelectorAll('.theme__option'),
    ) as HTMLButtonElement[];
  }

  /** Texto de la nota que indica el tema aplicado. */
  function note(): string {
    const element = fixture.nativeElement.querySelector('.theme__note') as HTMLElement;

    return element.textContent?.trim() ?? '';
  }

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [UserSettings],
      providers: [provideHttpClient(), provideRouter([])],
    }).compileComponents();

    store = TestBed.inject(SessionStore);

    fixture = TestBed.createComponent(UserSettings);
    fixture.detectChanges();
  });

  it('lista los tres temas y marca el elegido', () => {
    const labels = Array.from(fixture.nativeElement.querySelectorAll('.theme__label')).map(
      (element) => (element as HTMLElement).textContent?.trim(),
    );

    expect(labels).toEqual(['Claro', 'Oscuro', 'Sistema']);

    const selected = options().filter((option) => option.getAttribute('aria-checked') === 'true');

    expect(selected.length).toBe(1);
    expect(selected[0].textContent).toContain('Sistema');
    expect(note()).toContain('Siguiendo al sistema');
  });

  it('aplica y persiste el tema elegido', () => {
    options()[1].click();
    fixture.detectChanges();

    expect(store.theme()).toBe('dark');
    expect(store.resolvedTheme()).toBe('dark');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    expect(options()[1].getAttribute('aria-checked')).toBe('true');
    expect(options()[0].getAttribute('aria-checked')).toBe('false');
    expect(note()).toContain('Tema aplicado: oscuro');
  });

  it('muestra los datos del usuario en sesión', () => {
    patchState(unprotected(store), {
      user: {
        id: '1',
        email: 'ana.torres@correo.com',
        name: 'Ana Torres',
        username: 'ana.torres',
      },
    });
    fixture.detectChanges();

    const values = Array.from(fixture.nativeElement.querySelectorAll('.account__value')).map(
      (element) => (element as HTMLElement).textContent?.trim(),
    );

    expect(values).toEqual(['Ana Torres', 'ana.torres@correo.com', 'ana.torres']);
  });
});
