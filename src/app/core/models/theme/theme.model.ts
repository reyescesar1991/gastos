/**
 * Preferencia de tema del usuario.
 *
 * `system` delega en el sistema operativo, así que el tema que se aplica se
 * resuelve con `resolvedTheme` en la store de sesión.
 */
export type Theme = 'light' | 'dark' | 'system';

/** Tema efectivo que se aplica al documento (nunca `system`). */
export type ResolvedTheme = 'light' | 'dark';

/** Tema por defecto cuando el usuario todavía no eligió. */
export const DEFAULT_THEME: Theme = 'system';

/** Clave de `localStorage` donde se persiste la preferencia. */
export const THEME_STORAGE_KEY = 'app_theme';

/** Lista de temas válidos, para validar lo que llega de `localStorage`. */
export const THEMES: readonly Theme[] = ['light', 'dark', 'system'];
