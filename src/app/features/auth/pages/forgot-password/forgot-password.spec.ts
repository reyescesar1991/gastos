import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ForgotPassword } from './forgot-password';

/**
 * Pruebas de la pantalla de recuperación de contraseña.
 *
 * Cubren las reglas observables desde el DOM: botón deshabilitado mientras el
 * correo no tenga formato válido y enlace de vuelta al inicio de sesión.
 */
describe('ForgotPassword', () => {
  let fixture: ComponentFixture<ForgotPassword>;

  /** Escribe un valor en un input y espera a que Signal Forms propague el cambio. */
  async function type(selector: string, value: string): Promise<void> {
    const input = fixture.nativeElement.querySelector(selector) as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
  }

  function submitButton(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForgotPassword],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ForgotPassword);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('deshabilita el botón mientras el formulario sea inválido', () => {
    expect(submitButton().disabled).toBe(true);
  });

  it('habilita el botón con un correo con formato válido', async () => {
    await type('#email', 'ana.torres@correo.com');

    expect(submitButton().disabled).toBe(false);
  });

  it('mantiene el botón deshabilitado con un correo mal formado', async () => {
    await type('#email', 'ana.torres@');

    expect(submitButton().disabled).toBe(true);
  });

  it('enlaza de vuelta al inicio de sesión', () => {
    const loginLink = fixture.nativeElement.querySelector(
      'a[href="/auth/login"]',
    ) as HTMLAnchorElement | null;

    expect(loginLink).not.toBeNull();
  });
});
