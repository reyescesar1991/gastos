/**
 * Contrato de datos del sistema de toasts.
 *
 * - `ToastType` es la variante semántica: define el color y el icono.
 * - `ToastOptions` describe lo que se pasa al crear un toast.
 * - `Toast` es el toast ya registrado en el servicio, con su `id` y los valores
 *   resueltos (tipo y duración nunca son `undefined`).
 */

/** Variante semántica del toast. */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

/** Duración por defecto en pantalla, en milisegundos. */
export const TOAST_DEFAULT_DURATION = 4000;

/** Datos necesarios para mostrar un toast. */
export interface ToastOptions {
  /** Texto principal que verá el usuario. */
  message: string;
  /** Variante semántica. Por defecto `info`. */
  type?: ToastType;
  /**
   * Tiempo en pantalla en milisegundos antes de cerrarse solo.
   * Usa `0` para mantenerlo visible hasta que se cierre manualmente.
   */
  duration?: number;
  /**
   * Código opcional que se ejecuta cuando el toast se cierra, ya sea por el
   * temporizador o por un cierre manual.
   */
  onClose?: () => void;
}

/** Toast ya registrado en el servicio. */
export interface Toast {
  readonly id: string;
  readonly message: string;
  readonly type: ToastType;
  readonly duration: number;
  readonly onClose?: () => void;
}
