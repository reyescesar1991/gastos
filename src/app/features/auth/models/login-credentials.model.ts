import { SupabaseProfileDto } from "../../../core/models/user/user-dto.model";

/**
 * Contrato de datos del inicio de sesión.
 *
 * - `LoginForm` es el modelo mutable que consume Signal Forms
 *   (`signal<LoginForm>({ email: '', password: '' })`).
 * - `LoginCredentialsRequest` describe el payload que enviará la API.
 *
 * El vínculo con las reglas de validación lo verifica TypeScript:
 * `validateStandardSchema()` exige que el modelo del formulario sea compatible
 * con el schema Zod `loginCredentialsSchema`.
 */
export interface LoginCredentialsRequest {
  email: string;
  password: string;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface LoginCredentialsResponse {
  token: string;
  profile : SupabaseProfileDto;
}
