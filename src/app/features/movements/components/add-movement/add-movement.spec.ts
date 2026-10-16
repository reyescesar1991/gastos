import { provideHttpClient } from '@angular/common/http';
import { ApplicationRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { MovementsStore } from '../../../../core/stores/movements/movements.store';
import { toIsoDate } from '../../../../shared/utils/format.util';
import { AddMovement } from './add-movement';

/**
 * Pruebas del formulario de registro.
 *
 * Cubren los tres pasos del flujo (formulario, confirmación y registro) más los
 * bordes del instructivo: valores iniciales, validaciones visibles, limpiar con
 * los validadores activos, encadenar otro movimiento y qué pasa cuando el
 * guardado falla.
 *
 * Las interacciones se esperan con `whenStable()` porque confirmar guarda de
 * forma asíncrona: sin esa espera se estaría comprobando el estado anterior a
 * que respondiera la store.
 *
 * Los diálogos los monta el CDK en un overlay colgado de `document.body`, así que
 * se consultan contra el documento y no contra el fixture.
 */
describe('AddMovement', () => {
  let fixture: ComponentFixture<AddMovement>;
  let store: InstanceType<typeof MovementsStore>;
  let router: Router;

  /** Campo del formulario por selector. */
  function input(selector: string): HTMLInputElement {
    return fixture.nativeElement.querySelector(selector) as HTMLInputElement;
  }

  /** Botón por selector. */
  function button(selector: string): HTMLButtonElement {
    return fixture.nativeElement.querySelector(selector) as HTMLButtonElement;
  }

  /**
   * Aplica los cambios pendientes y espera a que se estabilicen.
   *
   * Se repinta dos veces: una para la vista del formulario y otra para el overlay
   * del CDK, que cuelga de `document` y no del fixture.
   */
  async function settle(): Promise<void> {
    fixture.detectChanges();
    TestBed.inject(ApplicationRef).tick();
    await fixture.whenStable();
    fixture.detectChanges();
    TestBed.inject(ApplicationRef).tick();
    await fixture.whenStable();
  }

  /**
   * Reintenta hasta que el overlay cumpla la condición.
   *
   * Los pasos van en cadena y de forma asíncrona (confirmar guarda y recién
   * después pregunta si registra otro), así que la cantidad de microtareas no es
   * fija: se espera por la condición y no por un número de rondas.
   */
  async function waitUntil(assertion: () => void): Promise<void> {
    await vi.waitFor(async () => {
      await settle();
      assertion();
    });
  }

  /** Pulsa un botón y espera el resultado. */
  async function click(selector: string): Promise<void> {
    button(selector).click();
    await settle();
  }

  /** Pulsa un botón del diálogo, que vive en el overlay del documento. */
  async function clickDialog(selector: string): Promise<void> {
    (document.querySelector(selector) as HTMLButtonElement).click();
    await waitUntil(() => expect(dialog()).toBeNull());
  }

  /** Escribe en un campo, como lo haría el usuario. */
  function type(element: HTMLInputElement, value: string): void {
    element.value = value;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
  }

  /** Marca el campo como tocado, al salir de él. */
  function blur(element: HTMLInputElement): void {
    element.dispatchEvent(new Event('blur', { bubbles: true }));
    fixture.detectChanges();
  }

  /** Mensajes de error visibles, como los lee el usuario. */
  function errorMessages(): string[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.field__errors li')).map(
      (item) => (item as HTMLElement).textContent?.trim() ?? '',
    );
  }

  /** Diálogo montado, si lo hay. */
  function dialog(): HTMLElement | null {
    return document.querySelector('.confirm__title');
  }

  /** Texto del título del diálogo abierto. */
  function dialogTitle(): string {
    return (document.querySelector('.confirm__title') as HTMLElement | null)?.textContent?.trim() ?? '';
  }

  /** Resumen campo-valor del diálogo de confirmación, como pares etiqueta/valor. */
  function dialogFacts(): Record<string, string> {
    const facts: Record<string, string> = {};

    for (const row of Array.from(document.querySelectorAll('.facts__row'))) {
      const term = (row.querySelector('.facts__term')?.textContent ?? '').trim();
        // `\s` también cubre el espacio fino que `Intl` mete en los importes, para
      // que la comparación con los literales no dependa de ese carácter invisible.
      const value = (row.querySelector('.facts__value')?.textContent ?? '')
        .replace(/\s+/g, ' ')
        .trim();

      facts[term] = value;
    }

    return facts;
  }

  /** Completa el formulario con datos válidos. */
  function fillValidForm(description = 'Cena con el equipo'): void {
    type(input('#description'), description);
  }

  /** Envía el formulario y espera a que se abra la confirmación de valores. */
  async function submit(): Promise<void> {
    button('button[type="submit"]').click();
    await waitUntil(() => expect(dialog()).not.toBeNull());
  }

  /**
   * Confirma la revisión de valores y espera al paso siguiente.
   *
   * El paso siguiente puede ser el diálogo de "registrar otro" o, si el guardado
   * falla, la vuelta al formulario.
   */
  async function confirm(): Promise<void> {
    (document.querySelector('.confirm__button--confirm') as HTMLButtonElement).click();
    await waitUntil(() => expect(dialogTitle()).not.toBe('Confirmar movimiento'));
  }

  /**
   * Monta la vista con el guardado de la store interceptado.
   *
   * `saveResult` reproduce la respuesta de la store: `true` cuando el API aceptó
   * el movimiento y `false` cuando falló (la store ya avisa con un toast, no
   * relanza).
   */
  async function render(saveResult = true): Promise<void> {
    fixture = TestBed.createComponent(AddMovement);
    await settle();

    vi.spyOn(store, 'addMovement').mockResolvedValue(saveResult);
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddMovement],
      providers: [
        provideHttpClient(),
        provideRouter([
          { path: 'dashboard', children: [] },
          { path: 'movimientos', children: [] },
        ]),
      ],
    }).compileComponents();

    store = TestBed.inject(MovementsStore);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('arranca con los valores iniciales del instructivo', async () => {
    await render();

    expect(input('#amount').value).toBe('1');
    expect((fixture.nativeElement.querySelector('#currency') as HTMLSelectElement).value).toBe(
      'USD',
    );
    expect(input('#date').value).toBe(toIsoDate(new Date()));
    expect(input('#category').value).toBe('');
    expect(input('#description').value).toBe('');

    const expense = fixture.nativeElement.querySelector(
      'input[type="radio"][value="expense"]',
    ) as HTMLInputElement;

    expect(expense.checked).toBe(true);
  });

  it('no permite guardar mientras el formulario sea inválido', async () => {
    await render();

    expect(button('button[type="submit"]').disabled).toBe(true);

    fillValidForm();

    expect(button('button[type="submit"]').disabled).toBe(false);
  });

  it('muestra el error de la descripción cuando es demasiado corta', async () => {
    await render();

    const description = input('#description');

    type(description, 'ab');
    blur(description);

    expect(errorMessages()).toContain('Mínimo 3 caracteres');
    expect(description.getAttribute('aria-invalid')).toBe('true');
  });

  it('no guarda al enviar: primero confirma los valores', async () => {
    await render();

    fillValidForm();
    await submit();

    expect(store.addMovement).not.toHaveBeenCalled();
    expect(dialog()).not.toBeNull();
    expect(dialogTitle()).toBe('Confirmar movimiento');
    expect(dialogFacts()).toEqual({
      Tipo: 'Gasto',
      Importe: 'US$ 1,00',
      Fecha: new Intl.DateTimeFormat('es-CO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(new Date()),
      Descripción: 'Cena con el equipo',
      'Categoría': 'Sin categoría',
    });
  });

  it('guarda el movimiento confirmado con el request mapeado', async () => {
    await render();

    fillValidForm();
    type(input('#amount'), '125.5');

    const income = fixture.nativeElement.querySelector(
      'input[type="radio"][value="income"]',
    ) as HTMLInputElement;

    income.checked = true;
    income.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();

    await submit();
    await confirm();

    expect(store.addMovement).toHaveBeenCalledWith({
      amount: 125.5,
      description: 'Cena con el equipo',
      date: toIsoDate(new Date()),
      type: 'income',
      category: undefined,
      currency: 'USD',
    });
  });

  it('ofrece registrar otro y deja el formulario limpio y listo', async () => {
    await render();

    fillValidForm();
    await submit();
    await confirm();

    expect(dialogTitle()).toBe('Movimiento registrado');

    await clickDialog('.confirm__button--confirm');

    expect(dialog()).toBeNull();
    expect(input('#description').value).toBe('');
    expect(input('#amount').value).toBe('1');
    expect(errorMessages()).toEqual([]);
    expect(button('button[type="submit"]').disabled).toBe(true);
    expect(document.activeElement).toBe(input('#description'));
  });

  it('redirige al resumen cuando no quiere registrar otro', async () => {
    await render();

    const navigate = vi.spyOn(router, 'navigate');

    fillValidForm();
    await submit();
    await confirm();
    await clickDialog('.confirm__button--cancel');

    expect(navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('no ofrece registrar otro cuando el guardado falla', async () => {
    await render(false);

    fillValidForm();
    await submit();
    await confirm();

    expect(store.addMovement).toHaveBeenCalled();
    expect(dialog()).toBeNull();
    expect(input('#description').value).toBe('Cena con el equipo');
  });

  it('conserva lo escrito al volver de la confirmación', async () => {
    await render();

    fillValidForm();
    await submit();
    await clickDialog('.confirm__button--cancel');

    expect(dialog()).toBeNull();
    expect(store.addMovement).not.toHaveBeenCalled();
    expect(input('#description').value).toBe('Cena con el equipo');
  });

  it('limpiar vuelve a los valores iniciales y deja los validadores activos', async () => {
    await render();

    const description = input('#description');

    type(description, 'ab');
    blur(description);

    expect(errorMessages()).toContain('Mínimo 3 caracteres');

    await click('.btn--ghost');

    expect(input('#description').value).toBe('');
    expect(input('#amount').value).toBe('1');
    expect(errorMessages()).toEqual([]);

    // Los validadores siguen evaluando después de limpiar.
    type(description, 'ab');
    blur(description);

    expect(errorMessages()).toContain('Mínimo 3 caracteres');
  });
});
