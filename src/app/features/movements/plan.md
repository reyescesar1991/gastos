# Plan — Módulo de agregar movimiento

Derivado de `src/app/features/movements/instructions.md`. Todas las decisiones respetan
`agents/skills/taste-skill.md` (minimalismo utilitario editorial, mobile first) y los tokens ya
declarados en `src/styles.scss`. El detalle de cada punto del instructivo está en la sección 3.

---

## 0. Estado actual y huecos detectados

| Hallazgo | Impacto |
| --- | --- |
| `add-movement.html` es un stub (`<p>add-movement works!</p>`) y `add-movement.scss` está vacío | Puntos 1, 4, 8: toda la vista está por construir. |
| `add-movement.ts` ya trae `form()` + `validateStandardSchema` con Zod | Sirve de base: el mismo patrón que `login`/`register`, que ya está probado en el repo. |
| La señal del modelo se llama `loginForm` (copiado del login) | Punto 1 (tipado/legibilidad): renombrar a `movementForm`. |
| `amount` inicial es `0`, y el schema exige `min(0.01)` | El form arranca inválido y el botón nace deshabilitado; el punto 5 pide `1.00`. |
| No existe modelo de valores iniciales reutilizable | Punto 6: "limpiar" necesita una constante `INITIAL_MOVEMENT_FORM` para volver al mismo estado, no una copia inline. |
| No existe mapper `AddMovementForm` → `AddMovementRequest` | Punto 3: falta el mapeo (y el `Date` → ISO `YYYY-MM-DD`). |
| `addMovementSchema` no valida `category` en longitud y usa `.optional().default('')` | Punto 2: revisión del schema (sección 2). |
| Vocabulario de tipo divergente: el form/schema/request usa `'expense'`, el modelo de lectura (`Movement`, `MovementDto`) usa `'outcome'` | Punto 2/3: **decidido** — se alinea la lectura a `'expense'` (decisión A, sección 4). Toca modelo, DTO, mock, `movements-list` y 2 specs. |
| `MOVEMENTS_ROUTES` redirige a `'login'`, ruta que no existe (la real es `/auth/login`) | Punto 10: el redirect está roto; el módulo no tiene ninguna ruta real. |
| `app.routes.ts` no monta `movimientos` | Punto 10: sin registro, la opción del menú no navega a ninguna parte. |
| `NAVIGATION_MENU_MOCK` tiene `movementAdd` en `enabled: false` (placeholder del módulo dashboard) | Puntos 10: al no habilitarlo, ni el menú, ni la navegación rápida, ni el botón del dashboard funcionan. |
| `add-movement` no está en `spec` más allá del "should create" | Punto 1–7: falta cobertura de validación, mapeo, flujo post-guardado y limpiar. |
| `MovementsApiService` (core) importa `MOVEMENTS_MOCK` desde `features/dashboard/mocks/` | Inversión de capas heredada: el mock de movimientos pertenece al feature `movements` (su carpeta `mocks/` está vacía). Opcional, bajo riesgo. |
| `authInterceptor` existe pero **no** está registrado en `app.config.ts` (solo `apiUrlInterceptor`) | Fuera de alcance: con `useMock = true` no se necesita; se documenta como limitación. |
| No hay componente de modal en `shared/` (solo header, icon, nav-menu, toast-container) | Puntos 7 y 8: el modal hay que crearlo (sección 4, decisión B). |
| jsdom **no implementa** `HTMLDialogElement.showModal()` (`HTMLDialogElement-impl.js` está vacío) y el runner de tests es jsdom | Decisión B: el modal no puede ser un `<dialog>` nativo, o las specs no podrían abrirlo. |
| El subset de Signal Forms sí soporta `<input type="date">` con valor `Date` (usa `valueAsDate`) y jsdom implementa `valueAsDate` | La `date: z.date()` del schema es viable sin accessor propio: no hay que cambiar el modelo a `string`. |
| `FieldState.reset(value?)` existe pero **no** escribe el modelo (solo limpia `touched`/`dirty`) | Punto 6: limpiar = setear el modelo + `reset()`; con `reset(value)` solo no alcanza. |
| Budget `anyComponentStyle`: aviso 4 kB / error 8 kB | Los `.scss` nuevos deben mantenerse por debajo de 8 kB. |

**Punto de rotura conocido (una spec existente):** `dashboard.spec.ts` →
`'deja el acceso rápido deshabilitado con la etiqueta Próximamente'` no hace `patchState`: depende de
que el mock traiga `movementAdd` deshabilitado. Al habilitarlo hay que reescribir esa prueba para
forzar el estado (patrón que ya usa la prueba de navegación rápida vacía, mapeando `enabled: false`).

---

## 1. Archivos

```
src/app/features/movements/
  movements-routes.ts                          # reescribir: rutas reales del módulo
  models/
    add-movement-form.model.ts                 # existente: agregar INITIAL_MOVEMENT_FORM
    add-movement-request.model.ts              # existente, sin cambios
    add-movement.mapper.ts                     # NUEVO: form -> request
    movement-type.model.ts                     # NUEVO: etiquetas y semáforo por tipo del form
  mocks/
    movement-categories.mock.ts                # NUEVO: sugerencias de categoría (decisión C)
    movements.response.mock.ts                 # MOVER desde features/dashboard/mocks (opcional)
  schemas/movements.schemas.ts                 # ajustes de la sección 2
  components/add-movement/add-movement.(ts|html|scss|spec.ts)

src/app/shared/components/confirm-dialog/confirm-dialog.(ts|html|scss|spec.ts)  # NUEVO (decisión B)

src/app/app.routes.ts                          # montar `movimientos` en el layout
src/app/shared/components/nav-menu/mocks/navigation-menu.mock.ts   # movementAdd -> enabled: true
src/app/core/stores/movements/movements.store.ts                   # resultado de addMovement + limpieza de mensajes
src/app/core/models/movements/movement.model.ts                    # type: 'income' | 'expense' (decisión A)
src/app/core/models/movements/movement-dto.model.ts                # type: 'income' | 'expense' (decisión A)
src/app/features/dashboard/mocks/movements.response.mock.ts        # egreso -> 'expense' (decisión A)
src/app/features/dashboard/components/movements-list/movements-list.scss   # [data-type='expense']
src/app/features/dashboard/components/movements-list/movements-list.spec.ts
src/app/features/dashboard/dashboard.spec.ts                       # data-type + prueba del acceso rápido
src/app/app.routes.spec.ts                                         # (opcional) afirmar la ruta nueva
```

Nada de esto crea dependencias nuevas: **no** se instala ninguna librería de UI, iconos ni de
formularios.

---

## 2. Verificación del schema (punto 2)

Revisión de `schemas/movements.schemas.ts` tal como está hoy:

| Elemento | Estado | Observación |
| --- | --- | --- |
| `descriptionSchema` (3–100) | Correcto | Placeholders en los mensajes, igual criterio que `auth.schemas.ts`. |
| `amountSchema` (`number().min(0.01)`) | Correcto, ajustable | El mensaje dice "mayor que cero" y el mínimo es `0.01`: coherente. Opcional: `.finite()` y tope superior para descartar valores absurdos. |
| `movementTypeSchema` (`z.enum(['expense','income'])`) | Correcto | Es el vocabulario que queda como canónico tras la decisión A: `expense` en el request **y** en la lectura. |
| `categorySchema` (`string().optional().default('')`) | Ajustable | El `default('')` es redundante con `optional()` y, en Zod 4, el output pasa a ser `string` (no `undefined`). Además no tiene `max`. Propuesta: `z.string().trim().max(CATEGORY_MAX_LENGTH).optional()`. |
| `dateSchema` (`z.date()`) | **Correcto** | Compatible con `<input type="date">`: Signal Forms usa `valueAsDate` para inputs `date`/`month`/`time`/`week`, así que el modelo puede seguir siendo `Date` (verificado en `@angular/forms/fesm2022/signals.mjs` y en jsdom). No hace falta cambiar a `string`. |
| `addMovementSchema` (objeto + `validateStandardSchema(path, ...)` en la raíz) | Correcto | Mismo patrón que `login`/`register`: cada `issue` de Zod se reparte al campo que lo originó. |
| `DESCRIPTION_MAX_LENGTH` y `maxLength(path.description, ...)` en el componente | Redundante pero válido | Es el mismo patrón que ya usa `register` con `maxLength(path.password, ...)`: se deja por consistencia. |
| Falta | Nuevos | Constante `CATEGORY_MAX_LENGTH` para el tope del texto libre de categoría (decisión C). |

Ningún cambio rompe `auth.schemas.ts` ni los tests de auth: son archivos independientes.

---

## 3. Detalle por punto del instructivo

### Punto 1 — Vista `add-movement` (html, scss, ts), mobile first, con enviar, limpiar y redirección condicional

Estructura heredada de `login`/`register` (`.auth__card`, `.field`, `.field__label`,
`.field__input`, `.field__errors`, `.btn`) para no inventar un lenguaje visual nuevo, con los
tokens de `styles.scss`:

1. Encabezado con `h1` ("Registrar movimiento") y subtítulo de una línea.
2. **Tipo** (`type`): control segmentado con dos `radio` (Gasto / Ingreso) dentro de un fieldset con
   `legend`. Móvil: dos columnas iguales a ancho completo; escritorio: ancho de contenido. Es la
   única semaforización de color del formulario: Gasto `--pale-red`/`--pale-red-ink`, Ingreso
   `--pale-green`/`--pale-green-ink`, y el seleccionado cambia de tinta (no de tamaño).
3. **Importe + moneda**: input `type="number"` con `inputmode="decimal"` y `step="0.01"` en una fila
   con el `select` de moneda (`EUR | USD | USDT | VES`). `font-variant-numeric: tabular-nums`.
4. **Descripción**: `input type="text"` con `maxlength` y contador `n/100` en `--font-mono`
   (coherente con el contraste tipográfico de la skill).
5. **Fecha**: `input type="date"`. El modelo es `Date` y Signal Forms lo enlaza con `valueAsDate`.
6. **Categoría** (opcional): `input type="text"` con tope de longitud y un `datalist` de
   sugerencias (`features/movements/mocks/movement-categories.mock.ts`). Sigue siendo opcional: no
   se exige elegir una.
7. Pie de acciones, en móvil apilado al ancho completo y en escritorio en fila alineada a la derecha:
   - primario `Guardar movimiento` (`type="submit"`, sólido `--ink`/`--ink-inverse`, radio 6px,
     `scale(0.98)` en `:active`), `disabled` mientras el form sea inválido o `isLoading()`;
   - secundario `Limpiar` (`type="button"`), en `--surface` con borde 1px `--border`.
   - enlace de escape `Volver al resumen` (`routerLink="/dashboard"`).

Animación de entrada con el patrón ya usado (`translateY(12px)` + `opacity`, 600ms
`--ease-out-quint`, `animation-delay: calc(var(--index) * 80ms)`) y bloque
`@media (prefers-reduced-motion: reduce)`. Sin emojis, sin gradientes, sin sombras fuertes, sin
`rounded-full` en contenedores.

### Punto 2 — Validar el schema

Ver sección 2. Cambios propuestos acotados a `categorySchema` (tope de longitud y limpieza del
`default`) y a la decisión A sobre el vocabulario de `type`.

### Punto 3 — Obtener valores del form y mapearlos a `AddMovementRequest`

`models/add-movement.mapper.ts`, con el patrón estático ya establecido en `MovementMapper`:

```ts
export class AddMovementMapper {
  static toRequest(form: AddMovementForm): AddMovementRequest {
    return {
      amount: form.amount,
      description: form.description.trim(),
      date: toIsoDate(form.date),          // Date local -> 'YYYY-MM-DD' (sin desfase de huso)
      type: form.type,                     // 'expense' | 'income', el mismo vocabulario de la lectura
      category: form.category?.trim() || undefined,
      currency: form.currency,
    };
  }
}
```

`toIsoDate` debe construir la fecha con los componentes locales (`getFullYear`, `getMonth`,
`getDate`) y **no** con `toISOString()`: eso último convertiría a UTC y en husos negativos
(America/Caracas) registraría el día anterior. Es el mismo problema que ya documenta
`dashboard/utils/format.util.ts` en sentido inverso.

Spec propia del mapper (caso feliz, categoría vacía → `undefined`, y fecha sin desfase).

### Punto 4 — Validaciones HTML

- `novalidate` en el `<form>` (el mensaje lo da el schema, no el globo del navegador), igual que
  login/register.
- `required`, `min`, `max`, `maxlength`, `minlength`, `step="0.01"`, `inputmode` y
  `autocomplete="off"` en los campos que correspondan.
- `[attr.aria-invalid]` y `[class.field__input--invalid]` desde `touched() && invalid()`.
- Errores en `<ul class="field__errors" role="alert">` con `@for` sobre `errors()`, solo cuando el
  campo está tocado: mismo patrón exacto que `register.html`.
- `aria-describedby` apuntando al contador de descripción y al mensaje de cada campo.

### Punto 5 — Valores iniciales

```ts
export const INITIAL_MOVEMENT_FORM: AddMovementForm = {
  amount: 1,                    // 1.00 numérico (punto 5)
  description: '',
  date: today(),                // fecha de hoy, sin hora
  type: 'expense',              // "Gasto" por defecto
  category: undefined,          // opcional
  currency: 'USD',
};
```

Se exporta desde el modelo para que "Limpiar" (punto 6) y el estado inicial del componente usen la
misma fuente. Se renombra la señal del componente a `movementModel` y el árbol a `movementForm`.

### Punto 6 — Limpiar el form

```ts
protected onClear(): void {
  this.movementModel.set({ ...INITIAL_MOVEMENT_FORM, date: today() });
  this.movementForm().reset();      // limpia touched/dirty de todos los campos
  this.movementsStore.resetFeedback();
}
```

`reset(value)` **no** escribe el modelo (lo dice la propia API de `FieldState`), así que el par
"setear el modelo + `reset()`" es lo que deja el formulario limpio *y* con los validadores activos
(el `invalid()` se recalcula solo). La fecha se recalcula en el momento de limpiar, no se congela al
importar el módulo.

### Punto 7 — Tras guardar: ¿agregar otro?

Flujo posterior al `addMovement` exitoso: se abre el segundo modal con
"Movimiento registrado. ¿Quieres agregar otro?" y dos acciones:
- **Agregar otro** → limpiar (punto 6) y cerrar el modal, con el foco puesto en el primer campo.
- **Ir al dashboard** → `router.navigate(['/dashboard'])`.

Por eso `MovementsStore.addMovement` debe devolver `Promise<boolean>` (hoy atrapa el error y no
informa el resultado, así que el componente no puede distinguir éxito de fallo sin leer
`store.error()`). Se mantienen intactos el `patchState`, el `getMovements()` posterior y los toasts.

### Punto 8 — Modal de confirmación antes de agregar

> **Estado final:** esto se resolvió con `@angular/cdk` (Dialog) y un contenido de tipo
> resumen-o-mensaje, no con el overlay propio que describía este apartado. Ver el desvío 4 en la
> sección 7.

`submit()` de Signal Forms valida y marca tocados; al ser válido se **abre la confirmación en vez
de llamar a la API**. El modal muestra el resumen ya mapeado (importe formateado con su moneda,
etiqueta de tipo, fecha formateada, descripción y categoría) para validar los valores antes de
enviar. Confirmar → `movementsStore.addMovement(request)`; cancelar → cierra y devuelve el foco al
botón de envío, sin tocar los datos.

El modal **no** puede ser un `<dialog>` nativo: jsdom no implementa `showModal()` y las specs no
podrían abrirlo ni cerrarlo. Se implementa como overlay propio:

- `role="dialog"`, `aria-modal="true"`, `aria-labelledby`/`aria-describedby`.
- Foco al primer control al abrir, `Esc` cierra, `Tab` circula dentro (focus trap mínimo), foco
  devuelto al disparador al cerrar, y `cerrar al hacer click en el scrim`.
- Overlay con `rgba` de tinta cálida (sin negro absoluto), tarjeta `--surface` con borde 1px
  `--border` y `--radius-md`; animación de entrada de 200ms solo con `opacity`/`transform`.

Se reutiliza la **misma** pieza para los dos usos (confirmar valores y preguntar si agrega otro),
parametrizada por título, mensaje, etiquetas y tono.

### Punto 9 — Store de movimientos

Cambios acotados en `core/stores/movements/movements.store.ts`:
- `addMovement` devuelve `Promise<boolean>` (`true` con respuesta del API, `false` en el `catch`),
  conservando toasts y `patchState`.
- Nuevo método `resetFeedback()` para limpiar `error`/`successMessage` al limpiar el formulario o al
  encadenar otro movimiento (si no, el banner de éxito anterior sigue visible).
- `isLoading` sigue gobernando el estado del botón de envío; no se agrega estado duplicado.

El componente **no** llama al API ni guarda `movement` en estado local: todos los eventos
(confirmar, limpiar, reintentar) pasan por la store.

### Punto 10 — Routing, menú y navegación rápida

`movements-routes.ts` (hoy: redirect roto a `'login'`):

```ts
export const MOVEMENTS_ROUTES: Routes = [
  { path: '', redirectTo: 'nuevo', pathMatch: 'full' },
  { path: 'nuevo', loadComponent: () => import('./components/add-movement/add-movement').then((m) => m.AddMovement) },
];
```

`app.routes.ts`, dentro de los `children` del layout y **antes** del comodín:

```ts
{
  path: 'movimientos',
  loadChildren: () => import('./features/movements/movements-routes').then((m) => m.MOVEMENTS_ROUTES),
},
```

`navigation-menu.mock.ts`: `movementAdd` pasa a `enabled: true` y su `route` (`/movimientos/nuevo`)
ya coincide con la ruta real. No hay que tocar `nav-menu`, `app-header`, `quick-nav` ni el botón del
dashboard: los cuatro ya resuelven la opción contra `NavStore`, así que quedan habilitados solos
(menú con estilo de opción seleccionada, navegación rápida con filtro y acceso rápido sin
"Próximamente"). `movementList` ("Ver movimientos") sigue en `false`: este módulo no incluye la
vista de listado.

Se evalúa mover `MOVEMENTS_MOCK` a `features/movements/mocks/` para corregir la dependencia
core → feature (hoy `MovementsApiService` importa el mock del feature dashboard). Bajo riesgo: el
mock solo lo consume ese servicio.

---

## 4. Decisiones (confirmadas)

**A. Vocabulario del tipo (`expense` vs `outcome`). — Resuelta: se alinea la lectura a `'expense'`.**
El formulario, el schema y `AddMovementRequest` ya usan `'income' | 'expense'`; `'outcome'` es el
vocabulario heredado del modelo de lectura. Cambios (contrato único, sin traducciones):

- `core/models/movements/movement.model.ts` y `movement-dto.model.ts`: `type: 'income' | 'expense'`.
- `MovementMapper`: no cambia (copia el campo tal cual).
- `features/dashboard/mocks/movements.response.mock.ts`: el movimiento de egreso pasa a
  `type: 'expense'`.
- `movements-list.scss`: el selector `[data-type='outcome']` pasa a `[data-type='expense']`.
- Specs que cambian: `movements-list.spec.ts` (`type` del fixture y el `data-type`) y
  `dashboard.spec.ts` (aserción de `data-type`).

**No se toca** el balance: `income`/`outcome`/`available` son el contrato del resumen (punto 6.1 del
instructivo del dashboard) y `outcome` ahí es un importe, no un tipo de movimiento.

**B. Ubicación del modal. — Resuelta: `shared/components/confirm-dialog/`.**
UI genérica y sin lógica de negocio, reutilizable por los dos usos del flujo y por módulos
futuros; es la misma convención que ya sigue `shared/` con `app-icon` y `toast-container`.

**C. Categoría. — Resuelta: texto libre con sugerencias.**
`input` de texto (`CATEGORY_MAX_LENGTH`) más `datalist` alimentado por
`features/movements/mocks/movement-categories.mock.ts`: orienta sin obligar a elegir una categoría
de la lista, y la categoría sigue siendo opcional en el schema.

---

## 5. Verificación (criterios de aceptación)

Comandos:
- `npx ng build` → sin errores; vigilar `anyComponentStyle` (aviso 4 kB / error 8 kB) en el `.scss`.
- `npx ng test` → las 19 specs actuales siguen verdes y se agregan las nuevas.

Specs nuevas / ajustadas:
- `add-movement.spec.ts`: el form arranca con los valores iniciales del punto 5; el botón está
  deshabilitado con el form inválido y se habilita al completarlo; enviar válido abre el modal (y
  **no** llama a la store); confirmar llama `addMovement` con el request mapeado; "Agregar otro"
  limpia el form y reactiva los validadores; "Ir al dashboard" navega a `/dashboard`; cancelar no
  envía ni pierde datos; "Limpiar" vuelve a los valores iniciales y deja los validadores operativos.
- `add-movement.mapper.spec.ts`: mapeo completo, `category` vacía → `undefined` y fecha sin desfase.
- `confirm-dialog.spec.ts`: abre, `Esc` cierra, confirmar y cancelar emiten.
- `dashboard.spec.ts`: reescribir la prueba del acceso rápido deshabilitado para forzar el estado
  del ítem (ya no alcanza con el mock), actualizar la aserción de `data-type` a `'expense'` y
  agregar el caso de navegación a `/movimientos/nuevo`.
- `movements-list.spec.ts`: fixture con `type: 'expense'` y `data-type` esperado en `'expense'`.
- `app.routes.spec.ts` (opcional): `/movimientos/nuevo` monta `app-add-movement` dentro del layout.

Checklist funcional en navegador (móvil <768px y escritorio):
- [ ] `/movimientos/nuevo` renderiza dentro del layout, sin desbordes horizontales.
- [ ] En el menú, "Agregar movimiento" está habilitado y queda marcado como opción activa al estar
      en la ruta; en Configuración de usuario (habilitada) también se marca la suya.
- [ ] La navegación rápida del dashboard encuentra "Agregar movimiento" y navega al formulario.
- [ ] El botón "Registrar movimiento" del dashboard ya no dice "Próximamente" y navega al form.
- [ ] Valores iniciales: moneda USD, importe 1.00, tipo Gasto, fecha de hoy, categoría vacía.
- [ ] El modal de confirmación resume los valores reales y respeta `Esc`.
- [ ] Guardar con éxito ofrece "agregar otro" (form limpio y válido) o ir al dashboard.
- [ ] Un error del API muestra el toast y el banner, y deja el formulario utilizable.
- [ ] Sin emojis, sin gradientes, sin sombras fuertes y acentos pastel según `taste-skill.md`.
- [ ] `prefers-reduced-motion: reduce` desactiva las animaciones.

Limitaciones que quedan documentadas (no fallas):
- Los datos siguen siendo mock (`useMock = true` en `MovementsApiService`); al agregar, la lista que
  se relee es la del mock y no incluye el movimiento nuevo.
- `authInterceptor` no está registrado en `app.config.ts` ni el layout está protegido por
  `authGuard`, así que el formulario es alcanzable sin sesión: es el estado heredado de la app, no
  algo que introduzca este módulo.

---

## 6. Orden de ejecución sugerido

1. Alineación del vocabulario (decisión A): modelo, DTO, mock, `movements-list.scss` y sus dos
   specs. Va primero porque toca código ya entregado y conviene dejar la suite verde antes de
   seguir.
2. Schema (sección 2) + `INITIAL_MOVEMENT_FORM` + `movement-type.model.ts` + mapper y su spec.
3. Store: `addMovement` con resultado y `resetFeedback()`.
4. `shared/components/confirm-dialog` con su spec.
5. `add-movement.ts` (renombres, submit, limpiar, flujo de los puntos 7 y 8) y luego `.html` y `.scss`.
6. Routing: `movements-routes.ts`, `app.routes.ts` y habilitar `movementAdd` en el mock.
7. Ajustar `dashboard.spec.ts`; agregar specs del formulario y de rutas.
8. `npx ng build` + `npx ng test` + verificación manual en navegador (móvil y escritorio).

---

## 7. Estado de implementación (desvíos respecto del plan)

Implementado y verificado. Diferencias con lo planificado, cada una por una razón concreta:

1. **`format.util.ts` se movió** de `features/dashboard/utils/` a `shared/utils/` (y se le sumó
   `toIsoDate`, con sus specs). El registro necesita el mismo formato de importes y fechas que el
   resumen; duplicarlo habría duplicado la configuración de `Intl` y el manejo del huso horario.
   Implicó actualizar tres imports y los dos `git mv` de la utilidad y su spec.
2. **`INITIAL_MOVEMENT_FORM` es una fábrica** (`createInitialMovementForm()`), no una constante: una
   constante habría congelado la fecha de hoy en la carga del módulo, y "Limpiar" habría devuelto
   ayer si la app queda abierta pasada la medianoche.
3. **`AddMovementForm.category` es `string`**, no `category?: string`. Un campo opcional vuelve
   opcional su nodo en el árbol de Signal Forms (habría que comprobar `undefined` en cada acceso
   desde el template) y un `undefined` en un `input` de texto termina pintándose como el texto
   "undefined". La opcionalidad se conserva donde importa: `AddMovementRequest.category?`.
4. **El diálogo se reescribió sobre `@angular/cdk` (decide el usuario, segunda iteración).** El
   overlay propio —listeners de documento, trap de foco, velo y restauración a mano— se reemplazó
   por `Dialog` del CDK: overlay, trap, `Escape`, velo y devolución del foco vienen resueltos, y el
   contenido quedó sin un solo listener propio. Además el contenido pasó a ser una **unión
   discriminada por `kind`**: `facts` (resumen campo-valor, con mensaje de contexto opcional) o
   `message` (un mensaje a secas), así que el mismo diálogo sirve para revisar valores y para
   preguntar algo. Detalles:
   - `ConfirmDialogService.ask(data)` devuelve `Promise<boolean>`, así que el consumo es
     `if (await ask(...))`; el componente ya no mantiene estado de apertura.
   - El foco vuelve a donde estaba por defecto y, en el paso "registrar otro", a `#description` vía
     `restoreFocus: '#description'`, lo que eliminó el `viewChild` y el foco manual del componente.
   - Se retiró el input `tone` (y su equivalente en datos): el semáforo ahora viaja por `fact.tone`
     y la tipografía monoespaciada por `fact.mono`.
   - El velo se repinta con el token `--scrim` sobre `.cdk-overlay-dark-backdrop`; los estilos
     estructurales del overlay entran por `@include cdk.overlay()` en `styles.scss`.
   - Nueva dependencia: `@angular/cdk@^22.2.3` (misma línea de versiones que Angular). Se descartó
     Angular Material: trae tema y tipografía propios que chocan con la paleta de tokens y con
     `taste-skill.md`.
5. **Validaciones HTML:** el compilador de Signal Forms **prohíbe** (`NG8022`) los atributos nativos
   de validación en nodos con `[formField]` (`min`, `maxlength`). Se quitaron y la regla vive en el
   schema (`amountSchema.min()`, `maxLength(path.description, …)`, `categorySchema.max()`), que es
   además lo que muestra los mensajes; el template conserva `step`, `inputmode` y los contadores.
6. **Vocabulario centralizado:** se agregaron `MovementType` y `MovementCurrency` en
   `core/models/movements/movement.model.ts` y los consumen modelo, DTO, formulario, request y
   schema (con `satisfies`). Agregar un tipo en un lado sin el otro ya no compila.
7. **Mensajes del schema:** `number`, `date` y los `enum` llevan `{ error: … }`. Sin eso, vaciar el
   importe o la fecha mostraba el error por defecto de Zod en inglés, porque un input vacío entrega
   `null` y no un valor del tipo esperado. `categorySchema` quedó sin el `.default('')` redundante y
   con tope de 60 caracteres.
8. **El mock de movimientos no se movió** de `features/dashboard/mocks/`: la corrección de la
   dependencia core → feature que menciona la sección 3 queda pendiente.
9. **Presupuesto de estilos:** `add-movement.scss` genera 5,39 kB (aviso a 4 kB, error a 8 kB;
   bajó desde 6,01 kB al mudarse el resumen al diálogo). El build pasa; bajarlo pediría extraer los
   primitivos de formulario (`.field*`, `.btn*`) que hoy se repiten en las pantallas de auth y en
   este módulo a un parcial compartido.
10. **Specs existentes ajustadas** por el cambio de vocabulario (`movements-list`, `dashboard`) y por
    habilitar el ítem del menú (`nav-menu`, `quick-nav`), más dos casos nuevos en `app.routes`.

Verificación final: 125 specs en verde, `ng build` sin errores y 47 comprobaciones en Chrome real
(390×844 y 1280×800) con entrada real del navegador para los clics y `Escape`, incluidas la
semaforización, los dos diálogos del CDK (rol, `aria`, velo y ancho), el resumen campo-valor, el
foco de ida y vuelta (entrada por la acción principal, vuelta al disparador y al primer campo tras
"registrar otro"), el flujo completo de guardado, el estado activo del menú, la navegación rápida y
el tema oscuro.
