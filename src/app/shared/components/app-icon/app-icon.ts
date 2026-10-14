import { Component, computed, input } from '@angular/core';

/** Nombres disponibles en el registro de iconos de la app. */
export type IconName =
  | 'plus'
  | 'list'
  | 'card'
  | 'gear'
  | 'menu'
  | 'close'
  | 'logout'
  | 'chevron-down'
  | 'search'
  | 'arrow-up'
  | 'arrow-down'
  | 'sun'
  | 'moon'
  | 'monitor';

/** Tamaños soportados por el icono. */
export type IconSize = 'sm' | 'md' | 'lg';

/** Tamaño en rem por variante. */
const ICON_SIZES: Record<IconSize, string> = {
  sm: '1rem',
  md: '1.25rem',
  lg: '1.5rem',
};

/**
 * Icono de la app.
 *
 * Registro propio de glifos SVG inline, sin dependencias externas, dibujados
 * con trazos de 1.75 en un lienzo de 24x24: el mismo criterio que los glifos
 * del contenedor de toasts. El color lo hereda con `currentColor`, de modo que
 * cada consumidor lo colorea desde su propio SCSS.
 *
 * El tamaño se resuelve con la variable CSS `--icon-size`, que el host escribe
 * según el input `size`.
 */
@Component({
  selector: 'app-icon',
  styleUrl: './app-icon.scss',
  templateUrl: './app-icon.html',
  host: {
    '[style.--icon-size]': 'sizeValue()',
  },
})
export class AppIcon {
  /** Glifo a dibujar. */
  readonly name = input.required<IconName>();

  /** Tamaño del glifo; por defecto `md` (1.25rem). */
  readonly size = input<IconSize>('md');

  /** Tamaño resuelto a una medida CSS. */
  protected readonly sizeValue = computed(() => ICON_SIZES[this.size()]);
}
