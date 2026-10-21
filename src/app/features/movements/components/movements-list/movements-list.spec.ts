import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { patchState } from '@ngrx/signals';
import { unprotected } from '@ngrx/signals/testing';
import type { Movement } from '../../../../core/models/movements/movement.model';
import { PaymentMethodsStore } from '../../../../core/stores/paymentMethods/payment-method.store';
import type { PaymentMethodModel } from '../../../payment-methods/models/payment-method.model';
import { MovementsList } from './movements-list';

/** Host de prueba: aporta los inputs del componente presentacional. */
@Component({
  imports: [MovementsList],
  selector: 'app-movements-host',
  template: `<app-movements-list
    [movements]="movements()"
    [hasMovements]="hasMovements()"
    [isLoading]="isLoading()"
    [heading]="heading()"
    [showPaymentMethod]="showPaymentMethod()"
  />`,
})
class MovementsHost {
  readonly movements = signal<readonly Movement[]>([]);
  readonly hasMovements = signal(false);
  readonly isLoading = signal(false);
  readonly heading = signal('Últimos movimientos');
  readonly showPaymentMethod = signal(false);
}

/**
 * Pruebas de la lista de movimientos.
 *
 * Cubren sus tres estados (cargando, sin movimientos y con filas), que cada
 * fila exponga los atributos del instructivo con el semáforo por tipo y que el
 * detalle de método de pago solo aparezca con la bandera de la vista completa.
 */
describe('MovementsList', () => {
  let fixture: ComponentFixture<MovementsHost>;
  let paymentMethodsStore: InstanceType<typeof PaymentMethodsStore>;

  const paymentMethods: PaymentMethodModel[] = [
    {
      id: 1,
      name: 'Tarjeta de crédito',
      type: 'card',
      number: '1234123412341234',
      currency: 'USD',
    },
    {
      id: 2,
      name: 'Cuenta bancaria',
      type: 'account',
      number: '12341234123412341234',
      currency: 'VES',
    },
  ];

  const movements: Movement[] = [
    {
      id: '2',
      amount: 100,
      description: 'Pago de servicios',
      date: '2023-07-05',
      type: 'expense',
      paymentMethodId: 2,
      category: 'Servicios',
      currency: 'USD',
    },
    {
      id: '1',
      amount: 50,
      description: 'Compra de productos',
      date: '2023-07-01',
      type: 'income',
      paymentMethodId: 1,
      category: 'Compras',
      currency: 'USD',
    },
  ];

  /** Estado de carga. */
  function status(): HTMLElement {
    return fixture.nativeElement.querySelector('.movements__status') as HTMLElement;
  }

  /** Filas pintadas. */
  function rows(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.movement')) as HTMLElement[];
  }

  /** Texto de la celda indicada de una fila. */
  function cell(row: HTMLElement, selector: string): string {
    return (row.querySelector(selector) as HTMLElement | null)?.textContent?.trim() ?? '';
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [MovementsHost] }).compileComponents();

    paymentMethodsStore = TestBed.inject(PaymentMethodsStore);
    patchState(unprotected(paymentMethodsStore), { paymentMethods });

    fixture = TestBed.createComponent(MovementsHost);
  });

  it('muestra el estado de carga', () => {
    fixture.componentInstance.isLoading.set(true);
    fixture.detectChanges();

    expect(status().textContent).toContain('Cargando movimientos');
    expect(fixture.nativeElement.querySelector('.movements__list')).toBeNull();
  });

  it('avisa cuando el usuario no registró movimientos', () => {
    fixture.detectChanges();

    expect(status().textContent).toContain('Aún no registras movimientos');
  });

  it('pinta cada movimiento con sus atributos y el semáforo por tipo', () => {
    fixture.componentInstance.movements.set(movements);
    fixture.componentInstance.hasMovements.set(true);
    fixture.detectChanges();

    const [expense, income] = rows();

    expect(rows().length).toBe(2);
    expect(expense.getAttribute('data-type')).toBe('expense');
    expect(cell(expense, '.movement__description')).toBe('Pago de servicios');
    expect(cell(expense, '.movement__type')).toBe('Egreso');
    expect(cell(expense, '.movement__currency')).toBe('USD');
    expect(cell(expense, '.movement__amount')).toContain('100');
    expect(cell(expense, '.movement__date')).toMatch(/(^|\D)0?5(\D|$)/);

    expect(income.getAttribute('data-type')).toBe('income');
    expect(cell(income, '.movement__type')).toBe('Ingreso');
  });

  it('usa el título que recibe, con "Últimos movimientos" por defecto', () => {
    const title = (): string =>
      (fixture.nativeElement.querySelector('.section-title') as HTMLElement).textContent?.trim() ??
      '';

    fixture.componentInstance.movements.set(movements);
    fixture.componentInstance.hasMovements.set(true);
    fixture.detectChanges();

    expect(title()).toBe('Últimos movimientos');

    fixture.componentInstance.heading.set('Todos los movimientos');
    fixture.detectChanges();

    expect(title()).toBe('Todos los movimientos');
  });

  it('resuelve nombre y número del método de pago solo con la bandera activa', () => {
    fixture.componentInstance.movements.set(movements);
    fixture.componentInstance.hasMovements.set(true);
    fixture.detectChanges();

    // En el resumen (bandera apagada) la fila no menciona el método de pago.
    expect(rows()[0].querySelector('.movement__payment')).toBeNull();

    fixture.componentInstance.showPaymentMethod.set(true);
    fixture.detectChanges();

    const [expense, income] = rows();

    expect(cell(expense, '.movement__payment-name')).toBe('Cuenta bancaria');
    expect(cell(expense, '.movement__payment-number')).toBe('•••• 1234');
    expect(cell(income, '.movement__payment-name')).toBe('Tarjeta de crédito');
    expect(cell(income, '.movement__payment-number')).toBe('•••• 1234');
  });

  it('muestra N/A cuando el movimiento no tiene método de pago o el id no existe', () => {
    fixture.componentInstance.movements.set([
      { ...movements[0], id: '3', paymentMethodId: undefined },
      { ...movements[0], id: '4', paymentMethodId: 99 },
    ]);
    fixture.componentInstance.hasMovements.set(true);
    fixture.componentInstance.showPaymentMethod.set(true);
    fixture.detectChanges();

    const rowsWithPayment = rows();

    for (const row of rowsWithPayment) {
      expect(cell(row, '.movement__payment-name')).toBe('N/A');
      expect(cell(row, '.movement__payment-number')).toBe('N/A');
    }
  });
});
