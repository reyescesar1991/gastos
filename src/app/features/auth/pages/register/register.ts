import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormField, form, maxLength, submit, validateStandardSchema } from '@angular/forms/signals';
import type { RegisterForm } from '../../models/register-request.model';
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  registerFormSchema,
} from '../../schemas/auth.schemas';

/**
 * Pantalla de creación de cuenta.
 *
 * Usa Signal Forms de Angular 22:
 * - `registration` es un `signal` con el modelo mutable del formulario.
 * - `registerForm` es el árbol de campos (`FieldTree`) construido con `form()`.
 * - Las reglas viven en `registerFormSchema` (Zod) y se enganchan con
 *   `validateStandardSchema()`, que reparte cada error al campo que lo originó.
 *
 * Reglas aplicadas: nombre de usuario de 5 a 20 caracteres sin espacios, correo
 * con formato estándar, contraseña de 8 a 20 caracteres con al menos un número
 * y un carácter especial, y confirmación que debe coincidir con la contraseña.
 * El botón se deshabilita mientras el formulario sea inválido
 * (`registerForm().invalid()`).
 */
@Component({
  imports: [FormField, RouterLink],
  selector: 'app-register',
  styleUrl: './register.scss',
  templateUrl: './register.html',
})
export class Register {
  /** Modelo mutable del formulario; Signal Forms lo usa como fuente de verdad. */
  protected readonly registration = signal<RegisterForm>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  /** Árbol de campos del formulario con el schema Zod aplicado. */
  protected readonly registerForm = form(this.registration, (path) => {

    maxLength(path.password, PASSWORD_MAX_LENGTH);

    validateStandardSchema(path, registerFormSchema);
  });

  /**
   * Resumen de las reglas mostrado al usuario.
   *
   * Se construye con las mismas constantes que usa el schema, de modo que el
   * texto nunca se desincroniza de la validación real.
   */
  protected readonly rules = [
    `Usuario: entre ${USERNAME_MIN_LENGTH} y ${USERNAME_MAX_LENGTH} caracteres, sin espacios en blanco.`,
    'Correo: con formato estándar (usuario@dominio.com).',
    `Contraseña: entre ${PASSWORD_MIN_LENGTH} y ${PASSWORD_MAX_LENGTH} caracteres, con al menos un número y un carácter especial.`,
    'Confirmación: debe coincidir con la contraseña.',
  ];

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

    void submit(this.registerForm, {
      action: async () => {
        // TODO: enviar `this.registration()` a AuthApiService cuando la API exista.
      },
    });
  }
}
