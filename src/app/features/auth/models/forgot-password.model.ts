/**
 * Contrato de datos de la recuperación de contraseña.
 *
 * - `ForgotPasswordForm` es el modelo mutable que consume Signal Forms.
 * - `ForgotPasswordRequest` describe el payload que enviará la API.
 *
 * El vínculo con las reglas de validación lo verifica TypeScript:
 * `validateStandardSchema()` exige que `ForgotPasswordForm` sea compatible con
 * el schema Zod `forgotPasswordSchema`.
 */
export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordForm {
  email: string;
}
