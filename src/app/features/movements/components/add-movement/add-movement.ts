import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormField, form, maxLength, submit, validateStandardSchema } from '@angular/forms/signals';
import { MovementsStore } from '../../../../core/stores/movements/movements.store';
import { PaymentMethodsStore } from '../../../../core/stores/paymentMethods/payment-method.store';
import { ConfirmDialogService } from '../../../../shared/components/confirm-dialog/confirm-dialog.service';
import type { DialogFact } from '../../../../shared/models/dialog/confirm-dialog.model';
import { formatAmount, formatDate } from '../../../../shared/utils/format.util';
import { MOVEMENT_CATEGORIES } from '../../mocks/movement-categories.mock';
import {
  createInitialMovementForm,
  type AddMovementForm,
} from '../../models/add-movement-form.model';
import { AddMovementMapper } from '../../models/add-movement.mapper';
import type { AddMovementRequest } from '../../models/add-movement-request.model';
import { MOVEMENT_TYPE_LABELS, MOVEMENT_TYPE_OPTIONS } from '../../models/movement-type.model';
import type { PaymentMethodModel } from '../../../payment-methods/models/payment-method.model';
import {
  CATEGORY_MAX_LENGTH,
  CURRENCY_TYPE,
  DESCRIPTION_MAX_LENGTH,
  addMovementSchema,
} from '../../schemas/movements.schemas';

/**
 * Pantalla de registro de movimiento.
 *
 * Usa Signal Forms de Angular 22: `movementModel` es la señal mutable del
 * formulario, `movementForm` el árbol de campos (`FieldTree`) y las reglas viven
 * en `addMovementSchema` (Zod), enganchadas con `validateStandardSchema()`.
 *
 * El flujo tiene tres pasos y todos los eventos pasan por `MovementsStore`:
 * 1. **Formulario**: se completa y se limpia (`onClear`), con los validadores
 *    activos después de limpiar.
 * 2. **Confirmación**: el envío válido no guarda todavía. Se abre el diálogo con
 *    el request ya mapeado como resumen campo-valor para revisar los valores.
 * 3. **Registrado**: si el guardado fue aceptado se pregunta si quiere registrar
 *    otro; al aceptar se limpia el formulario y el foco vuelve al primer campo, y
 *    al rechazar se redirige al resumen.
 *
 * Los diálogos los abre `ConfirmDialogService` (CDK Dialog) y se consumen con
 * `await`, así que el componente no mantiene estado de apertura ni se ocupa del
 * foco: cada paso es una pregunta y su respuesta.
 *
 * Los dos campos opcionales usan un combobox propio en vez del `datalist` nativo,
 * que el navegador posiciona donde quiere. Cada uno tiene su estado: la categoría
 * es texto libre y vive directo en `movementModel`, mientras que el método de
 * pago guarda un `id` en el modelo y su texto visible en `paymentMethodText`,
 * porque el valor del dominio (número) no se puede pintar en un `input`.
 */
@Component({
  imports: [FormField, RouterLink],
  selector: 'app-add-movement',
  styleUrl: './add-movement.scss',
  templateUrl: './add-movement.html',
})
export class AddMovement {
  /** Movimientos del usuario: acá vive el guardado y su resultado. */
  protected readonly movementsStore = inject(MovementsStore);

  /** Métodos de pago del usuario, para el selector opcional. */
  protected readonly paymentMethodsStore = inject(PaymentMethodsStore);

  private readonly router = inject(Router);

  /** Modelo mutable del formulario; Signal Forms lo usa como fuente de verdad. */
  protected readonly movementModel = signal<AddMovementForm>(createInitialMovementForm());

  /** Árbol de campos del formulario con el schema Zod aplicado. */
  protected readonly movementForm = form(this.movementModel, (path) => {
    maxLength(path.description, DESCRIPTION_MAX_LENGTH);

    validateStandardSchema(path, addMovementSchema);
  });

  /** Tipos de movimiento con su etiqueta: Gasto e Ingreso. */
  protected readonly typeOptions = MOVEMENT_TYPE_OPTIONS;

  /** Monedas aceptadas por el formulario. */
  protected readonly currencies = CURRENCY_TYPE;

  /** Sugerencias del campo categoría. */
  protected readonly categories = MOVEMENT_CATEGORIES;

  /** Indica si el desplegable de categorías está abierto. */
  protected readonly isCategoryListOpen = signal(false);

  /** Índice resaltado dentro del desplegable de categorías (para teclado). */
  protected readonly activeCategoryIndex = signal(0);

  /** Indica si el desplegable de métodos de pago está abierto. */
  protected readonly isPaymentMethodListOpen = signal(false);

  /** Índice resaltado dentro del desplegable de métodos de pago (para teclado). */
  protected readonly activePaymentMethodIndex = signal(0);

  /**
   * Texto visible del selector de método de pago.
   *
   * El modelo guarda el `id` y el input necesita el nombre: son dos valores y un
   * `[formField]` solo puede enlazar uno. Al elegir se copia el nombre acá y al
   * editar el texto se resuelve de vuelta el `id` (o `undefined` si no coincide).
   */
  protected readonly paymentMethodText = signal('');

  /**
   * Sugerencias de categoría que coinciden con lo escrito.
   *
   * La categoría sigue siendo de texto libre: la lista solo orienta y nunca
   * obliga a elegir una de estas opciones.
   */
  protected readonly categorySuggestions = computed(() => {
    const query = this.movementModel().category.trim().toLowerCase();

    return query === ''
      ? this.categories
      : this.categories.filter((category) => category.toLowerCase().includes(query));
  });

  /** Método de pago elegido, si lo hay. */
  protected readonly selectedPaymentMethod = computed<PaymentMethodModel | null>(
    () =>
      this.paymentMethodsStore
        .paymentMethodsList()
        .find((paymentMethod) => paymentMethod.id === this.movementModel().paymentMethodId) ?? null,
  );

  /**
   * Métodos de pago que coinciden con lo escrito.
   *
   * Con el campo vacío —o mostrando el nombre del método ya elegido— se ofrecen
   * todos: el filtro existe para buscar, no para esconder el resto al enfocar.
   */
  protected readonly paymentMethodSuggestions = computed<PaymentMethodModel[]>(() => {
    const paymentMethods = this.paymentMethodsStore.paymentMethodsList();
    const query = this.paymentMethodText().trim().toLowerCase();
    const selected = this.selectedPaymentMethod()?.name.trim().toLowerCase() ?? '';

    if (query === '' || query === selected) {
      return paymentMethods;
    }

    return paymentMethods.filter(
      (paymentMethod) =>
        paymentMethod.name.toLowerCase().includes(query) ||
        paymentMethod.type.toLowerCase().includes(query),
    );
  });

  /** Id de la sugerencia de categoría resaltada, para `aria-activedescendant`. */
  protected readonly activeCategoryId = computed(() => {
    const category = this.categorySuggestions()[this.activeCategoryIndex()];

    return category === undefined ? null : this.categoryOptionId(category);
  });

  /** Id de la sugerencia de método de pago resaltada, para `aria-activedescendant`. */
  protected readonly activePaymentMethodOptionId = computed(() => {
    const paymentMethod = this.paymentMethodSuggestions()[this.activePaymentMethodIndex()];

    return paymentMethod === undefined ? null : this.paymentMethodOptionId(paymentMethod.id);
  });

  /** Tope de caracteres de la descripción, para el `maxlength` y el contador. */
  protected readonly descriptionMaxLength = DESCRIPTION_MAX_LENGTH;

  /** Tope de caracteres de la categoría, para el `maxlength` y el contador. */
  protected readonly categoryMaxLength = CATEGORY_MAX_LENGTH;

  /** Indica si hay un guardado en curso, para bloquear el envío. */
  protected readonly isSaving = this.movementsStore.isLoading;

  /** Diálogos de confirmación (CDK Dialog). */
  private readonly confirmDialog = inject(ConfirmDialogService);

  constructor() {
    // El selector es opcional, pero necesita la lista: se pide una sola vez y no
    // se repite si otra pantalla ya la cargó.
    if (!this.paymentMethodsStore.hasPaymentMethods() && !this.paymentMethodsStore.isLoading()) {
      void this.paymentMethodsStore.getPaymentMethods();
    }
  }

  /**
   * Valida y abre la confirmación de valores.
   *
   * `submit()` solo ejecuta la acción cuando el formulario es válido y marca los
   * campos como tocados, para que los errores se muestren tras el primer intento.
   * Acá no se guarda todavía: primero se revisan los valores (punto 8).
   *
   * @param event Evento nativo de envío del formulario.
   */
  protected onSubmit(event: Event): void {
    event.preventDefault();

    void submit(this.movementForm, { action: async () => this.confirmAndSave() });
  }

  /**
   * Pide confirmación, guarda y ofrece encadenar otro movimiento.
   *
   * El orden es el del instructivo: primero se revisan los valores (punto 8) y
   * solo después se envía a la store; si el guardado falla, la store ya avisó con
   * un toast y acá no se ofrece registrar otro, porque no se registró.
   */
  private async confirmAndSave(): Promise<void> {
    const request = AddMovementMapper.toRequest(this.movementModel());

    const confirmed = await this.confirmDialog.ask({
      title: 'Confirmar movimiento',
      confirmLabel: 'Guardar',
      cancelLabel: 'Volver',
      content: {
        kind: 'facts',
        message: 'Revisa los valores antes de guardarlo.',
        facts: this.factsOf(request),
      },
    });

    if (!confirmed) {
      return;
    }

    const saved = await this.movementsStore.addMovement(request);

    if (!saved) {
      return;
    }

    const another = await this.confirmDialog.ask(
      {
        title: 'Movimiento registrado',
        confirmLabel: 'Registrar otro',
        cancelLabel: 'Ir al resumen',
        content: { kind: 'message', message: '¿Quieres registrar otro movimiento?' },
      },
      // El foco vuelve al primer campo para poder encadenar otro sin el ratón.
      { restoreFocus: '#description' },
    );

    if (another) {
      this.onClear();
      return;
    }

    void this.router.navigate(['/dashboard']);
  }

  /** Resumen campo-valor del movimiento, para el diálogo de confirmación. */
  private factsOf(request: AddMovementRequest): DialogFact[] {
    const facts: DialogFact[] = [
      { label: 'Tipo', value: MOVEMENT_TYPE_LABELS[request.type], tone: request.type },
      { label: 'Importe', value: formatAmount(request.amount, request.currency), mono: true },
      { label: 'Fecha', value: formatDate(request.date), mono: true },
      { label: 'Descripción', value: request.description },
      { label: 'Categoría', value: request.category ?? 'Sin categoría' },
    ];

    const paymentMethod = this.selectedPaymentMethod();

    // Es opcional: sin método elegido no se agrega una fila vacía al resumen.
    if (request.paymentMethodId !== undefined && paymentMethod !== null) {
      facts.push({ label: 'Método de pago', value: paymentMethod.name });
    }

    return facts;
  }

  /** Abre el desplegable de categorías al enfocar el campo. */
  protected onCategoryFocus(): void {
    this.isCategoryListOpen.set(true);
  }

  /** Vuelve a abrir la lista desde el principio cuando cambia el texto. */
  protected onCategoryInput(): void {
    this.activeCategoryIndex.set(0);
    this.isCategoryListOpen.set(true);
  }

  /** Recorre las categorías con las flechas, elige con Enter y cierra con Escape. */
  protected onCategoryKeydown(event: KeyboardEvent): void {
    const suggestions = this.categorySuggestions();

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.isCategoryListOpen.set(true);
        this.moveActiveCategory(1, suggestions.length);
        break;

      case 'ArrowUp':
        event.preventDefault();
        this.isCategoryListOpen.set(true);
        this.moveActiveCategory(-1, suggestions.length);
        break;

      case 'Enter': {
        const category = suggestions[this.activeCategoryIndex()];

        if (this.isCategoryListOpen() && category !== undefined) {
          event.preventDefault();
          this.onSelectCategory(category);
        }

        break;
      }

      case 'Escape':
        this.closeCategoryList();
        break;
    }
  }

  /**
   * Vuelca la sugerencia elegida en el campo y cierra la lista.
   *
   * Se escribe sobre el modelo y no sobre el input: `[formField]` es quien
   * mantiene sincronizados el valor visible y el formulario, así que el cambio
   * también cuenta como edición del campo (dirty).
   */
  protected onSelectCategory(category: string): void {
    this.movementModel.update((model) => ({ ...model, category }));
    this.closeCategoryList();
  }

  /** Cierra el desplegable de categorías cuando el foco sale del campo. */
  protected onCategoryFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget;

    if (next instanceof Node && (event.currentTarget as Node).contains(next)) {
      return;
    }

    this.closeCategoryList();
  }

  /** Cierra la lista de categorías y reinicia el resaltado. */
  private closeCategoryList(): void {
    this.isCategoryListOpen.set(false);
    this.activeCategoryIndex.set(0);
  }

  /** Mueve el resaltado dentro de las categorías, con vuelta circular. */
  private moveActiveCategory(delta: number, total: number): void {
    if (total === 0) {
      return;
    }

    this.activeCategoryIndex.update((index) => (index + delta + total) % total);
  }

  /** Id estable de la opción de categoría, para `aria-activedescendant`. */
  private categoryOptionId(category: string): string {
    return `movement-category-${this.categories.indexOf(category)}`;
  }

  /** Abre el desplegable de métodos de pago al enfocar el campo. */
  protected onPaymentMethodFocus(): void {
    this.isPaymentMethodListOpen.set(true);
  }

  /** Filtra la lista mientras se escribe y resuelve el `id` del texto. */
  protected onPaymentMethodInput(event: Event): void {
    const text = (event.target as HTMLInputElement).value;

    this.paymentMethodText.set(text);
    this.activePaymentMethodIndex.set(0);
    this.isPaymentMethodListOpen.set(true);
    this.syncPaymentMethodId(text);
  }

  /** Recorre los métodos con las flechas, elige con Enter y cierra con Escape. */
  protected onPaymentMethodKeydown(event: KeyboardEvent): void {
    const suggestions = this.paymentMethodSuggestions();

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.isPaymentMethodListOpen.set(true);
        this.moveActivePaymentMethod(1, suggestions.length);
        break;

      case 'ArrowUp':
        event.preventDefault();
        this.isPaymentMethodListOpen.set(true);
        this.moveActivePaymentMethod(-1, suggestions.length);
        break;

      case 'Enter': {
        const paymentMethod = suggestions[this.activePaymentMethodIndex()];

        if (this.isPaymentMethodListOpen() && paymentMethod !== undefined) {
          event.preventDefault();
          this.onSelectPaymentMethod(paymentMethod);
        }

        break;
      }

      case 'Escape':
        // Descarta lo escrito a medias y vuelve a mostrar lo que está guardado.
        this.paymentMethodText.set(this.selectedPaymentMethod()?.name ?? '');
        this.closePaymentMethodList();
        break;
    }
  }

  /** Guarda el método elegido y deja su nombre visible en el campo. */
  protected onSelectPaymentMethod(paymentMethod: PaymentMethodModel): void {
    this.movementModel.update((model) => ({ ...model, paymentMethodId: paymentMethod.id }));
    this.paymentMethodText.set(paymentMethod.name);
    this.closePaymentMethodList();
  }

  /** Quita la selección desde el botón del campo. */
  protected onClearPaymentMethod(): void {
    this.movementModel.update((model) => ({ ...model, paymentMethodId: undefined }));
    this.paymentMethodText.set('');
    this.closePaymentMethodList();
  }

  /**
   * Cierra el desplegable de métodos de pago cuando el foco sale del campo.
   *
   * Si se escribió a medias y no se eligió nada, el texto vuelve a lo guardado:
   * el campo es opcional, pero no debe quedar mostrando una búsqueda como si
   * fuera el método elegido.
   */
  protected onPaymentMethodFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget;

    if (next instanceof Node && (event.currentTarget as Node).contains(next)) {
      return;
    }

    this.paymentMethodText.set(this.selectedPaymentMethod()?.name ?? '');
    this.closePaymentMethodList();
  }

  /** Cierra la lista de métodos de pago y reinicia el resaltado. */
  private closePaymentMethodList(): void {
    this.isPaymentMethodListOpen.set(false);
    this.activePaymentMethodIndex.set(0);
  }

  /** Mueve el resaltado dentro de los métodos de pago, con vuelta circular. */
  private moveActivePaymentMethod(delta: number, total: number): void {
    if (total === 0) {
      return;
    }

    this.activePaymentMethodIndex.update((index) => (index + delta + total) % total);
  }

  /** Id estable de la opción de método de pago, para `aria-activedescendant`. */
  private paymentMethodOptionId(paymentMethodId: number): string {
    return `movement-payment-method-${paymentMethodId}`;
  }

  /**
   * Resuelve el `id` a partir del texto del campo.
   *
   * El método de pago es opcional: un texto que no coincide con ningún método
   * guardado deja el campo sin selección en lugar de bloquear el formulario.
   */
  private syncPaymentMethodId(text: string): void {
    const normalized = text.trim().toLowerCase();

    const match =
      normalized === ''
        ? undefined
        : this.paymentMethodsStore
            .paymentMethodsList()
            .find((paymentMethod) => paymentMethod.name.trim().toLowerCase() === normalized);

    this.movementModel.update((model) => ({ ...model, paymentMethodId: match?.id }));
  }

  /**
   * Devuelve el formulario a su estado inicial.
   *
   * Son tres pasos porque cada uno cubre algo distinto: el modelo vuelve a los
   * valores por defecto, `reset()` limpia el estado `touched`/`dirty` de todos los
   * campos —así los errores no reaparecen sobre un formulario recién limpiado y
   * los validadores vuelven a evaluar desde cero— y la store descarta el mensaje
   * de la operación anterior.
   */
  protected onClear(): void {
    this.movementModel.set(createInitialMovementForm());
    this.movementForm().reset();
    this.movementsStore.resetFeedback();
    this.paymentMethodText.set('');
    this.closeCategoryList();
    this.closePaymentMethodList();
  }
}
