import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormField, form, maxLength, submit, validateStandardSchema } from '@angular/forms/signals';
import type { LoginForm } from '../../models/login-credentials.model';
import { loginCredentialsSchema, PASSWORD_MAX_LENGTH } from '../../schemas/auth.schemas';

/**
 * Pantalla de inicio de sesión.
 *
 * Usa Signal Forms de Angular 22:
 * - `credentials` es un `signal` con el modelo mutable del formulario.
 * - `loginForm` es el árbol de campos (`FieldTree`) construido con `form()`.
 * - La validación vive en `loginCredentialsSchema` (Zod) y se engancha con
 *   `validateStandardSchema()`, que reparte cada error al campo que lo originó.
 *
 * Reglas aplicadas: correo con formato estándar y contraseña de 8 a 20
 * caracteres con al menos un número y un carácter especial. El botón de envío
 * se deshabilita mientras el formulario sea inválido (`loginForm().invalid()`).
 */
@Component({
  imports: [FormField, RouterLink],
  selector: 'app-login',
  styleUrl: './login.scss',
  templateUrl: './login.html',
})
export class Login {
  /** Modelo mutable del formulario; Signal Forms lo usa como fuente de verdad. */
  protected readonly credentials = signal<LoginForm>({ email: '', password: '' });

  /** Árbol de campos del formulario con el schema Zod aplicado. */
  protected readonly loginForm = form(this.credentials, (path) => {

    maxLength(path.password, PASSWORD_MAX_LENGTH);

    validateStandardSchema(path, loginCredentialsSchema);
  });

  /**
   * Maneja el envío del formulario.
   *
   * `submit()` solo ejecuta la acción cuando el formulario es válido y marca los
   * campos como tocados, para que los errores se muestren tras el primer intento.
   *
   * @param event Evento nativo de envío del formulario.
   */
  protected onSubmit(event: Event): void {
    event.preventDefault();

    void submit(this.loginForm, {
      action: async () => {
        // TODO: enviar `this.credentials()` a AuthApiService cuando la API exista.
      },
    });
  }
}
