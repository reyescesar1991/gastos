# Plan — Módulo Dashboard, menú de navegación y filtros

Derivado de `src/app/features/dashboard/instructions.md`. Todas las decisiones se toman
respetando `agents/skills/taste-skill.md` (minimalismo utilitario editorial, mobile first) y
la paleta ya declarada en `src/styles.scss`.

---

## Decisiones aprobadas

1. **Estado del menú:** `NavStore` (signal store) con `items`, `enabledItems`, `isMenuOpen`.
2. **Rutas destino:** no se crean vistas nuevas. Las 4 opciones del mock viajan con
   `enabled: false` y el menú las renderiza deshabilitadas (es el atributo que pide el punto 1).
3. **Navegación rápida del dashboard:** combobox propio accesible (botón + listbox con filtro).
4. **Prerrequisitos:** solo lo bloqueante — `@Injectable({ providedIn: 'root' })` en los 3
   servicios API. No se toca `app.config.ts` ni `authGuard`.

**Consecuencia a tener en cuenta:** con las 4 opciones deshabilitadas no hay destino real al
que navegar, así que los requisitos 3 (avatar → Configuración de usuario), 6.2 (navegación
rápida) y 6.4 (acceso rápido a registrar movimiento) quedan implementados y cableados a
`enabled`, pero muestran su estado deshabilitado o un aviso informativo en lugar de navegar.
Al poner un ítem en `enabled: true` (y crear su ruta) empiezan a funcionar sin cambios de
código. El estilo de "selected option" del punto 1 se implementa igual y se activa en ese
momento.

---

## 0. Estado actual y huecos detectados

| Hallazgo | Impacto |
| --- | --- |
| `Shared` solo tiene `components/toast-container` | El menú, header y layout no existen. Se sigue el patrón existente: componente standalone, `styleUrl`, clase documentada con JSDoc en español, tokens de `styles.scss`, iconos SVG inline. |
| `app.routes.ts` monta `dashboard` con `loadChildren` pero `dashboard.routes.ts` importa `Dashboard` de forma eager | El componente del dashboard no es lazy (punto 7 del .md). |
| No existe layout: `app.html` solo tiene `<router-outlet />` | El header/menú deben vivir a nivel de router-outlet con una ruta de layout padre (punto 5). |
| `authGuard` no se usa y redirige a `/login`, pero la ruta real es `/auth/login` | Bug latente detectado; **no se corrige** (decisión 4). La ruta del layout no queda protegida. |
| `BalanceApiService`, `MovementsApiService` y `AuthApiService` no tienen `@Injectable({ providedIn: 'root' })` ni están en `providers` | **Bloqueante**: las stores hacen `inject(BalanceApiService)` / `inject(MovementsApiService)`; sin metadato de DI el dashboard no puede cargar datos (NullInjectorError en runtime). |
| `BalanceStore` colapsa `null` a `0` en sus computeds | No se puede distinguir "sin datos" de "0". El punto 6.1 exige etiqueta de valor nulo. |
| `MovementsStore` solo expone `movementsList` | Falta el computed de "últimos movimientos" (orden por fecha + límite) que pide el punto 6.3. |
| `authInterceptor` y `errorInterceptor` no están registrados en `app.config.ts` (`error.interceptor.ts` está vacío) | Fuera del alcance estricto; se deja igual salvo decisión explícita. |
| No existen rutas para las 4 opciones del menú | El menú quedaría con enlaces muertos. |
| No hay locale español configurado | Se resuelve dentro del dashboard con `Intl.*('es-CO')`, sin tocar `app.config.ts` (decisión 4). |

---

## 1. Estructura de archivos propuesta

```
src/app/shared/
  models/navigation/navigation-item.model.ts        # modelo del ítem de menú
  components/
    app-icon/app-icon.(ts|html)                     # registro SVG inline (sin librerías)
    nav-menu/
      nav-menu.(ts|html|scss)
      mocks/navigation-menu.mock.ts                 # data dummy del menú
    app-header/app-header.(ts|html|scss)
  layout/
    app-layout/app-layout.(ts|html|scss)            # header + nav + <router-outlet/>

src/app/core/stores/navigation/nav.store.ts         # estado compartido del menú (confirmado)

src/app/features/dashboard/dashboard.(ts|html|scss|spec.ts)
```

No se crean carpetas nuevas en `features/` (decisión 2): el único destino real sigue siendo
`/dashboard`.

## 2. Modelo y datos dummy del menú (punto 1 y 4)

`navigation-item.model.ts`:

```ts
export interface NavigationItem {
  id: string;
  label: string;              // nombre de la opción
  icon: IconName;             // icono (clave del registro SVG)
  route: string;              // ruta destino
  enabled: boolean;           // activación / desactivación de la opción
  children?: NavigationItem[]; // rutas subhijas (soporte de un nivel)
}
```

`mocks/navigation-menu.mock.ts` (misma carpeta del menú):

| id | label | icono | route (prevista) | enabled |
| --- | --- | --- | --- | --- |
| `movement-add` | Agregar movimiento | `plus` | `/movimientos/nuevo` | **false** |
| `movement-list` | Ver movimientos | `list` | `/movimientos` | **false** |
| `payment-method-add` | Agregar método de pago | `card` | `/metodos-pago/nuevo` | **false** |
| `user-settings` | Configuración de usuario | `gear` | `/configuracion` | **false** |

`route` se conserva declarada como destino previsto (la consume el layout al habilitar el
ítem); con `enabled: false` el ítem no navega ni se renderiza como `<a>`, solo como `<button
disabled>` con `aria-disabled="true"` y estilo atenuado (`--ink-muted`).

Iconos propios en SVG inline (`app-icon`), `viewBox="0 0 24 24"`, `stroke-width: 1.75`,
`fill: none` — igual que los glifos de `toast-container`. **No** se instalan
Lucide/Feather/Heroicons (prohibidos por la skill).

## 3. Menú de navegación y header en `shared` (puntos 1, 2, 3)

- `app-icon`: input `name`, `@switch` sobre un registro de paths SVG. Sin dependencias.
- `nav-menu`: recorre `NavigationItem[]`; aplica `aria-current="page"` y estilo de opción
  seleccionada (`background: var(--surface-muted)`, texto `--ink`, barra de acento pastel a
  1px–2px; ítems deshabilitados con `--ink-muted` y sin navegación). Soporta `children` con
  toggle desplegable.
- `app-header`: botón hamburguesa (solo móvil), etiqueta con `sessionStore.nameUser()`,
  avatar (`user.avatarUrl` con fallback a iniciales en círculo — sin imágenes externas) y
  botón de cerrar sesión (`sessionStore.logout()`). El avatar es un botón que resuelve su
  destino por el ítem `user-settings`: si está habilitado navega a `/configuracion`; mientras
  esté deshabilitado emite un toast informativo (`ToastService`) para no dejar el click sin
  respuesta (punto 3).
- `app-layout`: compone `<app-header>` + `<app-nav-menu>` + `<router-outlet />`; cierra el
  menú móvil al cambiar de ruta (`toSignal`/`NavigationEnd` o `(activate)`); incluye
  `skip-link` a contenido.
- Responsive mobile first:
  - `< 768px`: header sticky arriba (hamburguesa + nombre + avatar + logout); panel de menú
    desplegable bajo el header, animado con `opacity`/`transform` (nunca `height`/`top`),
    cierre con `Esc`, `aria-expanded`/`aria-controls`.
  - `>= 768px`: sidebar fija a la izquierda (`grid-template-columns: auto 1fr`) + header de
    escritorio. Los cambios de breakpoint se resuelven **solo con CSS**, sin `matchMedia`.
- Animación de entrada de bloques con el patrón de reveal ya usado (`translateY(12px)` +
  `opacity`, 600ms `--ease-out-quint`, `animation-delay: calc(var(--index) * 80ms)`) y
  bloque `@media (prefers-reduced-motion: reduce)`.

### Store del menú (decidido: NavStore)
`NavStore` mínima en `core/stores/navigation` con:
`items` (desde el mock), `enabledItems` (computed), `isMenuOpen` (signal), `toggle()` /
`close()`. Justificación: el estado "abierto/cerrado" lo produce el header (hamburguesa) y lo
consume el panel de `nav-menu`; además la lista de opciones la consumen también el layout y el
combobox de navegación rápida del dashboard. Evita `input`/`output` en cadena y deja una única
fuente de verdad. La alternativa descartada (estado local + `output()`) se evitó justamente por
ese reparto entre header, nav, layout y dashboard.

## 4. Routing (puntos 5 y 7)

```ts
// app.routes.ts
{ path: '', redirectTo: 'auth', pathMatch: 'full' },
{ path: 'auth', loadChildren: () => import('./features/auth/auth-routes').then(m => m.AUTH_ROUTES) },
{
  path: '',
  component: AppLayout,              // header + menú visibles en TODOS los módulos
  children: [
    { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard) },
    { path: '**', redirectTo: 'dashboard' },
  ],
},
```

- La ruta `dashboard` deja de colgar de `app.routes.ts`: `DASHBOARD_ROUTES` se elimina y el
  componente entra con `loadComponent` (dashboard lazy real, punto 7).
- `authGuard` **no** se registra ni se modifica (queda documentado el redirect erróneo a
  `/login`); la ruta del layout queda accesible sin sesión.
- No se crean páginas nuevas: las 4 opciones del menú no son enlaces muertos porque el
  componente las renderiza deshabilitadas y sin `routerLink`.

## 5. Vista Dashboard (punto 6)

`dashboard.ts` (documentado con JSDoc, como el resto del repo):
- `inject(BalanceStore)`, `inject(MovementsStore)`, `inject(NavStore)`, `inject(Router)`.
- `ngOnInit()` → `void balanceStore.getBalance(); void movementsStore.getMovements();`
- Helpers `formatAmount(value, currency)` (`Intl.NumberFormat`) y `formatDate(value)`.
- Estado de carga con `isLoading` de cada store; estados vacíos explícitos.

`dashboard.html` — grid tipo bento, mobile first:

1. **Resumen de balance (3 celdas)** — `income`, `outcome`, `available`:
   - Móvil: `available` a ancho completo como cifra protagonista; `income` y `outcome` en dos
     columnas. Escritorio: 3 columnas simétricas.
   - Semaforización con la paleta existente: `income` → `--pale-green`/`--pale-green-ink`,
     `outcome` → `--pale-red`/`--pale-red-ink`, `available` → `--pale-blue`/`--pale-blue-ink`
     (celda destacada, fondo `--surface`).
   - Caso sin data (`balanceStore.balance() === null`): etiqueta de valor nulo `—` con texto
     "Sin registros" en `--ink-muted`, sin semaforizar.
   - Importes con `--font-mono` y `font-variant-numeric: tabular-nums` (contraste tipográfico
     de la skill).
2. **Input de navegación rápida**: combobox accesible (botón disparador + listbox, filtro por
   texto, cierre con `Esc` y click fuera) alimentado por `navStore.enabledItems()` — la misma
   fuente que `nav-menu`. Con todas las opciones en `false` muestra su estado vacío ("Aún no
   hay opciones disponibles"); al habilitar un ítem, la selección navega con
   `router.navigateByUrl(item.route)` sin tocar el componente.
3. **Últimos movimientos** (computed de la store): `description`, `amount`, `type`, `currency`,
   `date`; badge de `type` semaforizado (income verde pastel / outcome rojo pastel). Estado
   vacío: "Aún no registras movimientos".
4. **Botón de acceso rápido** "Registrar movimiento" (CTA sólido `--ink`/`--ink-inverse`,
   radio 6px, `scale(0.98)` en `:active`). Su destino se resuelve por el ítem `movement-add`:
   habilitado → `/movimientos/nuevo`; deshabilitado → botón `disabled` con etiqueta
   "Próximamente", para no ofrecer una acción que todavía no existe.

`dashboard.scss`: `:host { display: block }`, `background-color: var(--canvas)`, tarjetas
`1px solid var(--border)` con `--radius-md`, sin sombras fuertes, whitespace generoso,
breakpoint en 768px y bloque de `prefers-reduced-motion`.

## 6. Cambios en las stores (permitidos por el Jit Loading del .md)

`BalanceStore` (sin romper lo existente):
- añadir computeds `hasBalance` (`!!store.balance()`) y `currency`
  (`store.balance()?.currency ?? 'USD'`).
- `income`, `outcome`, `availableBalance` siguen como están (valor numérico para formatear).

`MovementsStore`:
- añadir computed `latestMovements` = ordenar por `date` desc y tomar los últimos 5
  (configurable por constante `LATEST_MOVEMENTS_LIMIT`).
- opcional: computeds `hasMovements` e `isLoading` ya provisto por el estado.

## 7. Ajustes de soporte (decidido: solo lo bloqueante)

1. `@Injectable({ providedIn: 'root' })` en `BalanceApiService`, `MovementsApiService` y
   `AuthApiService` (**bloqueante** para que el dashboard muestre datos vía stores).
2. `app.config.ts`, `authGuard`, `authInterceptor` y `error.interceptor.ts`: **no se tocan**.
3. Fechas e importes en español sin tocar `app.config.ts`: los helpers del dashboard usan
   `Intl.NumberFormat('es-CO', { style: 'currency', currency })` e
   `Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })`.

## 8. Verificación (criterios de aceptación)

Comandos:
- `npx ng build` → compila sin errores; vigilar el budget `anyComponentStyle` (aviso 4kB /
  error 8kB).
- `npx ng test` → las specs existentes siguen pasando; se actualiza `dashboard.spec.ts`
  (provee stores/HttpClient y navegación) y se agregan specs mínimas de `nav-menu`,
  `app-header` y `app-layout` (patrón "should create" del repo).

Checklist funcional (navegador, con `useMock = true`):
- [ ] `/dashboard` renderiza con header + menú visibles; el dashboard carga balance y
      movimientos (mocks con 500 ms de delay) sin errores de DI en consola.
- [ ] Semaforización correcta: income verde, outcome rojo, available azul; sin datos muestra
      `—` y "Sin registros".
- [ ] Los 4 ítems del menú aparecen con icono y nombre, deshabilitados (`aria-disabled="true"`,
      sin `routerLink`, sin navegación). El estilo de opción seleccionada existe y se activa al
      marcar un ítem como `enabled: true`.
- [ ] Navegación rápida del dashboard: muestra el estado vacío mientras no haya ítems
      habilitados y redirige correctamente al habilitar uno en el mock.
- [ ] Botón "Registrar movimiento" se muestra `disabled` con "Próximamente" y navega a
      `/movimientos/nuevo` al habilitar el ítem.
- [ ] Móvil (<768px): hamburguesa abre/cierra el panel, `Esc` cierra, se cierra al navegar.
- [ ] Click en avatar: con `user-settings` habilitado navega a `/configuracion`; hoy, al estar
      deshabilitado, muestra un toast informativo (el click nunca queda sin respuesta).
- [ ] Cerrar sesión limpia la sesión y lleva a `/auth/login`.
- [ ] Escritorio (>=768px): sidebar visible, sin hamburguesa, sin desbordes horizontales.
- [ ] Sin emojis, sin gradientes, sin sombras fuertes, sin `rounded-full` en contenedores,
      tipografías y acentos pastel según `taste-skill.md`.
- [ ] `prefers-reduced-motion: reduce` desactiva las animaciones.

## 9. Orden de ejecución sugerido

1. Fix de DI (`@Injectable`) + locale en `app.config.ts` → desbloquea datos.
2. Modelo + mock + `app-icon` + `NavStore` (si se aprueba).
3. `nav-menu`, `app-header`, `app-layout`, routing (layout padre + `loadComponent` del
   dashboard; sin páginas nuevas ni guard).
4. Computeds nuevos en ambas stores.
5. Dashboard `.ts` / `.html` / `.scss`.
6. Specs + `npx ng build` + `npx ng test` + verificación manual en navegador (móvil y desktop).
