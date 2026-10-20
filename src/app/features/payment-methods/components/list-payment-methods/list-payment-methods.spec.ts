import { provideHttpClient } from '@angular/common/http';
import { ApplicationRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { patchState } from '@ngrx/signals';
import { unprotected } from '@ngrx/signals/testing';
import { PaymentMethodsStore } from '../../../../core/stores/paymentMethods/payment-method.store';
import type { PaymentMethodState } from '../../../../core/stores/paymentMethods/payment-method.store';
import type { PaymentMethodModel } from '../../models/payment-method.model';
import { ListPaymentMethods } from './list-payment-methods';

/**
 * Pruebas de la administración de métodos de pago.
 *
 * Cubren la carga al entrar, los estados de carga, error y vacío, la tabla con
 * sus valores por defecto y el borrado con confirmación. La edición todavía no
 * se conecta al modal (Fase 3), así que acá solo se verifica que la acción
 * exista con su nombre accesible.
 */
describe('ListPaymentMethods', () => {
  let fixture: ComponentFixture<ListPaymentMethods>;
  let store: InstanceType<typeof PaymentMethodsStore>;

  /** Métodos de ejemplo: uno completo y otro con los opcionales vacíos. */
  const methods: PaymentMethodModel[] = [
    {
      id: 1,
      name: 'Tarjeta principal',
      type: 'card',
      description: 'Visa del día a día',
      number: '1234123412341234',
      currency: 'USD',
    },
    {
      id: 2,
      name: 'Cuenta nómina',
      type: 'account',
      description: '',
      number: '',
      currency: 'VES',
    },
  ];

  /** Monta la vista con el estado indicado y la carga interceptada. */
  async function render(state: Partial<PaymentMethodState> = {}): Promise<void> {
    vi.spyOn(store, 'getPaymentMethods').mockResolvedValue();

    patchState(unprotected(store), state);

    fixture = TestBed.createComponent(ListPaymentMethods);
    fixture.detectChanges();
    await fixture.whenStable();
  }

  /** Filas de la tabla, como elementos del DOM. */
  function rows(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.methods__row')) as HTMLElement[];
  }

  /** Celda de una fila por su etiqueta móvil. */
  function cell(row: HTMLElement, label: string): HTMLElement {
    return row.querySelector(`[data-label="${label}"]`) as HTMLElement;
  }

  /** Texto normalizado de un elemento. */
  function text(element: Element | null): string {
    return (element?.textContent ?? '').replace(/\s+/g, ' ').trim();
  }

  /** Aplica los cambios pendientes, incluidos los del overlay del CDK. */
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

  /** Abre la confirmación de borrado de la fila indicada. */
  async function openDelete(index: number): Promise<void> {
    const button = fixture.nativeElement.querySelectorAll('.icon-btn--danger')[
      index
    ] as HTMLButtonElement;

    button.click();
    await settle();
  }

  /** Pulsa un botón del diálogo y espera a que se cierre. */
  async function clickDialog(selector: string): Promise<void> {
    (document.querySelector(selector) as HTMLButtonElement).click();
    await waitUntil(() => expect(document.querySelector('.confirm__title')).toBeNull());
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListPaymentMethods],
      providers: [provideHttpClient(), provideRouter([{ path: 'metodos-pago', children: [] }])],
    }).compileComponents();

    store = TestBed.inject(PaymentMethodsStore);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('pide la lista al entrar a la vista', async () => {
    await render();

    expect(store.getPaymentMethods).toHaveBeenCalledTimes(1);
  });

  it('muestra el estado de carga mientras no hay datos', async () => {
    await render({ paymentMethods: null, isLoading: true });

    expect(text(fixture.nativeElement.querySelector('.methods__status'))).toBe(
      'Cargando métodos de pago…',
    );
    expect(fixture.nativeElement.querySelector('.methods__table')).toBeNull();
    expect(fixture.nativeElement.querySelector('.methods__empty')).toBeNull();
  });

  it('invita a agregar el primero cuando la lista está vacía', async () => {
    await render({ paymentMethods: [], isLoading: false });

    expect(text(fixture.nativeElement.querySelector('.methods__empty-title'))).toBe(
      'Aún no tienes métodos de pago.',
    );

    const link = fixture.nativeElement.querySelector('.methods__empty-link') as HTMLAnchorElement;

    expect(link.getAttribute('href')).toBe('/metodos-pago/nuevo');
  });

  it('muestra el error y reintenta la carga', async () => {
    await render({ paymentMethods: null, isLoading: false, error: 'No se pudo cargar' });

    expect(text(fixture.nativeElement.querySelector('.methods__alert'))).toContain(
      'No se pudo cargar',
    );
    expect(fixture.nativeElement.querySelector('.methods__empty')).toBeNull();

    (fixture.nativeElement.querySelector('.methods__retry') as HTMLButtonElement).click();
    await fixture.whenStable();

    expect(store.getPaymentMethods).toHaveBeenCalledTimes(2);
  });

  it('pinta cada método con sus valores y el número enmascarado', async () => {
    await render({ paymentMethods: methods, isLoading: false });

    const tableRows = rows();

    expect(tableRows.length).toBe(2);

    expect(text(tableRows[0].querySelector('.methods__name'))).toBe('Tarjeta principal');
    expect(text(tableRows[0].querySelector('.methods__id'))).toBe('#1');
    expect(text(tableRows[0].querySelector('.methods__chip'))).toBe('Tarjeta de crédito');
    expect(text(cell(tableRows[0], 'Número'))).toBe('•••• 1234');
    expect(text(cell(tableRows[0], 'Moneda'))).toBe('USD');
    expect(text(cell(tableRows[0], 'Descripción'))).toBe('Visa del día a día');
    expect(tableRows[0].getAttribute('data-type')).toBe('card');

    // Opcionales vacíos: la tabla muestra un texto por defecto, no una celda en blanco.
    expect(text(cell(tableRows[1], 'Número'))).toBe('Sin número');
    expect(text(cell(tableRows[1], 'Descripción'))).toBe('Sin descripción');
    expect(tableRows[1].getAttribute('data-type')).toBe('account');

    // Cada celda lleva su etiqueta para la lectura en tarjetas.
    expect(cell(tableRows[0], 'Tipo').getAttribute('data-label')).toBe('Tipo');

    // Acciones con nombre accesible, sin depender del icono.
    expect(
      tableRows[0].querySelector('[aria-label="Actualizar Tarjeta principal"]'),
    ).not.toBeNull();
    expect(tableRows[0].querySelector('[aria-label="Eliminar Tarjeta principal"]')).not.toBeNull();

    expect(text(fixture.nativeElement.querySelector('.methods__count'))).toBe(
      '2 métodos registrados',
    );
  });

  it('no elimina si se cancela la confirmación', async () => {
    const deleteSpy = vi.spyOn(store, 'deletePaymentMethod').mockResolvedValue(true);

    await render({ paymentMethods: methods, isLoading: false });
    await openDelete(0);

    expect(text(document.querySelector('.confirm__title'))).toBe('Eliminar método de pago');
    expect(text(document.querySelector('.confirm__message'))).toContain('Tarjeta principal');

    await clickDialog('.confirm__button--cancel');

    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it('elimina el método confirmado', async () => {
    const deleteSpy = vi.spyOn(store, 'deletePaymentMethod').mockResolvedValue(true);

    await render({ paymentMethods: methods, isLoading: false });
    await openDelete(1);

    await clickDialog('.confirm__button--confirm');

    expect(deleteSpy).toHaveBeenCalledWith(2);
  });
});
