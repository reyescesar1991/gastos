import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Login } from './login';

/**
 * Pruebas de la pantalla de inicio de sesión.
 *
 * Se verifican las reglas del instructivo que son observables desde el DOM:
 * el botón deshabilitado mientras el formulario es inválido y los enlaces de
 * navegación hacia registro y recuperación de contraseña.
 */
describe('Login', () => {
  let fixture: ComponentFixture<Login>;

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
      imports: [Login],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('deshabilita el botón mientras el formulario sea inválido', () => {
    expect(submitButton().disabled).toBe(true);
  });

  it('habilita el botón con un correo válido y una contraseña que cumple las reglas', async () => {
    await type('#email', 'ana.torres@correo.com');
    await type('#password', 'Gastos2026!');

    expect(submitButton().disabled).toBe(false);
  });

  it('mantiene el botón deshabilitado si la contraseña no cumple las reglas', async () => {
    await type('#email', 'ana.torres@correo.com');
    await type('#password', 'gastos');

    expect(submitButton().disabled).toBe(true);
  });

  it('enlaza hacia el registro y la recuperación de contraseña', () => {
    const hrefs = Array.from(fixture.nativeElement.querySelectorAll('a')).map((link) =>
      (link as HTMLAnchorElement).getAttribute('href'),
    );

    expect(hrefs).toContain('/auth/register');
    expect(hrefs).toContain('/auth/forgot-password');
  });
});
