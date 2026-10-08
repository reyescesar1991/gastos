import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Register } from './register';

/**
 * Pruebas de la pantalla de registro.
 *
 * Cubren las reglas observables desde el DOM: botón deshabilitado mientras el
 * formulario es inválido, validación de usuario/contraseña y enlace a login.
 */
describe('Register', () => {
  let fixture: ComponentFixture<Register>;

  /** Escribe un valor en un input y espera a que Signal Forms propague el cambio. */
  async function type(selector: string, value: string): Promise<void> {
    const input = fixture.nativeElement.querySelector(selector) as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
  }

  /** Dispara el blur de un input, que es cuando Signal Forms marca el campo como tocado. */
  async function blur(selector: string): Promise<void> {
    const input = fixture.nativeElement.querySelector(selector) as HTMLInputElement;
    input.dispatchEvent(new Event('blur'));
    await fixture.whenStable();
  }

  function submitButton(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Register);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('deshabilita el botón mientras el formulario sea inválido', () => {
    expect(submitButton().disabled).toBe(true);
  });

  it('habilita el botón cuando los cuatro campos cumplen las reglas', async () => {
    await type('#username', 'ana_torres');
    await type('#email', 'ana.torres@correo.com');
    await type('#password', 'Gastos2026!');
    await type('#confirmPassword', 'Gastos2026!');

    expect(submitButton().disabled).toBe(false);
  });

  it('mantiene el botón deshabilitado si el usuario contiene espacios', async () => {
    await type('#username', 'ana torres');
    await type('#email', 'ana.torres@correo.com');
    await type('#password', 'Gastos2026!');
    await type('#confirmPassword', 'Gastos2026!');

    expect(submitButton().disabled).toBe(true);
  });

  it('mantiene el botón deshabilitado si las contraseñas no coinciden', async () => {
    await type('#username', 'ana_torres');
    await type('#email', 'ana.torres@correo.com');
    await type('#password', 'Gastos2026!');
    await type('#confirmPassword', 'Gastos2026?');

    expect(submitButton().disabled).toBe(true);
  });

  it('muestra el error de coincidencia sobre el campo de confirmación', async () => {
    await type('#password', 'Gastos2026!');
    await type('#confirmPassword', 'Gastos2026?');
    await blur('#confirmPassword');

    const confirmField = fixture.nativeElement
      .querySelector('#confirmPassword')
      .closest('.field') as HTMLElement;
    const messages = Array.from(confirmField.querySelectorAll('.field__errors li')).map((li) =>
      li.textContent?.trim(),
    );

    expect(messages).toEqual(['Las contraseñas no coinciden']);
    expect(confirmField.querySelector('#confirmPassword')?.classList).toContain(
      'field__input--invalid',
    );
  });

  it('enlaza de vuelta al inicio de sesión', () => {
    const loginLink = fixture.nativeElement.querySelector(
      'a[href="/auth/login"]',
    ) as HTMLAnchorElement | null;

    expect(loginLink).not.toBeNull();
  });
});
