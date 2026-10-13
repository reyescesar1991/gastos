import { Injectable, signal } from '@angular/core';
import { TOAST_DEFAULT_DURATION, Toast, ToastOptions } from '../models/toast/toast.model';

/**
 * Servicio central de notificaciones tipo toast.
 *
 * Mantiene la lista reactiva de toasts activos con Signals y expone atajos por
 * variante (`success`, `error`, `warning`, `info`). Cada toast se cierra solo
 * cuando vence su temporizador (o nunca, si `duration` es `0`) y ejecuta su
 * `onClose` opcional tanto al vencer como al cerrarse manualmente.
 *
 * El servicio solo gestiona el estado; el render lo hace `ToastContainer`,
 * montado una sola vez en la raíz de la app.
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  /** Lista mutable interna de toasts activos. */
  private readonly toastList = signal<Toast[]>([]);

  /** Lista reactiva de toasts activos, de solo lectura. */
  readonly toasts = this.toastList.asReadonly();

  /** Temporizadores de autocierre, indexados por id de toast. */
  private readonly timers = new Map<string, ReturnType<typeof setTimeout>>();

  /**
   * Muestra un toast genérico.
   *
   * @param options Mensaje, variante, duración y callback de cierre.
   * @returns El id del toast creado, útil para cerrarlo antes de tiempo.
   */
  show(options: ToastOptions): string {
    const toast: Toast = {
      id: this.createId(),
      message: options.message,
      type: options.type ?? 'info',
      duration: options.duration ?? TOAST_DEFAULT_DURATION,
      onClose: options.onClose,
    };

    this.toastList.update((toasts) => [...toasts, toast]);
    this.scheduleAutoDismiss(toast);

    return toast.id;
  }

  /** Muestra un toast de éxito. */
  success(message: string, options?: ToastExtras): string {
    return this.show({ ...options, message, type: 'success' });
  }

  /** Muestra un toast de error. */
  error(message: string, options?: ToastExtras): string {
    return this.show({ ...options, message, type: 'error' });
  }

  /** Muestra un toast de advertencia. */
  warning(message: string, options?: ToastExtras): string {
    return this.show({ ...options, message, type: 'warning' });
  }

  /** Muestra un toast informativo. */
  info(message: string, options?: ToastExtras): string {
    return this.show({ ...options, message, type: 'info' });
  }

  /**
   * Cierra un toast por su id.
   *
   * Cancela su temporizador, lo retira de la lista y ejecuta su `onClose`.
   * Si el id ya no existe no hace nada, de modo que un callback nunca corre
   * dos veces.
   *
   * @param id Identificador devuelto por `show` o por cualquiera de los atajos.
   */
  dismiss(id: string): void {
    const timer = this.timers.get(id);
    if (timer !== undefined) {
      clearTimeout(timer);
      this.timers.delete(id);
    }

    const toast = this.toastList().find((item) => item.id === id);
    if (toast === undefined) {
      return;
    }

    this.toastList.update((toasts) => toasts.filter((item) => item.id !== id));
    toast.onClose?.();
  }

  /** Cierra todos los toasts activos. */
  clear(): void {
    for (const toast of this.toastList()) {
      this.dismiss(toast.id);
    }
  }

  /** Programa el autocierre de un toast cuando tiene duración positiva. */
  private scheduleAutoDismiss(toast: Toast): void {
    if (toast.duration <= 0) {
      return;
    }

    const timer = setTimeout(() => this.dismiss(toast.id), toast.duration);
    this.timers.set(toast.id, timer);
  }

  /** Genera un id único para cada toast. */
  private createId(): string {
    return crypto.randomUUID();
  }
}

/** Opciones de un atajo, sin `message` ni `type` (los fija el propio atajo). */
type ToastExtras = Omit<ToastOptions, 'message' | 'type'>;
