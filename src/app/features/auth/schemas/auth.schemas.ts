import { z } from 'zod';

/**
 * Fuente única de verdad de las reglas de validación de las pantallas de
 * autenticación.
 *
 * Los componentes las aplican con `validateStandardSchema()` de Signal Forms,
 * que traduce cada `issue` de Zod al campo correspondiente del formulario.
 * Cambiar una regla aquí la actualiza en la interfaz y en el estado del form.
 */

/** Longitud mínima aceptada para el nombre de usuario. */
export const USERNAME_MIN_LENGTH = 5;

/** Longitud máxima aceptada para el nombre de usuario. */
export const USERNAME_MAX_LENGTH = 20;

/** Longitud mínima aceptada para la contraseña. */
export const PASSWORD_MIN_LENGTH = 8;

/** Longitud máxima aceptada para la contraseña. */
export const PASSWORD_MAX_LENGTH = 20;

/** Correo con formato estándar. Requerido: no admite cadena vacía. */
export const emailSchema = z.email('Ingresa un correo válido');

/** 5-20 caracteres, sin espacios en blanco. */
export const usernameSchema = z
  .string()
  .min(USERNAME_MIN_LENGTH, `Mínimo ${USERNAME_MIN_LENGTH} caracteres`)
  .max(USERNAME_MAX_LENGTH, `Máximo ${USERNAME_MAX_LENGTH} caracteres`)
  .regex(/^\S+$/, 'No se permiten espacios en blanco');

/**
 * 8-20 caracteres, con al menos un número y un carácter especial.
 * El carácter especial excluye espacios para que un blanco no cuente como tal.
 */
export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Mínimo ${PASSWORD_MIN_LENGTH} caracteres`)
  .max(PASSWORD_MAX_LENGTH, `Máximo ${PASSWORD_MAX_LENGTH} caracteres`)
  .regex(/^\S*$/, 'No se permiten espacios en blanco')
  .regex(/\d/, 'Debe incluir al menos un número')
  .regex(/[^A-Za-z0-9\s]/, 'Debe incluir al menos un carácter especial')
  

/** Credenciales de inicio de sesión. */
export const loginCredentialsSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

/** Datos de creación de cuenta. */
export const registerRequestSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
});

/**
 * Schema del formulario de registro.
 *
 * Extiende el payload de la API con `confirmPassword`, un campo que solo existe
 * en la interfaz, y comprueba que ambas contraseñas coincidan. El error se ancla
 * al campo de confirmación mediante `path`, de modo que Signal Forms lo muestre
 * en el input correcto.
 */
export const registerFormSchema = registerRequestSchema
  .extend({
    confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

/** Datos de recuperación de contraseña. */
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});
