import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { patchState } from '@ngrx/signals';
import { unprotected } from '@ngrx/signals/testing';
import type { Movement } from '../../../../core/models/movements/movement.model';
import { MovementsStore } from '../../../../core/stores/movements/movements.store';
import { PaymentMethodsStore } from '../../../../core/stores/paymentMethods/payment-method.store';
import type { PaymentMethodModel } from '../../../payment-methods/models/payment-method.model';
import { ListMovements } from './list-movements';

/**
 * Pruebas de la vista completa de movimientos.
 *
 * Cubren la carga inicial de ambas stores, la lista entera con el detalle de
 * método de pago y su conteo, el estado vacío y el reintento tras un error. Las
 * respuestas de las stores se fuerzan con `patchState` para no depender de la
 * latencia de los mocks del API.
 */
describe('ListMovements', () => {
  let fixture: ComponentFixture<ListMovements>;
  let movementsStore: InstanceType<typeof MovementsStore>;
  let paymentMethodsStore: InstanceType<typeof PaymentMethodsStore>;

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

  /** Monta la vista con las respuestas de las stores ya forzadas. */
  async function render(withData: boolean): Promise<void> {
    if (withData) {
      patchState(unprotected(movementsStore), { movements });
      patchState(unprotected(paymentMethodsStore), { paymentMethods });
    }

    fixture = TestBed.createComponent(ListMovements);
    fixture.detectChanges();
    await fixture.whenStable();
  }

  /** Filas pintadas por el componente reutilizado. */
  function rows(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.movement')) as HTMLElement[];
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListMovements],
      providers: [provideHttpClient(), provideRouter([])],
    }).compileComponents();

    movementsStore = TestBed.inject(MovementsStore);
    paymentMethodsStore = TestBed.inject(PaymentMethodsStore);

    vi.spyOn(movementsStore, 'getMovements').mockResolvedValue(undefined);
    vi.spyOn(paymentMethodsStore, 'getPaymentMethods').mockResolvedValue(undefined);
  });

  it('carga movimientos y métodos de pago al entrar', async () => {
    await render(false);

    expect(movementsStore.getMovements).toHaveBeenCalledTimes(1);
    expect(paymentMethodsStore.getPaymentMethods).toHaveBeenCalledTimes(1);
    expect(
      (fixture.nativeElement.querySelector('#list-movements-title') as HTMLElement).textContent,
    ).toBe('Mis movimientos');
  });

  it('lista todos los movimientos con su método de pago y el conteo', async () => {
    await render(true);

    const [newest, oldest] = rows();

    expect(rows().length).toBe(2);
    expect(
      (fixture.nativeElement.querySelector('.section-title') as HTMLElement).textContent?.trim(),
    ).toBe('Todos los movimientos');

    expect(
      (newest.querySelector('.movement__payment-name') as HTMLElement).textContent?.trim(),
    ).toBe('Cuenta bancaria');
    expect(
      (newest.querySelector('.movement__payment-number') as HTMLElement).textContent?.trim(),
    ).toBe('•••• 1234');

    expect(
      (oldest.querySelector('.movement__payment-name') as HTMLElement).textContent?.trim(),
    ).toBe('Tarjeta de crédito');

    expect(
      (fixture.nativeElement.querySelector('.list__count') as HTMLElement).textContent,
    ).toContain('2 movimientos registrados');
  });

  it('muestra el estado vacío cuando no hay movimientos', async () => {
    await render(false);

    expect(
      (fixture.nativeElement.querySelector('.movements__status') as HTMLElement).textContent,
    ).toContain('Aún no registras movimientos');
    expect(fixture.nativeElement.querySelector('.list__count')).toBeNull();
  });

  it('muestra el error y reintenta la carga', async () => {
    patchState(unprotected(movementsStore), { error: 'No se pudieron cargar los movimientos' });

    await render(false);

    const alert = fixture.nativeElement.querySelector('.list__alert') as HTMLElement;

    expect(alert.textContent).toContain('No se pudieron cargar los movimientos');
    // Con la carga fallida no se anuncia "sin movimientos".
    expect(fixture.nativeElement.querySelector('.movements__status')).toBeNull();

    (fixture.nativeElement.querySelector('.list__retry') as HTMLButtonElement).click();
    await fixture.whenStable();

    expect(movementsStore.getMovements).toHaveBeenCalledTimes(2);
  });
});
