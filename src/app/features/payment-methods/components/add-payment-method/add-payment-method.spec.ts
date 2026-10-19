import { provideHttpClient } from '@angular/common/http';
import { ApplicationRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { PaymentMethodsStore } from '../../../../core/stores/paymentMethods/payment-method.store';
import { AddPaymentMethod } from './add-payment-method';

/**
 * Pruebas del formulario de métodos de pago.
 *
 * Cubren los tres pasos del flujo (formulario, confirmación y registro), el tope
 * del número según el tipo y los bordes: valores iniciales, validaciones
 * visibles, limpiar con los validadores activos, encadenar otro método y qué
 * pasa cuando el guardado falla.
 *
 * Las interacciones se esperan con `whenStable()` porque confirmar guarda de
 * forma asíncrona. Los diálogos los monta el CDK en un overlay colgado de
 * `document.body`, así que se consultan contra el documento.
 */
describe('AddPaymentMethod', () => {
  let fixture: ComponentFixture<AddPaymentMethod>;
  let store: InstanceType<typeof PaymentMethodsStore>;
  let router: Router;

  /** Campo del formulario por selector. */
  function input(selector: string): HTMLInputElement {
    return fixture.nativeElement.querySelector(selector) as HTMLInputElement;
  }

  /** Botón por selector. */
  function button(selector: string): HTMLButtonElement {
    return fixture.nativeElement.querySelector(selector) as HTMLButtonElement;
  }

  /** Texto de un contador, sin los espacios del template. */
  function counter(selector: string): string {
    return (fixture.nativeElement.querySelector(selector) as HTMLElement).textContent
      ?.replace(/\s+/g, ' ')
      .trim();
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

  /** Reintenta hasta que el overlay cumpla la condición. */
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

  /** Marca un tipo del control segmentado. */
  function selectType(value: string): void {
    const radio = fixture.nativeElement.querySelector(
      `input[type="radio"][value="${value}"]`,
    ) as HTMLInputElement;

    radio.checked = true;
    radio.dispatchEvent(new Event('input', { bubbles: true }));
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
    return (
      (document.querySelector('.confirm__title') as HTMLElement | null)?.textContent?.trim() ?? ''
    );
  }

  /** Resumen campo-valor del diálogo de confirmación, como pares etiqueta/valor. */
  function dialogFacts(): Record<string, string> {
    const facts: Record<string, string> = {};

    for (const row of Array.from(document.querySelectorAll('.facts__row'))) {
      const term = (row.querySelector('.facts__term')?.textContent ?? '').trim();
      const value = (row.querySelector('.facts__value')?.textContent ?? '')
        .replace(/\s+/g, ' ')
        .trim();

      facts[term] = value;
    }

    return facts;
  }

  /** Completa nombre y número de una cuenta válida. */
  function fillValidForm(name = 'Banco principal', number = '1'.repeat(20)): void {
    type(input('#name'), name);
    type(input('#number'), number);
  }

  /** Envía el formulario y espera a que se abra la confirmación de valores. */
  async function submit(): Promise<void> {
    button('button[type="submit"]').click();
    await waitUntil(() => expect(dialog()).not.toBeNull());
  }

  /** Confirma la revisión de valores y espera al paso siguiente. */
  async function confirm(): Promise<void> {
    (document.querySelector('.confirm__button--confirm') as HTMLButtonElement).click();
    await waitUntil(() => expect(dialogTitle()).not.toBe('Confirmar método de pago'));
  }

  /** Monta la vista con el guardado de la store interceptado. */
  async function render(saveResult = true): Promise<void> {
    fixture = TestBed.createComponent(AddPaymentMethod);
    await settle();

    vi.spyOn(store, 'addPaymentMethod').mockResolvedValue(saveResult);
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddPaymentMethod],
      providers: [provideHttpClient(), provideRouter([{ path: 'dashboard', children: [] }])],
    }).compileComponents();

    store = TestBed.inject(PaymentMethodsStore);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('arranca con los valores iniciales del formulario', async () => {
    await render();

    expect(input('#name').value).toBe('');
    expect(input('#number').value).toBe('');
    expect(input('#description').value).toBe('');
    expect((fixture.nativeElement.querySelector('#currency') as HTMLSelectElement).value).toBe(
      'USD',
    );

    const account = fixture.nativeElement.querySelector(
      'input[type="radio"][value="account"]',
    ) as HTMLInputElement;

    expect(account.checked).toBe(true);
    expect(button('button[type="submit"]').disabled).toBe(true);
  });

  it('no permite guardar mientras el formulario sea inválido', async () => {
    await render();

    type(input('#name'), 'Banco principal');

    expect(button('button[type="submit"]').disabled).toBe(true);

    type(input('#number'), '1'.repeat(20));

    expect(button('button[type="submit"]').disabled).toBe(false);
  });

  it('muestra los errores de nombre y número al tocar los campos', async () => {
    await render();

    const name = input('#name');
    const number = input('#number');

    type(name, 'ab');
    blur(name);
    type(number, '123');
    blur(number);

    expect(errorMessages()).toContain('Mínimo 3 caracteres');
    expect(errorMessages()).toContain('Debe tener 20 dígitos');
    expect(name.getAttribute('aria-invalid')).toBe('true');
    expect(number.getAttribute('aria-invalid')).toBe('true');
  });

  it('limita la tarjeta a 16 dígitos y la cuenta a 20', async () => {
    await render();

    selectType('card');
    type(input('#number'), '1'.repeat(17));

    expect(input('#number').value).toBe('1'.repeat(16));
    expect(counter('#number-counter')).toBe('16/16');

    selectType('account');
    type(input('#number'), '1'.repeat(21));

    expect(input('#number').value).toBe('1'.repeat(20));
    expect(counter('#number-counter')).toBe('20/20');
  });

  it('recorta el número al pasar de cuenta a tarjeta y descarta letras', async () => {
    await render();

    type(input('#number'), '1'.repeat(20));
    selectType('card');

    expect(input('#number').value).toBe('1'.repeat(16));
    expect(counter('#number-counter')).toBe('16/16');

    type(input('#number'), '12ab34');

    expect(input('#number').value).toBe('1234');
  });

  it('deja el número opcional en Binance y actualiza su etiqueta', async () => {
    await render();

    selectType('binance');
    type(input('#name'), 'Binance');

    expect(
      (fixture.nativeElement.querySelector('label[for="number"]') as HTMLElement).textContent,
    ).toContain('opcional');
    expect(input('#number').getAttribute('aria-required')).toBe('false');
    expect(button('button[type="submit"]').disabled).toBe(false);
  });

  it('no guarda al enviar: primero confirma los valores con el número enmascarado', async () => {
    await render();

    fillValidForm('Banco principal', '12345678901234567890');
    type(input('#description'), 'Cuenta nómina');

    await submit();

    expect(store.addPaymentMethod).not.toHaveBeenCalled();
    expect(dialogTitle()).toBe('Confirmar método de pago');
    expect(dialogFacts()).toEqual({
      Tipo: 'Cuenta bancaria',
      Nombre: 'Banco principal',
      Número: '•••• 7890',
      Descripción: 'Cuenta nómina',
      Moneda: 'USD',
    });
  });

  it('guarda el método confirmado con el request mapeado', async () => {
    await render();

    selectType('card');
    fillValidForm('  Tarjeta principal  ', '1234123412341234');

    await submit();
    await confirm();

    expect(store.addPaymentMethod).toHaveBeenCalledWith({
      name: 'Tarjeta principal',
      type: 'card',
      description: undefined,
      number: '1234123412341234',
      currency: 'USD',
    });
  });

  it('ofrece registrar otro y deja el formulario limpio con el foco en el nombre', async () => {
    await render();

    fillValidForm();
    await submit();
    await confirm();

    expect(dialogTitle()).toBe('Método de pago registrado');

    await clickDialog('.confirm__button--confirm');

    expect(dialog()).toBeNull();
    expect(input('#name').value).toBe('');
    expect(input('#number').value).toBe('');
    expect(errorMessages()).toEqual([]);
    expect(button('button[type="submit"]').disabled).toBe(true);
    expect(document.activeElement).toBe(input('#name'));
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

    expect(store.addPaymentMethod).toHaveBeenCalled();
    expect(dialog()).toBeNull();
    expect(input('#name').value).toBe('Banco principal');
  });

  it('conserva lo escrito al volver de la confirmación', async () => {
    await render();

    fillValidForm();
    await submit();
    await clickDialog('.confirm__button--cancel');

    expect(dialog()).toBeNull();
    expect(store.addPaymentMethod).not.toHaveBeenCalled();
    expect(input('#name').value).toBe('Banco principal');
  });

  it('limpiar vuelve a los valores iniciales y deja los validadores activos', async () => {
    await render();

    const name = input('#name');

    type(name, 'ab');
    blur(name);

    expect(errorMessages()).toContain('Mínimo 3 caracteres');

    await click('.btn--ghost');

    expect(input('#name').value).toBe('');
    expect(input('#number').value).toBe('');
    expect(errorMessages()).toEqual([]);

    // Los validadores siguen evaluando después de limpiar.
    type(name, 'ab');
    blur(name);

    expect(errorMessages()).toContain('Mínimo 3 caracteres');
  });
});
