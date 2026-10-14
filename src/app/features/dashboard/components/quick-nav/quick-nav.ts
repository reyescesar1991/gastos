import { Component, ElementRef, computed, inject, signal } from '@angular/core';
import { NavStore } from '../../../../core/stores/navigation/nav.store';
import { AppIcon } from '../../../../shared/components/app-icon/app-icon';
import type { NavigationItem } from '../../../../shared/models/navigation/navigation-item.model';

/**
 * Navegación rápida.
 *
 * Input con desplegable que lista las opciones habilitadas del menú —la misma
 * fuente que `nav-menu`—, filtra por texto y navega a la elegida. Se comporta
 * como un combobox: `aria-expanded`, `aria-controls` y `aria-activedescendant`,
 * con flechas para recorrer, Enter para entrar y Escape para cerrar. El
 * desplegable se cierra solo cuando el foco sale del componente.
 */
@Component({
  imports: [AppIcon],
  selector: 'app-quick-nav',
  styleUrl: './quick-nav.scss',
  templateUrl: './quick-nav.html',
})
export class QuickNav {
  private readonly navStore = inject(NavStore);

  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Texto escrito en el input. */
  protected readonly query = signal('');

  /** Indica si el desplegable está abierto. */
  protected readonly isOpen = signal(false);

  /** Índice resaltado dentro del desplegable (para teclado). */
  protected readonly activeOptionIndex = signal(0);

  /** Opciones disponibles que coinciden con el texto escrito. */
  protected readonly options = computed(() => {

    const query = this.query().trim().toLowerCase();
    const items = this.navStore.enabledItems();

    return query === ''
      ? items
      : items.filter((item) => item.label.toLowerCase().includes(query));
  });

  /** Id de la opción resaltada, para `aria-activedescendant`. */
  protected readonly activeOptionId = computed(() => {
    const option = this.options()[this.activeOptionIndex()];

    return option === undefined ? null : `quick-nav-option-${option.id}`;
  });

  /** Abre el desplegable al enfocar el input. */
  protected onFocus(): void {
    this.isOpen.set(true);
  }

  /** Actualiza el filtro y reinicia la opción resaltada. */
  protected onInput(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.activeOptionIndex.set(0);
    this.isOpen.set(true);
  }

  /** Navega a la opción elegida y cierra el desplegable. */
  protected onSelect(item: NavigationItem): void {
    this.navStore.selectItem(item.id);
    this.query.set('');
    this.close();
  }

  /** Recorre las opciones con las flechas, entra con Enter y cierra con Escape. */
  protected onKeydown(event: KeyboardEvent): void {

    const options = this.options();

    switch (event.key) {

      case 'ArrowDown':
        event.preventDefault();
        this.moveActiveOption(1, options.length);
        break;

      case 'ArrowUp':
        event.preventDefault();
        this.moveActiveOption(-1, options.length);
        break;

      case 'Enter': {
        const option = options[this.activeOptionIndex()];

        if (option !== undefined) {
          event.preventDefault();
          this.onSelect(option);
        }

        break;
      }

      case 'Escape':
        this.close();
        break;
    }
  }

  /** Cierra el desplegable cuando el foco sale del componente. */
  protected onFocusOut(event: FocusEvent): void {

    const next = event.relatedTarget;

    if (next instanceof Node && this.elementRef.nativeElement.contains(next)) {
      return;
    }

    this.close();
  }

  /** Cierra el desplegable y limpia el resaltado. */
  private close(): void {
    this.isOpen.set(false);
    this.activeOptionIndex.set(0);
  }

  /** Mueve el resaltado dentro del desplegable, con vuelta circular. */
  private moveActiveOption(delta: number, total: number): void {

    if (total === 0) {
      return;
    }

    this.activeOptionIndex.update((index) => (index + delta + total) % total);
  }
}
