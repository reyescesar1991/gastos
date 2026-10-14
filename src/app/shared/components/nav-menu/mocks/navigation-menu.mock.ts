import { NavigationItem } from "../../../models/navigation/navigation-item.model";

/**
 * Ids de las opciones del menú.
 *
 * Se exponen como constantes para que el header (avatar -> configuración) y el
 * acceso rápido del dashboard resuelvan la misma opción sin repetir literales.
 */
export const NAVIGATION_IDS = {
    movementAdd: 'movement-add',
    movementList: 'movement-list',
    paymentMethodAdd: 'payment-method-add',
    userSettings: 'user-settings',
} as const;


/**
 * Data dummy del menú de navegación.
 *
 * Las cuatro opciones viajan con `enabled: false` mientras sus vistas no
 * existan: el menú las muestra atenuadas y sin navegar. Al crear la ruta
 * correspondiente basta con poner el ítem en `true` para activar la opción, el
 * estado seleccionado y los accesos rápidos que la consumen.
 */
export const NAVIGATION_MENU_MOCK: NavigationItem[] = [

    {
        id: NAVIGATION_IDS.movementAdd,
        label: 'Agregar movimiento',
        icon: 'plus',
        route: '/movimientos/nuevo',
        enabled: false,
    },
    {
        id: NAVIGATION_IDS.movementList,
        label: 'Ver movimientos',
        icon: 'list',
        route: '/movimientos',
        enabled: false,
    },
    {
        id: NAVIGATION_IDS.paymentMethodAdd,
        label: 'Agregar método de pago',
        icon: 'card',
        route: '/metodos-pago/nuevo',
        enabled: false,
    },
    {
        id: NAVIGATION_IDS.userSettings,
        label: 'Configuración de usuario',
        icon: 'gear',
        route: '/configuracion',
        enabled: false,
    },
];
