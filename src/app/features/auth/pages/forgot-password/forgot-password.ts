import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormField, form, submit, validateStandardSchema } from '@angular/forms/signals';
import type { ForgotPasswordForm } from '../../models/forgot-password.model';
import { forgotPasswordSchema } from '../../schemas/auth.schemas';

/**
 * Pantalla de recuperación de contraseña.
 *
 * Usa Signal Forms de Angular 22:
 * - `request` es un `signal` con el modelo mutable del formulario.
 * - `forgotPasswordForm` es el árbol de campos (`FieldTree`) construido con `form()`.
 * - La regla vive en `forgotPasswordSchema` (Zod): correo con formato estándar,
 *   enganchada con `validateStandardSchema()`.
 *
 * El botón se deshabilita mientras el formulario sea inválido
 * (`forgotPasswordForm().invalid()`).
 */
@Component({
  imports: [FormField, RouterLink],
  selector: 'app-forgot-password',
  styleUrl: './forgot-password.scss',
  templateUrl: './forgot-password.html',
})
export class ForgotPassword {
  /** Modelo mutable del formulario; Signal Forms lo usa como fuente de verdad. */
  protected readonly request = signal<ForgotPasswordForm>({ email: '' });

  /** Árbol de campos del formulario con el schema Zod aplicado. */
  protected readonly forgotPasswordForm = form(this.request, (path) => {
    validateStandardSchema(path, forgotPasswordSchema);
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

    void submit(this.forgotPasswordForm, {
      action: async () => {
        // TODO: enviar `this.request()` a AuthApiService cuando la API exista.
      },
    });
  }
}
