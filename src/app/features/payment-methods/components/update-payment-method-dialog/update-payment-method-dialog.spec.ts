import { provideHttpClient } from '@angular/common/http';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaymentMethodsStore } from '../../../../core/stores/paymentMethods/payment-method.store';
import type { PaymentMethodModel } from '../../models/payment-method.model';
import { UpdatePaymentMethodDialog } from './update-payment-method-dialog';

/**
 * Pruebas del modal de actualización.
 *
 * Cubren la precarga, la validación con el schema compartido, el tope del
 * número por tipo y el guardado como diff: solo viajan el id y los campos
 * cambiados. Cancelar no toca la store y un fallo mantiene el modal abierto.
 */
describe('UpdatePaymentMethodDialog', () => {
  let fixture: ComponentFixture<UpdatePaymentMethodDialog>;
  let store: InstanceType<typeof PaymentMethodsStore>;
  let close: ReturnType<typeof vi.fn>;

  /** Método de base: cuenta de 20 dígitos, completo. */
  const paymentMethod: PaymentMethodModel = {
    id: 2,
    name: 'Cuenta nómina',
    type: 'account',
    description: 'Cuenta del banco',
    number: '12341234123412341234',
    currency: 'VES',
  };

  /** Input del formulario por selector. */
  function input(selector: string): HTMLInputElement {
    return fixture.nativeElement.querySelector(selector) as HTMLInputElement;
  }

  /** Select del formulario por selector. */
  function select(selector: string): HTMLSelectElement {
    return fixture.nativeElement.querySelector(selector) as HTMLSelectElement;
  }

  /** Botón de guardar. */
  function submitButton(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('.update__button--primary') as HTMLButtonElement;
  }

  /** Texto de un contador, sin los espacios del template. */
  function counter(selector: string): string {
    return (fixture.nativeElement.querySelector(selector) as HTMLElement).textContent
      ?.replace(/\s+/g, ' ')
      .trim();
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

  /** Mensajes de error visibles. */
  function errorMessages(): string[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.field__errors li')).map(
      (item) => (item as HTMLElement).textContent?.trim() ?? '',
    );
  }

  beforeEach(async () => {
    close = vi.fn();

    await TestBed.configureTestingModule({
      imports: [UpdatePaymentMethodDialog],
      providers: [
        provideHttpClient(),
        { provide: DIALOG_DATA, useValue: { paymentMethod } },
        { provide: DialogRef, useValue: { close } },
      ],
    }).compileComponents();

    store = TestBed.inject(PaymentMethodsStore);

    fixture = TestBed.createComponent(UpdatePaymentMethodDialog);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('precarga los valores actuales y arranca sin cambios', () => {
    expect(input('#update-name').value).toBe('Cuenta nómina');
    expect(input('#update-number').value).toBe('12341234123412341234');
    expect(input('#update-description').value).toBe('Cuenta del banco');
    expect(select('#update-currency').value).toBe('VES');

    const account = fixture.nativeElement.querySelector(
      'input[type="radio"][value="account"]',
    ) as HTMLInputElement;

    expect(account.checked).toBe(true);
    expect(submitButton().disabled).toBe(true);
  });

  it('muestra el error del nombre y bloquea el guardado', () => {
    const name = input('#update-name');

    type(name, 'ab');
    blur(name);

    expect(errorMessages()).toContain('Mínimo 3 caracteres');
    expect(submitButton().disabled).toBe(true);

    type(name, 'Cuenta principal');

    expect(submitButton().disabled).toBe(false);
  });

  it('recorta el número al pasar de cuenta a tarjeta', () => {
    selectType('card');

    // La cuenta de 20 dígitos conserva sus primeros 16 al pasar a tarjeta.
    expect(input('#update-number').value).toBe('1234123412341234');
    expect(counter('#update-number-counter')).toBe('16/16');
  });

  it('guarda solo el campo cambiado con el id', async () => {
    const updateSpy = vi.spyOn(store, 'updatePaymentMethod').mockResolvedValue(true);

    type(input('#update-name'), '  Cuenta principal  ');
    submitButton().click();

    await vi.waitFor(() =>
      expect(updateSpy).toHaveBeenCalledWith({ id: 2, name: 'Cuenta principal' }),
    );
    await vi.waitFor(() => expect(close).toHaveBeenCalledWith(true));
  });

  it('envía la descripción vacía para poder limpiarla', async () => {
    const updateSpy = vi.spyOn(store, 'updatePaymentMethod').mockResolvedValue(true);

    type(input('#update-description'), '');
    submitButton().click();

    await vi.waitFor(() => expect(updateSpy).toHaveBeenCalledWith({ id: 2, description: '' }));
  });

  it('deja el número opcional en Binance y actualiza la etiqueta', () => {
    selectType('binance');
    type(input('#update-number'), '');

    const label = fixture.nativeElement.querySelector('label[for="update-number"]') as HTMLElement;

    expect(label.textContent).toContain('opcional');
    expect(input('#update-number').getAttribute('aria-required')).toBe('false');
    expect(submitButton().disabled).toBe(false);
  });

  it('cancela sin llamar a la store', () => {
    const updateSpy = vi.spyOn(store, 'updatePaymentMethod');

    (fixture.nativeElement.querySelector('.update__button--ghost') as HTMLButtonElement).click();

    expect(updateSpy).not.toHaveBeenCalled();
    expect(close).toHaveBeenCalledWith(false);
  });

  it('mantiene el modal abierto y los datos cuando el guardado falla', async () => {
    const updateSpy = vi.spyOn(store, 'updatePaymentMethod').mockResolvedValue(false);

    type(input('#update-name'), 'Cuenta principal');
    submitButton().click();

    await vi.waitFor(() => expect(updateSpy).toHaveBeenCalled());

    expect(close).not.toHaveBeenCalled();
    expect(input('#update-name').value).toBe('Cuenta principal');
  });
});
