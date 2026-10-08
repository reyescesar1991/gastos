/**
 * Contrato de datos del registro de usuario.
 *
 * - `RegisterForm` es el modelo mutable que consume Signal Forms.
 * - `RegisterUserRequest` describe el payload que enviará la API.
 *
 * `RegisterForm` añade `confirmPassword`, que solo existe en la interfaz y
 * nunca forma parte del payload.
 *
 * El vínculo con las reglas de validación lo verifica TypeScript:
 * `validateStandardSchema()` exige que `RegisterForm` sea compatible con el
 * schema Zod `registerFormSchema`.
 */
export interface RegisterUserRequest {
  username: string;
  email: string;
  password: string;
}

export interface RegisterForm {
  username: string;
  email: string;
  password: string;
  /** Confirmación de la contraseña; solo vive en el formulario, no en el payload. */
  confirmPassword: string;
}
