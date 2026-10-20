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
    paymentMethods: 'payment-methods',
    paymentMethodList: 'payment-method-list',
    paymentMethodAdd: 'payment-method-add',
    userSettings: 'user-settings',
} as const;


/**
 * Data dummy del menú de navegación.
 *
 * Cada opción viaja con `enabled` según exista o no su vista: las que todavía
 * no existen se muestran atenuadas y sin navegar. "Agregar movimiento",
 * "Métodos de pago" y "Configuración de usuario" ya están habilitadas; al crear
 * la ruta de las demás basta con poner el ítem en `true` para activar la opción,
 * el estado seleccionado y los accesos rápidos que la consumen. "Métodos de
 * pago" agrupa sus rutas en `children`: "Mis métodos de pago" abre el listado y
 * "Agregar método de pago" el formulario de alta.
 */
export const NAVIGATION_MENU_MOCK: NavigationItem[] = [

    {
        id: NAVIGATION_IDS.movementAdd,
        label: 'Agregar movimiento',
        icon: 'plus',
        route: '/movimientos/nuevo',
        enabled: true,
    },
    {
        id: NAVIGATION_IDS.movementList,
        label: 'Ver movimientos',
        icon: 'list',
        route: '/movimientos',
        enabled: false,
    },
    {
        id: NAVIGATION_IDS.paymentMethods,
        label: 'Métodos de pago',
        icon: 'card',
        route: '/metodos-pago',
        enabled: true,
        children: [
            {
                id: NAVIGATION_IDS.paymentMethodList,
                label: 'Mis métodos de pago',
                icon: 'list',
                route: '/metodos-pago',
                enabled: true,
            },
            {
                id: NAVIGATION_IDS.paymentMethodAdd,
                label: 'Agregar método de pago',
                icon: 'plus',
                route: '/metodos-pago/nuevo',
                enabled: true,
            },
        ],
    },
    {
        id: NAVIGATION_IDS.userSettings,
        label: 'Configuración de usuario',
        icon: 'gear',
        route: '/configuracion',
        enabled: true,
    },
];
