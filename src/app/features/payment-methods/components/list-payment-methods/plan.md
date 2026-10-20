# Plan — Módulo de administración de métodos de pago

Derivado de `src/app/features/payment-methods/components/list-payment-methods/instructions.md`.
Respeta `agents/skills/taste-skill.md` (minimalismo utilitario editorial, mobile first) y los
tokens de `src/styles.scss`. La sección 4 mapea cada punto del instructivo.

---

## 0. Estado actual (inventario)

| Archivo                                                        | Estado                    | Hallazgo                                                                                                                                                                                                       |
| -------------------------------------------------------------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `components/list-payment-methods/list-payment-methods.ts`      | **Stub**                  | Inyecta la store y nada más: sin `computed`, sin carga inicial ni acciones.                                                                                                                                    |
| `components/list-payment-methods/list-payment-methods.html`    | **Stub**                  | Solo `<p>list-payment-methods works!</p>`.                                                                                                                                                                     |
| `components/list-payment-methods/list-payment-methods.scss`    | **Vacío**                 | Sin estilos.                                                                                                                                                                                                   |
| `components/list-payment-methods/list-payment-methods.spec.ts` | **Insuficiente**          | Solo `should create`; pasa porque el template es un stub.                                                                                                                                                      |
| `payment-methods-routes.ts`                                    | **Contradice el punto 8** | `''` redirige a `nuevo`: el menú principal no puede abrir la lista.                                                                                                                                            |
| `src/app/app.routes.ts`                                        | Montado                   | `metodos-pago` cuelga del layout y carga `PAYMENT_METHODS_ROUTES`.                                                                                                                                             |
| `core/stores/paymentMethods/payment-method.store.ts`           | **Casi completa**         | Ya expone `paymentMethodsList`, `hasPaymentMethods`, `isLoading`, `error` y los tres métodos. `updatePaymentMethod` recibe `Partial<PaymentMethodRequest>` **sin id**. El toast de éxito ya lo emite la store. |
| `payment-methods-api.service.ts`                               | **Mock no persistente**   | `getPaymentMethods()` relee la constante, así que un update o delete exitoso no cambia nada. El `PUT` no lleva id ni filtro.                                                                                   |
| `models/payment-method.model.ts`                               | Correcto                  | `description` y `number` opcionales; el mapper los normaliza a `''`.                                                                                                                                           |
| `models/payment-method.mapper.ts`                              | Incompleto                | Tiene `toModel`, `toDto`, `toRequest` y `toModels`; falta el mapeo de actualización parcial.                                                                                                                   |
| `schemas/payment-methods.schemas.ts`                           | **Reutilizable tal cual** | Unión discriminada por `type` (16 / 20 / 16 opcional), `description: ''` válida y `trim()` en nombre/descripción. El modal de actualización reusa `paymentMethodSchema`.                                       |
| `shared/components/nav-menu/mocks/navigation-menu.mock.ts`     | Desactualizado            | `Métodos de pago` solo tiene la subhija `Agregar método de pago`.                                                                                                                                              |
| `shared/components/app-icon/app-icon.ts`                       | Incompleto                | No existen glifos de editar ni eliminar.                                                                                                                                                                       |
| `components/add-payment-method/*`                              | Referencia                | Formulario con Signal Forms, tope del número por tipo y diálogos CDK. Su `maskNumber()` privado se repetiría en la lista.                                                                                      |

Última verificación registrada del repo: `npx ng test --watch=false` → 155/155 en 25 archivos y
`npx ng build` → exit 0 (solo el warning heredado de `add-movement.scss`). No se ha ejecutado
desde que se escribió este plan.

---

## 1. Huecos priorizados

**P0 — bloquean los puntos 1, 3, 4, 5 y 8**

1. La vista no existe: html/scss vacíos y el `.ts` sin lógica.
2. La lista no es alcanzable desde el menú: `''` redirige a `nuevo`.
3. No hay subhija de menú que apunte a la lista.
4. El update no tiene identidad: `Partial<PaymentMethodRequest>` no incluye `id`, así que el
   servicio no sabe qué registro modificar.
5. El mock no persiste: tras eliminar, `getPaymentMethods()` devuelve otra vez el mismo array y la
   fila reaparece. Lo mismo con el update. La feature se vería rota aunque el toast diga “éxito”.

**P1 — completan la funcionalidad**

6. No hay modal de actualización con precarga y validación compartida.
7. No hay iconos de editar/eliminar en el registro de `app-icon`.
8. No hay mapeo de request parcial (solo campos cambiados).
9. Faltan estados de carga, error, vacío y reintento.
10. La tabla no tiene una lectura móvil armoniosa.
11. Sin specs reales de lista, modal, servicio mock ni mapper de update.

**P2 — coherencia**

12. `app.routes.spec.ts` y `nav-menu.spec.ts` afirman el redirect y la primera subhija actuales.
13. Copy del mock: “Metodo” sin tilde.
14. La store se traga un fallo del refresco posterior (`getPaymentMethods` captura y no propaga):
    un update/delete “exitoso” puede dejar la lista vieja. Se documenta, no se cambia en este alcance.

---

## 2. Contrato, store y mock (punto 6)

### 2.1 Identidad del update

Nuevo `models/update-payment-method-request.model.ts`:

```ts
import type { PaymentMethodRequest } from './add-payment-method-request.model';
import type { PaymentMethodModel } from './payment-method.model';

/**
 * Actualización parcial: el id identifica el registro y solo viajan los campos
 * que cambiaron. `Partial` evita mandar el objeto completo y sobrescribir con
 * valores viejos lo que el usuario no tocó.
 */
export type UpdatePaymentMethodRequest = Partial<PaymentMethodRequest> & {
  readonly id: PaymentMethodModel['id'];
};
```

- `PaymentMethodsStore.updatePaymentMethod(request: UpdatePaymentMethodRequest)`.
- `PaymentMethodsApiService.updatePaymentMethod(request: UpdatePaymentMethodRequest)`.
- El `Partial` sigue siendo la base (punto 6 del instructivo), ahora con `id` obligatorio.
- El tipo del `id` sale del modelo, no de un `number` fijo: si la tabla de Supabase usa `uuid`,
  solo cambia `PaymentMethodModel` y el request lo hereda.

### 2.2 Diff que viaja al API

`PaymentMethodMapper.toUpdateRequest(original, form)` compara contra el modelo cargado:

| Campo         | Regla                                                                                                              |
| ------------- | ------------------------------------------------------------------------------------------------------------------ |
| `id`          | Siempre presente.                                                                                                  |
| `name`        | Se envía con `trim()` solo si cambió.                                                                              |
| `type`        | Solo si cambió.                                                                                                    |
| `currency`    | Solo si cambió.                                                                                                    |
| `description` | Solo si cambió. Si quedó vacía se envía `''` (presente), para que el API pueda limpiarla; omitirla no la borraría. |
| `number`      | Solo si cambió. En Binance vaciarla envía `''`; en tarjeta/cuenta el schema impide vaciarla.                       |

Ni `undefined` ni claves ausentes para los campos que sí cambiaron: JSON descarta `undefined`, y
eso impediría limpiar la descripción.

### 2.3 Mock persistente en memoria

El objetivo es que la lista refleje de verdad el resultado de actualizar y eliminar. En
`PaymentMethodsApiService`:

```ts
/** Copia mutable del seed: el mock deja de ser una constante y pasa a ser estado. */
private readonly mockPaymentMethods: PaymentMethodDto[] = PAYMENT_METHODS_USER_MOCK.data.map(
  (dto) => ({ ...dto }),
);
```

- `getPaymentMethods()` devuelve una copia de `mockPaymentMethods` (no expone el array interno).
- `addPaymentMethod()` inserta con `id` nuevo y devuelve el mensaje actual.
- `updatePaymentMethod()` fusiona por `id`; si no existe, responde con error (así el modal conserva
  los datos y la store muestra el toast de error).
- `deletePaymentMethod()` filtra por `id`.
- El estado vive en la instancia del servicio: cada `TestBed` arranca limpio, sin contaminar otras
  pruebas. `PAYMENT_METHODS_USER_MOCK` se conserva como seed intacto.
- El `delay(500)` se mantiene para poder ver `isLoading`.

### 2.4 Contrato real (Supabase / PostgREST)

La app seguirá usando `HttpClient`, así que el servicio hablará con la Data API de Supabase
generada por PostgREST. **Sí acepta query params**: el filtro es la forma de apuntar a una fila, y
el `id` no se usa en el body para eso.

| Operación  | Request                                                                    |
| ---------- | -------------------------------------------------------------------------- |
| Listar     | `GET {SUPABASE_URL}/rest/v1/payment_methods?select=*&order=id.asc`         |
| Crear      | `POST .../payment_methods` + `Prefer: return=representation` (o `minimal`) |
| Actualizar | `PATCH .../payment_methods?id=eq.{id}` con **solo** los campos cambiados   |
| Eliminar   | `DELETE .../payment_methods?id=eq.{id}`                                    |

- Headers: `apikey: <publishable key>` siempre; `Authorization: Bearer <access_token de la sesión>`
  para que RLS evalúe al usuario; `Content-Type: application/json`.
- PostgREST exige un filtro en `PATCH` y `DELETE` (sin él apuntan a toda la tabla); por eso el `id`
  sigue en `UpdatePaymentMethodRequest`: el servicio lo usa para construir `?id=eq.{id}`.
- `PUT` **no** sirve para la actualización parcial: en PostgREST es un upsert que reemplaza la fila
  y exige todas las columnas obligatorias. Se usa `PATCH`.
- RLS: la tabla necesita políticas por `auth.uid()` y el token de la sesión debe viajar en la
  request. Hoy `authInterceptor` no está registrado (sección 8), así que es un requisito previo a
  la conexión real.
- Cuando exista el esquema real, `useMock` pasa a `false` y las URLs se arman con
  `environment`/`api-endpoints`; el mock se conserva para los tests.

Referencia: Data API de Supabase (PostgREST), `PATCH /rest/v1/<tabla>?id=eq.1`.

---

## 3. Propuesta técnica

### 3.1 Componente de lista (`list-payment-methods.ts`)

- `imports: [RouterLink, AppIcon]`.
- `implements OnInit` → `void this.paymentMethodsStore.getPaymentMethods()`.
- Lista por computed, como pide el punto 2:

```ts
/** Lista de métodos de pago; el computed vive en la store. */
protected readonly paymentMethods = this.paymentMethodsStore.paymentMethodsList;

/** Hay datos cargados y ninguno es el estado vacío. */
protected readonly hasPaymentMethods = this.paymentMethodsStore.hasPaymentMethods;
```

- Etiquetas: `PAYMENT_METHOD_TYPE_LABELS` para el tipo, `CURRENCY` tal cual.
- Presentación de opcionales con string por defecto (punto 3):
  - número: `maskPaymentMethodNumber()` → `•••• 1234` o `Sin número`;
  - descripción: `Sin descripción`.
- Acciones:
  - `onUpdate(method)`: `resetFeedback()` + `updateDialog.open(method)`.
  - `onDelete(method)`: `resetFeedback()` + confirmación + `deletePaymentMethod(method.id)`.
- Sin estado duplicado: loading, error y mensajes salen de la store.

### 3.2 Template: tabla que se lee como tarjetas en móvil

Un solo `<table>` semántico (punto 3) con `<caption>` accesible y `data-label` en cada celda:

| Columna     | Contenido                                                                                         |
| ----------- | ------------------------------------------------------------------------------------------------- |
| Método      | `name` + `#id` en mono atenuado (así el id del modelo también se muestra, sin una columna extra). |
| Tipo        | Chip pastel con `PAYMENT_METHOD_TYPE_LABELS[type]`.                                               |
| Número      | Enmascarado, mono.                                                                                |
| Moneda      | Mono, mayúsculas.                                                                                 |
| Descripción | Una línea con elipsis; `title` con el texto completo.                                             |
| Acciones    | Dos botones icono (editar y eliminar) con `aria-label` que incluye el nombre del método.          |

Estructura general:

1. Encabezado editorial: tag `Medios de pago`, `h1` serif “Métodos de pago”, subtítulo.
   Botón primario “Agregar método de pago” (`routerLink="/metodos-pago/nuevo"`): debajo del
   subtítulo en móvil, alineado a la derecha en escritorio.
2. Alerta de error de la store (`role="alert"`) con botón “Reintentar” que vuelve a llamar
   `getPaymentMethods()`.
3. `@if (isLoading() && !hasPaymentMethods())` → estado de carga (`role="status"`).
4. `@else if (!hasPaymentMethods())` → estado vacío en tarjeta con el CTA de alta.
5. `@else` → tabla.
6. Nota al pie con el total (`{{ paymentMethods().length }} métodos`) en mono.

Reflow móvil (una sola DOM, sin duplicar markup):

```scss
@media (max-width: 767px) {
  .methods__table,
  .methods__table tbody,
  .methods__table tr,
  .methods__table td {
    display: block;
  }

  .methods__table thead {
    /* visually hidden */
  }

  .methods__row {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: var(--space-2) var(--space-4);
    padding: var(--space-4);
    border-bottom: 1px solid var(--border);
  }

  .methods__cell {
    display: flex;
    justify-content: space-between;
    gap: var(--space-3);
  }

  .methods__cell::before {
    content: attr(data-label);
    /* label en micro-mayúsculas, --ink-muted */
  }
}
```

- El `thead` se oculta visualmente (no `display: none` en el `<table>`), y cada `td` aporta su
  etiqueta con `data-label`, de modo que la tarjeta se entienda sin encabezados.
- La celda de método ocupa las dos columnas y no lleva `data-label`; las acciones van al pie de la
  tarjeta, en fila y alineadas a la derecha.
- Objetivos táctiles de 44px en los botones de acción (móvil).
- Riesgo conocido: `display: block/grid` sobre elementos de tabla puede alterar la exposición de
  roles en algunos motores. Se verifica en navegador (checklist de la sección 5) y se mantiene el
  `<table>` real; si falla, se evalúa `role="table"` explícito o una lista móvil separada.

### 3.3 Estilos (`list-payment-methods.scss`)

- `:host` sobre `--canvas`; `.methods` con `max-width: 64rem`, padding `--space-4` en móvil.
- Tabla: borde 1px `--border`, radio `--radius-md`, fondo `--surface`; filas con divisor y hover
  `--surface-muted`; sin sombras.
- Tipografía: cabeceras en micro-mayúsculas con tracking, datos mono con `tabular-nums`, título en
  `--font-serif`, chips de tipo con pastel + tinta (azul tarjeta, verde cuenta, amarillo Binance).
- Botón primario sólido `--ink`; botones icono con borde `--border` y hover `--surface-muted`.
- Animación de entrada `translateY(12px)` + `opacity` con `--index` escalonado y
  `@media (prefers-reduced-motion: reduce)`.
- Presupuesto: `anyComponentStyle` avisa a 4 kB y falla a 8 kB. La lista debe quedar por debajo de
  4 kB; si no, se recorta antes de tocar `angular.json`.

### 3.4 Modal de actualización (punto 4)

Dos archivos nuevos en `components/update-payment-method-dialog/`:

- `update-payment-method-dialog.ts|html|scss`: el formulario.
- `update-payment-method-dialog.service.ts`: envoltorio de `Dialog` del CDK, igual que
  `ConfirmDialogService`.

```ts
protected readonly data = inject<UpdatePaymentMethodDialogData>(DIALOG_DATA);
private readonly dialogRef = inject<DialogRef<boolean>>(DialogRef);
private readonly store = inject(PaymentMethodsStore);

protected readonly model = signal(createPaymentMethodFormFromModel(this.data.paymentMethod));

protected readonly formTree = form(this.model, (path) => {
  validateStandardSchema(path, paymentMethodSchema);
});
```

- Precarga: nuevo `createPaymentMethodFormFromModel(model)` en
  `models/add-payment-method-form.model.ts` (se conserva el nombre del form para no tocar el alta).
- Campos editables: `name`, `type`, `description`, `number`, `currency`, con los mismos controles y
  reglas que el alta. El número reusa el tope por tipo y la sanitización (sección 3.5).
- Cambio de tipo: recorta el número al nuevo máximo, igual que en el alta.
- Envío: `submit(formTree, { action: save })`; `save()` mapea el diff
  (`toUpdateRequest`), llama `updatePaymentMethod` y, solo si devuelve `true`, `dialogRef.close(true)`.
  Si falla, el modal queda abierto con los datos y muestra `store.error()`.
- Botón “Guardar cambios” deshabilitado si el form es inválido, si `isLoading()` o si el form no
  está `dirty()` (nada que guardar). “Cancelar” cierra con `false`.
- Contadores y etiquetas reutilizados del alta (`n/50`, `n/16`, `n/20`, `n/100`).
- Servicio:

```ts
async open(paymentMethod: PaymentMethodModel): Promise<boolean> {
  const ref = this.dialog.open<boolean, UpdatePaymentMethodDialogData>(
    UpdatePaymentMethodDialog,
    {
      data: { paymentMethod },
      width: 'calc(100vw - 2rem)',
      maxWidth: '30rem',
      ariaLabel: 'Actualizar método de pago',
      ariaModal: true,
      autoFocus: '#update-name',
      restoreFocus: true,
    },
  );

  return (await firstValueFrom(ref.closed)) === true;
}
```

- Móvil: `:host` con `max-height: calc(100dvh - 2rem)` y `overflow-y: auto` para que el formulario
  nunca quede cortado en 390×844; acciones apiladas y fila desde 480px.

### 3.5 Utilidades compartidas y mapper

- Nuevo `utils/payment-method.util.ts`:
  - `maskPaymentMethodNumber(number?: string): string` → `•••• 1234` / `Sin número`.
  - `sanitizePaymentMethodNumber(value: string, type: PaymentMethodType): string` → solo dígitos y
    recorte al tope de `PAYMENT_METHOD_NUMBER_MAX_LENGTH`.
- `AddPaymentMethod` pasa a usar ambas (su `maskNumber()` privado y el cuerpo de
  `onNumberInput()`); sus 13 specs siguen siendo la red de seguridad de la refactorización.
- `PaymentMethodMapper.toUpdateRequest(original, form)` según la tabla de 2.2.
- Tipos del diálogo en `models/update-payment-method-dialog.model.ts`:

```ts
export interface UpdatePaymentMethodDialogData {
  readonly paymentMethod: PaymentMethodModel;
}
```

### 3.6 Routing y navegación (puntos 8 y 9)

`payment-methods-routes.ts`:

```ts
export const PAYMENT_METHODS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/list-payment-methods/list-payment-methods').then(
        (m) => m.ListPaymentMethods,
      ),
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./components/add-payment-method/add-payment-method').then((m) => m.AddPaymentMethod),
  },
];
```

`navigation-menu.mock.ts`: nuevo id `paymentMethodList` y dos subhijas en orden:

```ts
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
```

- El menú no navega al pulsar el padre (despliega); la lista se abre por la subhija o por la
  navegación rápida, que sí navega a `/metodos-pago` y ahora cae en la lista.
- `NavStore.selectItem` ya resuelve subhijas con `findItem`, así que no requiere cambios.
- `quick-nav` no requiere código: sigue listando las opciones habilitadas de primer nivel.
- Estado activo: en `/metodos-pago` el padre queda activo por `startsWith`; en
  `/metodos-pago/nuevo`, padre y subhija de alta.

### 3.7 Flujo de eliminar (punto 5)

Se reutiliza `ConfirmDialogService` (CDK): mensaje con el nombre del método, acciones
“Eliminar” / “Cancelar”, y `autoFocus: '.confirm__button--cancel'` para que el foco no caiga en la
acción destructiva.

```ts
const confirmed = await this.confirmDialog.ask(
  {
    title: 'Eliminar método de pago',
    content: {
      kind: 'message',
      message: `Se eliminará «${method.name}». Esta acción no se puede deshacer.`,
    },
    confirmLabel: 'Eliminar',
    cancelLabel: 'Cancelar',
  },
  { autoFocus: '.confirm__button--cancel' },
);
```

- Si confirma: `await this.paymentMethodsStore.deletePaymentMethod(method.id)`.
- El toast de éxito ya lo emite la store (`toastService.success(response.message)`); **no** se
  duplica en el componente (punto 5).
- Si falla: la store emite el toast de error y la lista muestra su alerta; la fila permanece.

### 3.8 Iconos

En `app-icon.ts` agregar `'pencil' | 'trash'` a `IconName` y sus `@case` en `app-icon.html`
(trazo 1.75, 24×24, sin relleno), coherentes con los glifos existentes.

---

## 4. Detalle por punto del instructivo

| Punto                                                        | Cómo se cubre                                                                                                                 |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| 1. Implementar html/scss/ts                                  | 3.1–3.3.                                                                                                                      |
| 2. Lista desde la store con un computed                      | `paymentMethodsStore.paymentMethodsList` expuesto como computed (3.1).                                                        |
| 3. Tabla con todos los valores + 2 acciones + default string | Columnas de 3.2; `#id` dentro de la celda Método; `Sin número` / `Sin descripción`; botones editar/eliminar con `aria-label`. |
| 4. Modal de actualización precargado                         | 3.4: mismos campos y schema del alta, diff parcial, error inline.                                                             |
| 5. Modal de eliminar simple + toast de éxito                 | 3.7: `ConfirmDialogService` + toast que ya emite la store.                                                                    |
| 6. Verificar store y API + `Partial`                         | Sección 2: `UpdatePaymentMethodRequest`, diff y mock persistente.                                                             |
| 7. Tabla armónica en móvil según taste skill                 | 3.2/3.3: reflow a tarjetas, una sola DOM, sin sombras ni gradientes.                                                          |
| 8. Ruta principal + botón “Agregar método de pago”           | 3.6: `''` = lista; CTA con `routerLink="/metodos-pago/nuevo"`.                                                                |
| 9. Routing del módulo, principal, menú y navegación rápida   | 3.6 + ajustes de specs; `quick-nav` funciona sin cambios.                                                                     |

---

## 5. Pruebas

| Spec                                   | Casos                                                                                                                                                                                                                                                                                                                                                                                                             |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `list-payment-methods.spec.ts`         | Carga al iniciar (`getPaymentMethods`); estado de carga; error + reintento; vacío con CTA; fila con todos los valores y defaults (`Sin número`, `Sin descripción`); número enmascarado; “Agregar método de pago” navega a `/metodos-pago/nuevo`; eliminar pide confirmación, no borra al cancelar y llama `deletePaymentMethod(id)` al confirmar; editar abre el modal precargado; las celdas traen `data-label`. |
| `update-payment-method-dialog.spec.ts` | Precarga los cinco campos; valida con el schema compartido; cambiar de cuenta (20) a tarjeta recorta a 16; guardar envía **solo** los campos cambiados + `id`; cancelar no llama a la store; un fallo deja el modal abierto con los datos; limpiar la descripción envía `''`.                                                                                                                                     |
| `payment-method.mapper.spec.ts`        | `toUpdateRequest`: sin cambios → `{ id }`; un campo cambiado; varios; `trim`; descripción vaciada → `''`; número de Binance vaciado → `''`.                                                                                                                                                                                                                                                                       |
| `payment-method.util.spec.ts`          | `maskPaymentMethodNumber` con número, vacío y `undefined`; `sanitizePaymentMethodNumber` con letras, exceso en 16 y en 20.                                                                                                                                                                                                                                                                                        |
| `payment-methods-api.service.spec.ts`  | Agregar aparece en el `getPaymentMethods` siguiente; update cambia el registro; delete lo quita; el seed exportado no se muta.                                                                                                                                                                                                                                                                                    |
| `app.routes.spec.ts`                   | `/metodos-pago` monta `app-list-payment-methods` dentro del layout (reemplaza la afirmación del redirect); `/metodos-pago/nuevo` sigue montando el alta.                                                                                                                                                                                                                                                          |
| `nav-menu.spec.ts`                     | La primera subhija es “Mis métodos de pago” y navega a `/metodos-pago`; la segunda sigue siendo el alta.                                                                                                                                                                                                                                                                                                          |
| `quick-nav.spec.ts`                    | Se mantiene: “Métodos de pago” navega a `/metodos-pago` (ahora abre la lista).                                                                                                                                                                                                                                                                                                                                    |

Comandos y criterios:

```bash
npx ng test --watch=false
npx ng build
npx prettier --check "src/app/features/payment-methods/**/*.{ts,html,scss}"
```

- Todas las specs en verde (155 actuales en 25 archivos + las nuevas).
- Build sin errores ni warnings nuevos; vigilar el presupuesto de estilos por componente.
- Sin dependencias nuevas.

Checklist manual (390×844 y 1280×800):

- [ ] `/metodos-pago` abre la lista dentro del layout, sin scroll horizontal.
- [ ] La tabla en móvil se lee como tarjetas, con etiquetas por celda y botones de 44px.
- [ ] “Mis métodos de pago” y “Agregar método de pago” aparecen en el menú; la primera navega a
      la lista y queda activa.
- [ ] La navegación rápida del dashboard abre la lista.
- [ ] Eliminar muestra el diálogo con foco en “Cancelar”; al confirmar desaparece la fila y sale el
      toast de éxito.
- [ ] Actualizar precarga los datos; cambiar a tarjeta recorta el número; al guardar cambia la fila
      y sale el toast.
- [ ] Un fallo del API deja la fila/modal intactos y muestra error.
- [ ] Tema claro/oscuro, `prefers-reduced-motion` y zoom de texto al 200% sin regresiones.
- [ ] Sin emojis, gradientes, sombras fuertes ni contenedores pill.

---

## 6. Decisiones confirmadas

| #   | Decisión               | Confirmado                                                                                                                                            |
| --- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| A   | Número en la lista     | **Enmascarado** (`•••• 1234`), igual que la confirmación del alta.                                                                                    |
| B   | Etiqueta de la subhija | **“Mis métodos de pago”**.                                                                                                                            |
| C   | Persistencia del mock  | **Sí**, en memoria de la instancia del servicio.                                                                                                      |
| D   | Backend                | **Supabase**: `PATCH /rest/v1/payment_methods?id=eq.{id}` con body parcial. La Data API filtra por query param; el id del body no selecciona la fila. |

Decisiones cerradas; la Fase 1 puede comenzar.

---

## 7. Fases de ejecución

### Fase 1 — Contrato, mapper y mock

- `models/update-payment-method-request.model.ts` y `models/update-payment-method-dialog.model.ts`.
- `createPaymentMethodFormFromModel()` en `add-payment-method-form.model.ts`.
- `PaymentMethodMapper.toUpdateRequest()`.
- Firma nueva en store y servicio; mock persistente por instancia.
- Specs del mapper y del servicio.

**Verificación:** tests de mapper y servicio en verde.

### Fase 2 — Lista y estilos

- `utils/payment-method.util.ts` y refactor del alta para consumirlo.
- `list-payment-methods.ts|html|scss` (secciones 3.1–3.3).
- Glifos `pencil` y `trash` en `app-icon`.
- `list-payment-methods.spec.ts` (sin los flujos de modal).

**Verificación:** tests de lista y del alta en verde; `ng build` sin warnings de presupuesto.

### Fase 3 — Modal de actualización

- `components/update-payment-method-dialog/*` + su servicio.
- Cableado de “Actualizar” en la lista y specs de integración del modal.

**Verificación:** tests del modal y de la lista en verde; build exit 0.

### Fase 4 — Rutas, menú y cierre

- `payment-methods-routes.ts` con la lista en `''`.
- `navigation-menu.mock.ts` con `paymentMethodList` como primera subhija.
- Ajustes en `app.routes.spec.ts` y `nav-menu.spec.ts`; verificación de `quick-nav.spec.ts`.
- Actualizar este plan con lo ejecutado y los resultados reales.

**Verificación final:** `npx ng test --watch=false`, `npx ng build`, Prettier; checklist manual
pendiente de ejecución en navegador.

---

## 8. Limitaciones que quedarán documentadas

- El mock persiste solo en memoria: recargar la página vuelve al seed.
- El contrato real se implementará contra Supabase (PostgREST); hasta que existan URL, clave y
  políticas RLS, el mock es la fuente de datos.
- Con RLS activo, sin `authInterceptor` ni token de sesión la Data API devuelve vacío o 401: hay que
  resolverlo antes de poner `useMock = false`.
- Si la tabla usa `uuid` como PK, `PaymentMethodModel['id']` cambia a `string`; el request de
  actualización lo hereda y no hay que tocar el tipo.
- La descripción vaciada viaja como `''`; si el backend interpreta `''` como “sin cambio” en vez de
  “limpiar”, habrá que acordar `null`.
- Si `getPaymentMethods()` falla después de un update/delete, la store igual reporta éxito (bug
  heredado); la lista queda con datos viejos y la alerta de error.
- El reflow de la tabla con `display` se valida en navegador; jsdom no calcula layout.
- `authInterceptor` sin registrar y layout sin `authGuard`: estado heredado de la app.
