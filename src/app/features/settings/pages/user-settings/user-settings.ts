import { Component, computed, inject } from '@angular/core';
import type { Theme } from '../../../../core/models/theme/theme.model';
import { SessionStore } from '../../../../core/stores/auth/session.store';
import { AppIcon, IconName } from '../../../../shared/components/app-icon/app-icon';

/** Opción del selector de tema. */
interface ThemeOption {
  value: Theme;
  label: string;
  description: string;
  icon: IconName;
}

/**
 * Pantalla de configuración de usuario.
 *
 * Por ahora resuelve el tema de la app: el usuario elige entre claro, oscuro o
 * seguir al sistema, y la elección se guarda en la store de sesión, que además
 * la persiste en el dispositivo. El tema aplicado se muestra cuando la elección
 * es "sistema", porque en ese caso lo que manda es el sistema operativo.
 *
 * El cambio de imagen del avatar queda pendiente: requiere un endpoint de
 * perfil que todavía no existe.
 */
@Component({
  imports: [AppIcon],
  selector: 'app-user-settings',
  styleUrl: './user-settings.scss',
  templateUrl: './user-settings.html',
})
export class UserSettings {
  /** Sesión del usuario: preferencia de tema y su persistencia. */
  protected readonly sessionStore = inject(SessionStore);

  /** Opciones del selector de tema. */
  protected readonly themeOptions: readonly ThemeOption[] = [
    {
      value: 'light',
      label: 'Claro',
      description: 'Superficies claras sobre canvas cálido.',
      icon: 'sun',
    },
    {
      value: 'dark',
      label: 'Oscuro',
      description: 'Superficies profundas sobre canvas casi negro.',
      icon: 'moon',
    },
    {
      value: 'system',
      label: 'Sistema',
      description: 'Sigue la preferencia del sistema operativo.',
      icon: 'monitor',
    },
  ];

  /** Nombre del tema que está aplicado ahora mismo. */
  protected readonly resolvedLabel = computed(() =>
    this.sessionStore.resolvedTheme() === 'dark' ? 'oscuro' : 'claro',
  );

  /** Indica si la opción es la elegida por el usuario. */
  protected isSelected(theme: Theme): boolean {
    return this.sessionStore.theme() === theme;
  }

  /**
   * Aplica y persiste el tema elegido.
   *
   * @param theme Preferencia seleccionada.
   */
  protected onSelectTheme(theme: Theme): void {
    this.sessionStore.setTheme(theme);
  }
}
