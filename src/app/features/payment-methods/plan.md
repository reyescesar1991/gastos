# Plan — Módulo de agregar método de pago

Derivado de `src/app/features/payment-methods/instructions.md`. Respeta
`agents/skills/taste-skill.md` (minimalismo utilitario editorial, mobile first) y los tokens de
`src/styles.scss`. El detalle de cada punto del instructivo está en la sección 4.

---

## 0. Estado actual (inventario de lo ya implementado)

| Archivo | Estado | Hallazgo |
| --- | --- | --- |
| `components/add-payment-method/add-payment-method.html` | **Stub** | Solo `<p>add-payment-method works!</p>`. Puntos 1 y 4: toda la vista está por construir. |
| `components/add-payment-method/add-payment-method.scss` | **Vacío** | Sin estilos. |
| `components/add-payment-method/add-payment-method.ts` | Parcial | Ya tiene `form()` + `validateStandardSchema`, el submit y el flujo de diálogos. Le faltan imports, opciones, tope del número, estado de guardado y etiquetas. |
| `components/add-payment-method/add-payment-method.spec.ts` | **Insuficiente** | Solo `should create`; pasa porque el template es un stub. No cubre nada del flujo. |
| `schemas/payment-methods.schemas.ts` | **Con defectos** | El `number` es un `z.union` sin relación con `type`; `description: ''` no valida; los mensajes hablan de “movimiento”/“nombre”. Ver sección 2. |
| `models/add-payment-method-form.model.ts` | Correcto | Fábrica de valores iniciales (`type: 'account'`, `currency: 'USD'`). |
| `models/add-payment-method-request.model.ts` | Correcto | `number` y `description` opcionales, coherente con el API. |
| `models/payment-method.model.ts` | Correcto | `PaymentMethodType` y `PaymentMethodCurrency` ya centralizan los enums. |
| `models/payment-method.dto.ts` | Correcto | Espejo del contrato. |
| `models/payment-method.mapper.ts` | Mejorable | `toRequest` recibe `Omit<PaymentMethodModel, 'id'>` (no el form) y convierte vacíos en `''` en vez de `undefined`. Sin spec. |
| `mocks/payment-methods.response.mock.ts` | **Código muerto retirado** | `TYPE_PAYMENT_METHODS_API_RESPONSE_MOCK` no lo consumía nadie; no hay endpoint de tipos en el servicio. Ya se eliminó y el archivo (renombrado desde `type-payment-methods.mock.ts`) queda solo con `PAYMENT_METHODS_USER_MOCK`. |
| `payment-methods-api.service.ts` | Correcto (mock) | `getPaymentMethods()` y `addPaymentMethod()` con `useMock = true` y `delay(500)`. El POST mock no persiste. |
| `core/stores/paymentMethods/payment-method.store.ts` | **Completa** | `getPaymentMethods`, `addPaymentMethod(): Promise<boolean>`, `resetFeedback`, `isLoading`, `error`, `successMessage` y computeds. No necesita cambios funcionales. |
| `payment-methods-routes.ts` | Correcto | `'' → 'nuevo'` y `nuevo` con `loadComponent`. |
| `src/app/app.routes.ts` | **Sin montar** | No existe la ruta `metodos-pago`. Punto 6 pendiente. |
| `shared/components/nav-menu/mocks/navigation-menu.mock.ts` | Pendiente | `paymentMethodAdd` está en `enabled: false` con la ruta correcta (`/metodos-pago/nuevo`). |
| `shared/components/nav-menu/nav-menu.spec.ts` | A ajustar | Afirma que hay **dos** opciones deshabilitadas; al habilitar métodos de pago queda una. |
| `app.routes.spec.ts` | A ampliar | No conoce el módulo. |

**Verificado ahora:** `npx ng build` → exit 0 (solo el warning heredado de `add-movement.scss` a
5,39 kB) y la spec actual del componente pasa (1/1) porque no renderiza campos. Es decir: hoy el
módulo compila, pero no existe como pantalla ni está enlazado.

---

## 1. Huecos priorizados

**P0 — bloquean el punto 1/4/5/6 del instructivo**

1. Template y estilos vacíos.
2. El tope del número no depende del tipo: hoy `z.union([card(16), account(20)])` acepta 20 dígitos
   en una tarjeta.
3. `description` opcional rechaza el string vacío (`min(3)` sin aceptar `''`), así que el formulario
   nace inválido.
4. No hay ningún tope de tecleo en el HTML (y el compilador de Signal Forms **prohíbe**
   `maxlength`/`minlength` en nodos con `[formField]`; ver 3.2).
5. La ruta no está montada en `app.routes.ts`.

**P1 — completan la lógica y la calidad**

6. `imports: []` no incluye `FormField` (el template con `[formField]` no compilaría).
7. Faltan opciones para pintar: tipos, monedas y etiquetas legibles; hoy el diálogo muestra
   `card`/`account` crudos.
8. No se expone `isLoading` para bloquear el submit mientras guarda.
9. El foco tras “registrar otro” apunta a `#description`; el primer campo será `#name`.
10. Mapper sin `trim`, sin spec, y con el tipo de entrada incorrecto.
11. Mensajes del schema copiados de movimientos.

**P2 — coherencia con el resto de la app**

12. Habilitar `paymentMethodAdd` en el menú y ajustar su spec.
13. Resolver el mock de tipos sin uso.
14. Actualizar `app.routes.spec.ts`.

---

## 2. Revisión del schema (punto 2 del instructivo)

| Elemento | Estado | Acción |
| --- | --- | --- |
| `nameSchema` (3–50) | Correcto | Agregar `.trim()` para que un nombre de solo espacios no pase. |
| `descriptionSchema` (3–100, `.optional()`) | **Roto para el form** | El modelo es `string` y arranca en `''`; `optional()` solo acepta `undefined`. Aceptar vacío: `z.string().trim().max(100).refine(v => v === '' || v.length >= 3, 'Mínimo 3 caracteres')`. El mapper convierte `'' → undefined`. |
| `cardNumberSchema` | **Aislado del tipo** | Hoy se usa dentro de un `z.union`: una tarjeta con 20 dígitos pasa como cuenta. Debe depender de `type`. |
| `accountNumberSchema` | Igual | Mismo problema. |
| `number` en el objeto | `.optional()` ambiguo | La opcionalidad depende del tipo: obligatorio en `card`/`account` (16 y 20 exactos), opcional en `binance` (si se completa, 16 exactos). |
| Mensajes | Copiados | “Ingresa un nombre” en los números y “Describe el movimiento” en la descripción. Corregir el copy. |
| `currencySchema` / `typeSchema` | Correctos | Reutilizar `CURRENCY_TYPE` y `TYPE_PAYMENT_METHOD` con `satisfies`. |
| Constantes de longitud | Correctas | `CARD_NUMBER_LENGTH = 16`, `ACCOUNT_NUMBER_LENGTH = 20`. Agregar un mapa por tipo reutilizable por el componente. |

**Propuesta de schema (unión discriminada por `type`):**

```ts
const digits = z
  .string({ error: 'Ingresa el número' })
  .min(1, 'Ingresa el número')
  .regex(/^\d+$/, 'Debe contener solo números');

const baseShape = {
  name: nameSchema,
  description: descriptionSchema,
  currency: currencySchema,
};

const cardSchema = z.object({
  ...baseShape,
  type: z.literal('card'),
  number: digits.length(CARD_NUMBER_LENGTH, `Debe tener ${CARD_NUMBER_LENGTH} dígitos`),
});

const accountSchema = z.object({
  ...baseShape,
  type: z.literal('account'),
  number: digits.length(ACCOUNT_NUMBER_LENGTH, `Debe tener ${ACCOUNT_NUMBER_LENGTH} dígitos`),
});

// Vacío permitido; si se completa, 16 dígitos (tarjeta de Binance).
const binanceNumberSchema = z
  .string()
  .refine((value) => value === '' || /^\d+$/.test(value), 'Debe contener solo números')
  .refine(
    (value) => value === '' || value.length === CARD_NUMBER_LENGTH,
    `Debe tener ${CARD_NUMBER_LENGTH} dígitos`,
  );

const binanceSchema = z.object({
  ...baseShape,
  type: z.literal('binance'),
  number: binanceNumberSchema,
});

export const paymentMethodSchema = z.discriminatedUnion('type', [
  cardSchema,
  accountSchema,
  binanceSchema,
]);
```

`validateStandardSchema(path, paymentMethodSchema)` reparte cada `issue` a su campo por `path`
(comprobado en `@angular/forms/fesm2022/signals.mjs`), así que la unión no rompe el mapeo de errores.

**Constantes compartidas** (en `models/payment-method.model.ts` o en el schema):

```ts
export const PAYMENT_METHOD_NUMBER_MAX_LENGTH = {
  card: CARD_NUMBER_LENGTH,       // 16
  account: ACCOUNT_NUMBER_LENGTH, // 20
  binance: CARD_NUMBER_LENGTH,    // 16: tarjeta de Binance, opcional
} as const satisfies Record<PaymentMethodType, number>;
```

---

## 3. Propuesta técnica

### 3.1 Componente (`add-payment-method.ts`)

- `imports: [FormField, RouterLink]`.
- Exponer al template:
  - `typeOptions` con etiqueta y valor (`Tarjeta de crédito`, `Cuenta bancaria`, `Binance`).
  - `currencies = CURRENCY_TYPE`.
  - `isSaving = this.paymentMethodsStore.isLoading`.
  - `numberMaxLength` (`computed` según `paymentMethodModel().type`: 16 / 20 / 16).
  - `numberLabel` y `numberRequired` (`computed`; en `binance` el campo es opcional).
  - `nameMaxLength`, `descriptionMaxLength`, `numberMaxLength` para los contadores.
- Regla del número:
  1. Zod es la fuente de verdad (16 exactos en tarjeta, 20 exactos en cuenta y 16 exactos
     opcionales en Binance).
  2. El HTML limita el tecleo con `(input)` + `(beforeinput)` (ver 3.2).
  3. Al cambiar de tipo, sanitizar y truncar el número existente al nuevo tope.
- `factsOf()` con etiquetas legibles y número enmascarado (`•••• 1234`).
- `restoreFocus: '#name'` en el diálogo de “registrar otro”.
- `onClear()` se mantiene: modelo inicial + `reset()` + `resetFeedback()`.
- Sin estado de UI duplicado: loading y errores salen de la store.

### 3.2 Tope de tecleo: restricción real del compilador

El compilador de Signal Forms marca como no soportados los bindings nativos `maxlength`,
`minlength`, `required`, `min`, `max`, `pattern`, `value` y `checked` en un nodo con `[formField]`
(`unsupportedBindingFields` en `@angular/compiler`). Por eso **no se puede** poner
`maxlength="16"` ni `[attr.maxlength]`.

Alternativa que sí funciona y cumple el punto 5:

```html
<input
  id="number"
  type="text"
  inputmode="numeric"
  autocomplete="off"
  [formField]="paymentMethodForm.number"
  (beforeinput)="onNumberBeforeInput($event)"
  (input)="onNumberInput($event)"
/>
```

```ts
/** Bloquea la inserción que superaría el tope del tipo actual. */
protected onNumberBeforeInput(event: InputEvent): void {
  if (event.inputType.startsWith('delete') || event.data === null) {
    return;
  }

  const input = event.target as HTMLInputElement;
  const selected = (input.selectionEnd ?? 0) - (input.selectionStart ?? 0);

  if (input.value.length - selected + event.data.length > this.numberMaxLength()) {
    event.preventDefault();
  }
}

/** Respaldo para pegado/autocompletado: deja solo dígitos y recorta al tope. */
protected onNumberInput(event: Event): void {
  const input = event.target as HTMLInputElement;
  const value = input.value.replace(/\D/g, '').slice(0, this.numberMaxLength());

  if (value !== input.value) {
    input.value = value;
    this.paymentMethodForm.number().value.set(value);
  }
}
```

- `type="text"` + `inputmode="numeric"` (no `type="number"`): una cuenta de 20 dígitos supera
  `Number.MAX_SAFE_INTEGER` y perdería ceros a la izquierda.
- `beforeinput` es la barrera de UX en el navegador; `input` es el respaldo verificable en jsdom,
  donde los specs disparan el evento `input` manualmente.
- No hace falta `maxLength()` de Signal Forms: Zod ya valida y muestra el error del campo.

### 3.3 Template (`add-payment-method.html`)

Misma estructura y lenguaje que `add-movement`:

1. Encabezado editorial: tag (`Medios de pago`, acento `--pale-blue`), `h1` serif
   “Agregar método de pago”, subtítulo de una línea.
2. Alerta de error de la store (`role="alert"`).
3. Tarjeta con `<form novalidate (submit)="onSubmit($event)">`:
   - **Tipo**: `<fieldset>` + `legend` y control segmentado de 3 radios (Tarjeta / Cuenta /
     Binance), ocultos visualmente como en movimientos. Selección neutra (`--surface-muted` +
     `--ink`), sin rainbow: el color sigue siendo escaso.
   - **Nombre**: texto, contador `n/50`.
   - **Número**: etiqueta dinámica, contador `n/16` o `n/20`, `inputmode="numeric"`, guardas de
     3.2. En Binance la etiqueta es “Número de la tarjeta Binance (opcional)” y el tope sigue
     siendo 16.
   - **Descripción** (opcional): contador `n/100`.
   - **Moneda**: `select` con `EUR | USD | USDT | VES`.
   - Errores con `@for (error of paymentMethodForm.<field>().errors())` y `role="alert"`, solo si
     `touched() && invalid()`; `[attr.aria-invalid]` y `[class.field__input--invalid]`.
   - Acciones: primario “Guardar método de pago” (`disabled` si el form es inválido o `isSaving()`),
     secundario “Limpiar” y enlace “Volver al resumen”.
4. `aria-describedby` para contadores; ids `#name`, `#number`, `#description`, `#currency`.

### 3.4 Estilos (`add-payment-method.scss`)

- Mobile first: una columna, `.payment` con `max-width: 34rem`, padding `--space-4` y tarjeta de
  borde 1px `--border`, radio `--radius-md`, sin sombras.
- Pares Nombre + Moneda en dos columnas desde 480px; tipo en 3 columnas; acciones en fila desde
  480px. Descripción y número siempre a ancho completo.
- Tipografía: labels en mayúsculas pequeñas con tracking, contadores y número en `--font-mono`
  (tabular nums), título en `--font-serif`.
- Animación de entrada `translateY(12px)` + `opacity` con `--ease-out-quint` y
  `@media (prefers-reduced-motion: reduce)`.
- Objetivo: mantenerse por debajo del error de presupuesto (8 kB) y, si se puede, del aviso (4 kB).

### 3.5 Mapper y modelos

- `PaymentMethodMapper.toRequest(form: AddPaymentMethodForm)` con `trim()` en `name`, `description`
  y `number`, y vacíos → `undefined`.
- Nuevo `models/payment-method-type.model.ts` con `PAYMENT_METHOD_TYPE_LABELS` y
  `PAYMENT_METHOD_TYPE_OPTIONS` (mismo patrón que `movement-type.model.ts`).
- Spec del mapper: mapeo completo, `description`/`number` vacíos → `undefined` y `trim`.

### 3.6 Store y servicio

Sin cambios funcionales: la store ya expone todo lo que el formulario necesita. Únicas notas:

- El POST sigue siendo mock (`useMock = true`): `getPaymentMethods()` vuelve a leer el mismo array,
  así que el método nuevo no aparece en una lista (no hay lista en este módulo).
- Se mantienen los deep imports de `rxjs/internal/*` porque son la convención actual del repo; no se
  cambian en este alcance.

### 3.7 Routing y navegación (punto 6)

`app.routes.ts`, dentro de los `children` del layout y **antes** del comodín:

```ts
{
  path: 'metodos-pago',
  loadChildren: () =>
    import('./features/payment-methods/payment-methods-routes').then(
      (m) => m.PAYMENT_METHODS_ROUTES,
    ),
},
```

`navigation-menu.mock.ts`: `paymentMethodAdd` pasa a `enabled: true` (la ruta ya coincide). Con eso
el menú, el estado activo y la navegación rápida del dashboard lo toman solos desde `NavStore`; no
hay que tocar `nav-menu`, `app-header` ni `quick-nav`.

---

## 4. Detalle por punto del instructivo

| Punto | Cómo se cubre |
| --- | --- |
| 1. Terminar html/scss/ts | Secciones 3.1–3.4. |
| 2. Analizar lo implementado | Sección 0 y revisión de schema de la sección 2; el resto del módulo está correcto. |
| 3. Analizar la store | Completa; se consume tal cual (3.6). |
| 4. HTML/SCSS con taste skill y estado de la store | 3.3/3.4; `error`, `isLoading` y `resetFeedback` salen de la store. |
| 5. Tope 16 tarjeta / 20 cuenta y evitar teclear más de 20 | Schema condicional (2) + guardas `beforeinput`/`input` (3.2) + contador por tipo (16 / 20 / 16). |
| 6. Incorporar al routing principal | 3.7. |

---

## 5. Pruebas

| Spec | Casos |
| --- | --- |
| `add-payment-method.spec.ts` | Valores iniciales; submit deshabilitado con form inválido; error visible al tocar un campo; no guarda al enviar (abre confirmación); confirmar llama `addPaymentMethod` con el request mapeado; “registrar otro” limpia y enfoca `#name`; “ir al resumen” navega a `/dashboard`; fallo del guardado conserva los datos; “Limpiar” vuelve a los iniciales con validadores activos. |
| Tope del número (misma spec) | Tarjeta: 17 dígitos → 16; cuenta: 21 → 20; cambio de cuenta (20) a tarjeta recorta a 16; letras se descartan; Binance acepta vacío y recorta a 16. |
| `payment-methods.schemas.spec.ts` | Tarjeta exige 16 y rechaza 20; cuenta exige 20 y rechaza 16; nombre 2/51; descripción `''` válida y `'ab'` inválida; Binance sin número válido y con 16 válido (15/17 inválidos). |
| `payment-method.mapper.spec.ts` | `trim`, vacíos → `undefined`, mapeo completo. |
| `app.routes.spec.ts` | `/metodos-pago/nuevo` monta `app-add-payment-method` dentro del layout; `/metodos-pago` redirige a `nuevo`. |
| `nav-menu.spec.ts` | Ajustar de 2 a 1 opción deshabilitada y afirmar que “Agregar método de pago” navega a `/metodos-pago/nuevo`. |

Comandos:

```bash
npx ng test
npx ng build
```

Criterios:

- Todas las specs en verde (las 126 actuales en 23 archivos + las nuevas).
- Build sin errores; vigilar el presupuesto `anyComponentStyle` (aviso 4 kB / error 8 kB).
- Sin dependencias nuevas.

Checklist manual en navegador (390×844 y 1280×800):

- [ ] `/metodos-pago/nuevo` renderiza dentro del layout, sin scroll horizontal.
- [ ] “Agregar método de pago” aparece habilitado en el menú y en la navegación rápida, y se marca
      como activo en la ruta.
- [ ] En tarjeta y Binance no se puede pasar de 16 dígitos; en cuenta, de 20; pegar un texto largo se recorta.
- [ ] Cambiar de cuenta a tarjeta recorta el número y muestra el contador correcto.
- [ ] El botón queda deshabilitado mientras guarda y muestra “Guardando…”.
- [ ] La confirmación resume los valores con etiquetas legibles y el número enmascarado; `Escape`
      cancela sin perder datos.
- [ ] Guardar con éxito ofrece registrar otro (form limpio y foco en `#name`) o ir al dashboard.
- [ ] Un error del API muestra toast + alerta y deja el formulario utilizable.
- [ ] Tema claro/oscuro y `prefers-reduced-motion` sin regresiones.
- [ ] Sin emojis, gradientes, sombras fuertes ni `rounded-full` en contenedores.

---

## 6. Decisiones (confirmadas)

**A. Longitud exacta.** No existen tarjetas de menos ni de más de 16 dígitos, y las cuentas del
país del usuario son de 20. Se mantiene `min = max`: 16 para `card`, 20 para `account`.

**B. Binance = tarjeta de Binance, opcional y de 16.** Si se completa, exige 16 dígitos; vacío es
válido. Etiqueta “Número de la tarjeta Binance (opcional)” y mismo tope de tecleo que la tarjeta.

**C. Número enmascarado en la confirmación.** Se muestran solo los últimos 4 (`•••• 1234`).

**D. Tipos estáticos.** Constante con etiquetas (patrón de `movement-type.model.ts`). Se elimina
`TYPE_PAYMENT_METHODS_API_RESPONSE_MOCK` y `TypePaymentMethodsDto`; `PAYMENT_METHODS_USER_MOCK` se
conserva. El archivo se renombró a `payment-methods.response.mock.ts` para que el nombre no hable
de “types”.

---

## 7. Fases de ejecución

### Fase 1 — Modelo y validación (completada)

- Schema condicional 16/20/16 con `discriminatedUnion` y `PAYMENT_METHOD_NUMBER_MAX_LENGTH`.
- `description` vacía válida, `trim()` en nombre y descripción, mensajes corregidos.
- `models/payment-method-type.model.ts` con etiquetas y opciones del selector.
- `PaymentMethodMapper.toRequest(form)` con `trim()` y vacíos → `undefined`.
- Eliminado el catálogo de tipos sin uso; mock renombrado a `payment-methods.response.mock.ts`.
- Nuevas specs: `payment-methods.schemas.spec.ts` (10) y `payment-method.mapper.spec.ts` (5).

**Verificación:** `npx ng test` → 141/141 en 25 archivos; `npx ng build` → exit 0 con el warning
heredado de `add-movement.scss`.

### Fase 2 — Componente, template y estilos

- `add-payment-method.ts`: `FormField`, opciones, `isSaving`, tope del número por tipo, etiquetas
  legibles, número enmascarado, foco en `#name`.
- `add-payment-method.html` y `.scss` (secciones 3.1–3.4).
- Ampliar `add-payment-method.spec.ts` con tope, confirmación, guardado y limpieza.

### Fase 3 — Routing, menú y verificación final

- Montar `metodos-pago` en `app.routes.ts` y habilitar el ítem del menú.
- Ajustar `nav-menu.spec.ts` y ampliar `app.routes.spec.ts`.
- `npx ng test` + `npx ng build` + checklist manual en navegador.

---

## 8. Limitaciones que quedarán documentadas

- El API es mock (`useMock = true`): el método guardado no persiste ni aparece en ninguna lista
  porque este módulo no incluye listado.
- `authInterceptor` no está registrado y el layout no está protegido por `authGuard`; es el estado
  heredado de la app.
- El tope de tecleo se apoya en `beforeinput` (navegador) y en el saneo de `input` (jsdom); no en
  `maxlength`, que el compilador de Signal Forms rechaza junto a `[formField]`.
- El foco dentro del diálogo se verifica en navegador; jsdom no calcula layout.
