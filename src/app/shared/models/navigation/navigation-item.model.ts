import type { IconName } from '../../components/app-icon/app-icon';

/**
 * Opción del menú de navegación principal.
 *
 * El atributo `enabled` es el que gobierna si la opción está disponible: una
 * opción deshabilitada se pinta atenuada, no navega y avisa al usuario en vez
 * de ofrecer una vista que todavía no existe. `children` habilita un nivel de
 * rutas subhijas, que el menú renderiza como desplegable.
 */
export interface NavigationItem {

    /** Identificador estable, usado como `track` y para resolver la opción. */
    id: string;

    /** Nombre visible de la opción. */
    label: string;

    /** Icono del registro de `app-icon`. */
    icon: IconName;

    /** Ruta destino de la opción. */
    route: string;

    /** Activación o desactivación de la opción. */
    enabled: boolean;

    /** Rutas subhijas (un nivel). */
    children?: NavigationItem[];
}
