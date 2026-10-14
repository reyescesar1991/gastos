import { computed, inject } from "@angular/core";
import { Router } from "@angular/router";
import { patchState, signalStore, withComputed, withMethods, withState } from "@ngrx/signals";
import { NAVIGATION_MENU_MOCK } from "../../../shared/components/nav-menu/mocks/navigation-menu.mock";
import { NavigationItem } from "../../../shared/models/navigation/navigation-item.model";
import { ToastService } from "../../services/toast-service";

/** Estado del menú de navegación. */
export interface NavigationState {

    /** Opciones del menú (data dummy mientras los módulos no existan). */
    items: NavigationItem[];

    /** Panel del menú abierto en móvil. */
    isMenuOpen: boolean;
}

const initialState: NavigationState = {
    items: NAVIGATION_MENU_MOCK,
    isMenuOpen: false,
};

/**
 * Estado compartido del menú de navegación.
 *
 * El header produce el estado del panel (hamburguesa) y el panel de
 * `nav-menu` lo consume, además de ser la fuente de las opciones para el
 * acceso rápido del dashboard. `selectItem` centraliza la resolución de una
 * opción: navega cuando está habilitada y avisa cuando todavía no lo está, de
 * modo que ningún consumidor deje un click sin respuesta.
 */
export const NavStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),

    withComputed(
        (store) => ({

            /** Opciones disponibles para navegar. */
            enabledItems: computed(() => store.items().filter((item) => item.enabled)),

            /** Indica si hay al menos una opción habilitada. */
            hasEnabledItems: computed(() => store.items().some((item) => item.enabled)),
        })
    ),

    withMethods(
        (store, router = inject(Router), toastService = inject(ToastService)) => {

            /** Busca una opción por id, incluyendo las subhijas. */
            const findItem = (id: string): NavigationItem | undefined => {

                const items = store.items();

                return items.find((item) => item.id === id)
                    ?? items.flatMap((item) => item.children ?? []).find((child) => child.id === id);
            };

            return {

                findItem,

                toggleMenu(): void {
                    patchState(store, { isMenuOpen: !store.isMenuOpen() });
                },

                closeMenu(): void {
                    patchState(store, { isMenuOpen: false });
                },

                /**
                 * Resuelve la opción indicada.
                 *
                 * Si está habilitada cierra el panel y navega a su ruta; si no,
                 * avisa al usuario que aún no está disponible.
                 *
                 * @param id Identificador de la opción del menú.
                 */
                selectItem(id: string): void {

                    const item = findItem(id);

                    if (item === undefined) {
                        return;
                    }

                    if (!item.enabled) {
                        toastService.info(`Aún no disponible: ${item.label}`, { duration: 4000 });
                        return;
                    }

                    patchState(store, { isMenuOpen: false });

                    void router.navigateByUrl(item.route);
                },
            };
        }
    )
);
