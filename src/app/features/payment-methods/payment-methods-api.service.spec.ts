import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import type { Observable } from 'rxjs';
import { PAYMENT_METHODS_USER_MOCK } from './mocks/payment-methods.response.mock';
import type { PaymentMethodDto } from './models/payment-method.dto';
import { PaymentMethodsApiService } from './payment-methods-api.service';

/** Latencia que simula el servicio con el mock activo. */
const MOCK_DELAY_MS = 500;

/**
 * Pruebas del servicio de métodos de pago contra el mock persistente.
 *
 * El punto central es que el mock deje de ser una constante: un alta, una
 * edición o un borrado tienen que verse en la siguiente lectura, y el seed
 * exportado no debe mutarse. Los timers falsos evitan esperar el `delay(500)` en
 * cada request.
 */
describe('PaymentMethodsApiService (mock)', () => {
  let service: PaymentMethodsApiService;

  /** Resuelve un observable del servicio avanzando su latencia simulada. */
  async function resolve<T>(source: Observable<T>): Promise<T> {
    const result = firstValueFrom(source);

    await vi.advanceTimersByTimeAsync(MOCK_DELAY_MS);

    return result;
  }

  /** Lee la lista actual de métodos. */
  async function list(): Promise<PaymentMethodDto[]> {
    return (await resolve(service.getPaymentMethods())).data;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient()] });

    service = TestBed.inject(PaymentMethodsApiService);

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('agrega el método y lo devuelve en la lista siguiente', async () => {
    const seedLength = PAYMENT_METHODS_USER_MOCK.data.length;

    await resolve(
      service.addPaymentMethod({
        name: 'Binance personal',
        type: 'binance',
        currency: 'USDT',
      }),
    );

    const methods = await list();
    const added = methods[methods.length - 1];

    expect(methods.length).toBe(seedLength + 1);
    expect(added).toMatchObject({
      name: 'Binance personal',
      type: 'binance',
      currency: 'USDT',
      description: '',
      number: '',
    });
    expect(added?.id).toBeGreaterThan(
      Math.max(...PAYMENT_METHODS_USER_MOCK.data.map((paymentMethod) => paymentMethod.id)),
    );
  });

  it('actualiza solo el campo enviado y conserva el resto', async () => {
    await resolve(service.updatePaymentMethod({ id: 1, name: 'Visa principal' }));

    const updated = (await list()).find((paymentMethod) => paymentMethod.id === 1);

    expect(updated).toMatchObject({
      id: 1,
      name: 'Visa principal',
      type: 'card',
      number: '1234123412341234',
      currency: 'USD',
    });
  });

  it('elimina el método indicado y deja el resto', async () => {
    const seedLength = PAYMENT_METHODS_USER_MOCK.data.length;

    await resolve(service.deletePaymentMethod(2));

    const methods = await list();

    expect(methods.some((paymentMethod) => paymentMethod.id === 2)).toBe(false);
    expect(methods.length).toBe(seedLength - 1);
  });

  it('no muta el seed exportado al agregar ni al eliminar', async () => {
    const snapshot = structuredClone(PAYMENT_METHODS_USER_MOCK);

    await resolve(service.addPaymentMethod({ name: 'Efectivo', type: 'account', currency: 'EUR' }));
    await resolve(service.deletePaymentMethod(1));

    expect(PAYMENT_METHODS_USER_MOCK).toEqual(snapshot);
  });

  it('falla al actualizar un método que no existe', async () => {
    await expect(
      firstValueFrom(service.updatePaymentMethod({ id: 999, name: 'Fantasma' })),
    ).rejects.toThrow('El método de pago no existe');
  });
});
